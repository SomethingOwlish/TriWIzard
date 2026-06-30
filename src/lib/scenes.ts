/**
 * Scene data layer (B3.1 / B3.2) — the table's one *live* surface.
 *
 * The Scene is the single live exception to save→publish. The live footprint is
 * one well-known document, `sceneTable/main`, that every viewer subscribes to
 * with a single `onSnapshot`. It models a shared **2×2 wall of four slots**: the
 * GM *raises* authored scenes into chosen slots (or fills the whole wall), so
 * several scenes can stand at once. Each slot carries one image + text. The doc
 * also holds the participants (with scene-local condition trackers), the NPC
 * tokens of the raised scenes, and the conflict turn order.
 *
 * Rolls are NOT kept on the live table — a player only ever creates a doc in the
 * shared, append-only `rolls/{id}` stream (the live roll board is derived from a
 * small live query over it, and the deeper log is fetched on demand). This keeps
 * the write surface tiny and the rules simple: the GM owns sceneTable/main, and
 * any member may append their own roll.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { ConditionLevel, HouseId, KnownMove, StatKey } from './pbta';
import type { Band } from './pbtaDice';

const SCENES = 'scenes';
const ROLLS = 'rolls';
const TABLE = 'sceneTable';
const TABLE_ID = 'main';
const SEALED = 'The hall is dark — no firebase config is set.';

/** The four wall slots, plus the whole-wall option. */
export const SLOT_COUNT = 4;
export type SlotTarget = 0 | 1 | 2 | 3 | 'full';

// ---- NPCs ------------------------------------------------------------------

export interface SceneNpc {
  id: string;
  name: string;
  note: string;
  /** Shown to players, or kept behind the screen (soft hide — UI only). */
  shown: boolean;
  /** The raised scene this token came from, so deactivating it cleans up. */
  src?: string;
}

// ---- Authored scene (the GM's library) -------------------------------------

export interface AuthoredScene {
  id: string;
  app: 'ttrpg';
  name: string;
  /** Image URL — shown as the slot's cover background when set. */
  image: string;
  /** Falls back to text when no image is set (or as a caption over the image). */
  text: string;
  /** Behind the screen — never shown to players. */
  notes: string;
  npcs: SceneNpc[];
  createdAt?: number;
  updatedAt?: number;
}

export type SceneInput = Pick<AuthoredScene, 'name' | 'image' | 'text' | 'notes' | 'npcs'>;

export function blankScene(): SceneInput {
  return { name: '', image: '', text: '', notes: '', npcs: [] };
}

// ---- Live wall: slots ------------------------------------------------------

/** A scene pinned to a slot — denormalised so players read only the live doc. */
export interface ActiveSlot {
  sceneId: string;
  name: string;
  image: string;
  text: string;
}

// ---- Live participants + rolls ---------------------------------------------

export interface SceneParticipant {
  /** Stable key — the character id for a PC, an invented id for an NPC. */
  key: string;
  kind: 'pc' | 'npc';
  charId?: string;
  /** The owning account, so a player may roll only as their own character. */
  uid?: string;
  name: string;
  house: HouseId | '';
  /** Base stats snapshotted from the published card when added. */
  stats: Record<StatKey, number>;
  /** Scene-local harm track, pre-loaded from the card, edited only in the scene. */
  conditions: Record<StatKey, ConditionLevel>;
  neutralized: boolean;
  /** Known moves snapshotted from the card — a player may roll only these. */
  moves: KnownMove[];
}

export interface LastRoll {
  key: string;
  name: string;
  label: string;
  moveName?: string;
  stat?: StatKey | null;
  dice: [number, number];
  mod: number;
  total: number;
  band: Band;
  snake: boolean;
  /** Client timestamp (ms) — display only. */
  at: number;
}

export interface TurnState {
  order: string[];
  actingIndex: number;
  round: number;
}

export interface SceneTable {
  /** Four wall slots (the 2×2). A null slot is empty. */
  slots: (ActiveSlot | null)[];
  /** When set, one scene fills the whole wall, overriding the slots. */
  full: ActiveSlot | null;
  npcs: SceneNpc[];
  participants: SceneParticipant[];
  turn: TurnState | null;
  updatedAt?: number;
}

export interface RollEntry extends LastRoll {
  id: string;
  uid: string | null;
  sceneName: string;
  createdAt?: number;
}

const EMPTY_TABLE: SceneTable = {
  slots: [null, null, null, null], full: null, npcs: [], participants: [], turn: null,
};

function toScene(id: string, data: Record<string, unknown>): AuthoredScene {
  return {
    id,
    app: 'ttrpg',
    name: (data.name as string) ?? '',
    image: (data.image as string) ?? '',
    text: (data.text as string) ?? '',
    notes: (data.notes as string) ?? '',
    npcs: (data.npcs as SceneNpc[]) ?? [],
    createdAt: data.createdAt as number | undefined,
    updatedAt: data.updatedAt as number | undefined,
  };
}

