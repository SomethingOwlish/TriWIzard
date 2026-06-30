/**
 * Scene data layer (B3.1 / B3.2) — the table's one *live* surface.
 *
 * The whole product is save→publish; the Scene is the single exception that
 * runs live. To keep the free Spark read budget intact (50K reads/day) the live
 * footprint is one tiny well-known document, `sceneTable/main`, that every viewer
 * at the table subscribes to with a single `onSnapshot`. It holds:
 *   - the active scene's meta (name / background / notes) and its NPC tokens,
 *   - the participants in play, each with a **scene-local** condition tracker
 *     pre-loaded from their card (never written back to the card),
 *   - the conflict turn order, and
 *   - `lastRolls` — each participant's most recent roll, the live roll board.
 *
 * The GM authors a *library* of scenes in `scenes/{id}` (not live; players never
 * read them — only the activated copy mirrored into `sceneTable/main`). Every
 * roll is also appended to a flat, **single shared stream** `rolls/{id}` that the
 * log reads on demand (one getDocs), never live — so history costs nothing until
 * someone opens it.
 *
 * Write authority: the GM owns `sceneTable/main`; a player may only touch
 * `lastRolls` (their own roll), enforced in firestore.rules.
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
import type { ConditionLevel, HouseId, StatKey } from './pbta';
import type { Band } from './pbtaDice';

const SCENES = 'scenes';
const ROLLS = 'rolls';
const TABLE = 'sceneTable';
const TABLE_ID = 'main';
const SEALED = 'The hall is dark — no firebase config is set.';

// ---- NPCs ------------------------------------------------------------------

export interface SceneNpc {
  id: string;
  name: string;
  note: string;
  /** Shown to players, or kept behind the screen (soft hide — UI only). */
  shown: boolean;
}

// ---- Authored scene (the GM's library) -------------------------------------

export interface AuthoredScene {
  id: string;
  app: 'ttrpg';
  name: string;
  background: string;
  notes: string;
  npcs: SceneNpc[];
  createdAt?: number;
  updatedAt?: number;
}

export type SceneInput = Pick<AuthoredScene, 'name' | 'background' | 'notes' | 'npcs'>;

export function blankScene(): SceneInput {
  return { name: '', background: '', notes: '', npcs: [] };
}

// ---- Live participants + rolls ---------------------------------------------

export interface SceneParticipant {
  /** Stable key — the character id for a PC, an invented id for an NPC. */
  key: string;
  kind: 'pc' | 'npc';
  /** PC link back to `characters/{id}`. */
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
}

export interface LastRoll {
  key: string;
  name: string;
  /** e.g. "2d6 +1 · Magic" */
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
  /** Participant keys in initiative order (highest first). */
  order: string[];
  actingIndex: number;
  round: number;
}

export interface SceneTable {
  activeSceneId: string | null;
  scene: { name: string; background: string; notes: string } | null;
  npcs: SceneNpc[];
  participants: SceneParticipant[];
  turn: TurnState | null;
  lastRolls: Record<string, LastRoll>;
  updatedAt?: number;
}

export interface RollEntry extends LastRoll {
  id: string;
  uid: string | null;
  sceneName: string;
  createdAt?: number;
}

const EMPTY_TABLE: SceneTable = {
  activeSceneId: null, scene: null, npcs: [], participants: [], turn: null, lastRolls: {},
};

function toScene(id: string, data: Record<string, unknown>): AuthoredScene {
  return {
    id,
    app: 'ttrpg',
    name: (data.name as string) ?? '',
    background: (data.background as string) ?? '',
    notes: (data.notes as string) ?? '',
    npcs: (data.npcs as SceneNpc[]) ?? [],
    createdAt: data.createdAt as number | undefined,
    updatedAt: data.updatedAt as number | undefined,
  };
}

function toTable(data: Record<string, unknown> | undefined): SceneTable {
  if (!data) return { ...EMPTY_TABLE };
  return {
    activeSceneId: (data.activeSceneId as string | null) ?? null,
    scene: (data.scene as SceneTable['scene']) ?? null,
    npcs: (data.npcs as SceneNpc[]) ?? [],
    participants: (data.participants as SceneParticipant[]) ?? [],
    turn: (data.turn as TurnState | null) ?? null,
    lastRolls: (data.lastRolls as Record<string, LastRoll>) ?? {},
    updatedAt: data.updatedAt as number | undefined,
  };
}

// ---- The live table (everyone at the table) --------------------------------

/** Subscribe to the one live document. Returns an unsubscribe fn. */
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

/** GM write to the live table (scene/npcs/participants/turn/activeSceneId). */
export async function updateTable(patch: Partial<SceneTable>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await setDoc(doc(db, TABLE, TABLE_ID), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

/** GM: make an authored scene the active one, mirroring its meta + NPCs live. */
export async function activateScene(scene: AuthoredScene): Promise<void> {
  await updateTable({
    activeSceneId: scene.id,
    scene: { name: scene.name, background: scene.background, notes: scene.notes },
    npcs: scene.npcs,
  });
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

/**
 * Record a roll: append it to the shared stream AND set it as the roller's live
 * last roll. The `lastRolls` write is the only one a player is permitted to make
 * to the live table (see firestore.rules), so this is callable by players too.
 */
export async function recordRoll(roll: LastRoll, uid: string | null, sceneName: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await addDoc(collection(db, ROLLS), {
    app: 'ttrpg', ...roll, uid: uid ?? null, sceneName, createdAt: serverTimestamp(),
  });
  await setDoc(
    doc(db, TABLE, TABLE_ID),
    { lastRolls: { [roll.key]: roll }, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Read the most recent rolls — the on-demand log (not live). */
export async function fetchRollLog(max = 50): Promise<RollEntry[]> {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(
    query(collection(db, ROLLS), where('app', '==', 'ttrpg'), orderBy('createdAt', 'desc'), fbLimit(max)),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
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
  });
}