function toTable(data: Record<string, unknown> | undefined): SceneTable {
  if (!data) return { slots: [null, null, null, null], full: null, npcs: [], participants: [], turn: null };
  const slots = (data.slots as (ActiveSlot | null)[]) ?? [null, null, null, null];
  while (slots.length < SLOT_COUNT) slots.push(null);
  return {
    slots: slots.slice(0, SLOT_COUNT),
    full: (data.full as ActiveSlot | null) ?? null,
    npcs: (data.npcs as SceneNpc[]) ?? [],
    participants: (data.participants as SceneParticipant[]) ?? [],
    turn: (data.turn as TurnState | null) ?? null,
    updatedAt: data.updatedAt as number | undefined,
  };
}

// ---- The live table (everyone at the table) --------------------------------

export function watchSceneTable(cb: (t: SceneTable) => void): () => void {
  if (!isFirebaseConfigured) {
    cb({ ...EMPTY_TABLE });
    return () => {};
  }
  return onSnapshot(
    doc(db, TABLE, TABLE_ID),
    (snap) => cb(toTable(snap.exists() ? snap.data() : undefined)),
    () => cb({ ...EMPTY_TABLE }),
  );
}

/** GM write to the live table (slots/full/npcs/participants/turn). */
export async function updateTable(patch: Partial<SceneTable>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await setDoc(doc(db, TABLE, TABLE_ID), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

// ---- The GM's scene library ------------------------------------------------

export function watchScenes(cb: (rows: AuthoredScene[]) => void): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, SCENES), where('app', '==', 'ttrpg'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toScene(d.id, d.data()))),
    () => cb([]),
  );
}

export async function createScene(input: SceneInput): Promise<string> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = await addDoc(collection(db, SCENES), {
    app: 'ttrpg', ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function saveScene(id: string, input: SceneInput): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await setDoc(doc(db, SCENES, id), { app: 'ttrpg', ...input, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteScene(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await deleteDoc(doc(db, SCENES, id));
}

// ---- Rolls -----------------------------------------------------------------

/** Drop undefined fields — Firestore rejects them (e.g. an absent `moveName`). */
function clean(roll: LastRoll): LastRoll {
  const out = {} as Record<string, unknown>;
  for (const [k, v] of Object.entries(roll)) if (v !== undefined) out[k] = v;
  return out as unknown as LastRoll;
}

/**
 * Append a roll to the shared stream. The live roll board derives each
 * participant's last roll from `watchRecentRolls`, so this is the only write a
 * player makes — no touch of the GM-owned live table.
 */
export async function recordRoll(roll: LastRoll, uid: string | null, sceneName: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await addDoc(collection(db, ROLLS), {
    app: 'ttrpg', ...clean(roll), uid: uid ?? null, sceneName, createdAt: serverTimestamp(),
  });
}

function toRoll(id: string, data: Record<string, unknown>): RollEntry {
  return {
    id,
    key: (data.key as string) ?? '',
    name: (data.name as string) ?? '',
    label: (data.label as string) ?? '',
    moveName: data.moveName as string | undefined,
    stat: (data.stat as StatKey | null) ?? null,
    dice: (data.dice as [number, number]) ?? [0, 0],
    mod: (data.mod as number) ?? 0,
    total: (data.total as number) ?? 0,
    band: (data.band as Band) ?? 'miss',
    snake: Boolean(data.snake),
    at: (data.at as number) ?? 0,
    uid: (data.uid as string | null) ?? null,
    sceneName: (data.sceneName as string) ?? '',
    createdAt: data.createdAt as number | undefined,
  };
}

// Both roll queries order by `createdAt` only (no `app` filter) so they rely on
// Firestore's automatic single-field index and need NO composite index deploy —
// every roll is `app: 'ttrpg'` today, and the read rule already gates the hall.

/** Live feed of the most recent rolls — drives the live roll board. */
export function watchRecentRolls(cb: (rows: RollEntry[]) => void, max = 40): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, ROLLS), orderBy('createdAt', 'desc'), fbLimit(max));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toRoll(d.id, d.data()))),
    () => cb([]),
  );
}

/** Read a deeper slice of the log on demand (not live). */
export async function fetchRollLog(max = 60): Promise<RollEntry[]> {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(query(collection(db, ROLLS), orderBy('createdAt', 'desc'), fbLimit(max)));
  return snap.docs.map((d) => toRoll(d.id, d.data()));
}

/** Reduce a roll feed to each participant's most recent roll. */
export function lastRollByKey(rolls: RollEntry[]): Record<string, RollEntry> {
  const out: Record<string, RollEntry> = {};
  for (const r of rolls) if (!out[r.key]) out[r.key] = r; // feed is newest-first
  return out;
}
