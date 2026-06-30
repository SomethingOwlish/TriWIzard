/**
 * Move library data layer (B3.4) — the `moves` collection.
 *
 * The GM curates one shared catalogue of moves for the table; characters draw
 * their known moves from it (the per-card list lives on the Tier-2 sheet) and
 * the live scene roller resolves a move's outcome band against its text here.
 *
 * Moves carry the full schema taxonomy: kind (basic/general/house/personal),
 * house + Simpla/Maxima/Ultima gating, XP cost, the governing stat, the trigger,
 * and outcome-by-band text. A move is hidden from players until the GM
 * **provides** it (`published: true`) — the catalogue's analogue of save→publish.
 * (XP-spend *enforcement* stays in the Tier-2 advancement gate; here the cost is
 * reference data, not a ledger.)
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  BASIC_MOVES, GENERAL_MOVES, type HouseId, type MoveKind, type StatKey, type Tier,
} from './pbta';
import type { MoveOutcomes } from './pbtaDice';

const COLLECTION = 'moves';
const SEALED = 'The grimoire is sealed — no firebase config is set.';

export interface MoveEntry {
  id: string;
  app: 'ttrpg';
  name: string;
  ru: string;
  kind: MoveKind;
  /** House move gating — the house whose pool this belongs to. */
  house: HouseId | null;
  /** Discipline tier required (Simpla/Maxima/Ultima). */
  tier: Tier | null;
  /** XP to learn after creation (general/house/personal). */
  xp: number | null;
  /** The stat usually rolled, when fixed. */
  stat: StatKey | null;
  trigger: string;
  /** Outcome text keyed by the dice ladder band. */
  outcomes: MoveOutcomes;
  crossHouseNote: string;
  /** Provided to the players, or held behind the screen. */
  published: boolean;
  /** Links a seeded entry back to its catalogue id, so seeding never duplicates. */
  srcId: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

/** The editable shape (everything but the server-managed id/stamps). */
export type MoveInput = Omit<MoveEntry, 'id' | 'app' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

/** A blank move for the GM's editor. */
export function blankMove(): MoveInput {
  return {
    name: '', ru: '', kind: 'house', house: null, tier: null, xp: null,
    stat: null, trigger: '', outcomes: {}, crossHouseNote: '', published: false, srcId: null,
  };
}

function toEntry(id: string, data: Record<string, unknown>): MoveEntry {
  return {
    id,
    app: 'ttrpg',
    name: (data.name as string) ?? '',
    ru: (data.ru as string) ?? '',
    kind: (data.kind as MoveKind) ?? 'house',
    house: (data.house as HouseId | null) ?? null,
    tier: (data.tier as Tier | null) ?? null,
    xp: (data.xp as number | null) ?? null,
    stat: (data.stat as StatKey | null) ?? null,
    trigger: (data.trigger as string) ?? '',
    outcomes: (data.outcomes as MoveOutcomes) ?? {},
    crossHouseNote: (data.crossHouseNote as string) ?? '',
    published: Boolean(data.published),
    srcId: (data.srcId as string | null) ?? null,
    createdBy: (data.createdBy as string) ?? null,
    updatedBy: (data.updatedBy as string) ?? null,
    createdAt: data.createdAt as number | undefined,
    updatedAt: data.updatedAt as number | undefined,
  };
}

const KIND_ORDER: Record<MoveKind, number> = { basic: 0, general: 1, house: 2, personal: 3 };

/** Catalogue order: by kind, then name. */
export function sortMoves(rows: MoveEntry[]): MoveEntry[] {
  return [...rows].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.name.localeCompare(b.name));
}

/** Subscribe to the whole catalogue — the GM's view. */
export function watchMoves(cb: (rows: MoveEntry[]) => void): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where('app', '==', 'ttrpg'));
  return onSnapshot(
    q,
    (snap) => cb(sortMoves(snap.docs.map((d) => toEntry(d.id, d.data())))),
    () => cb([]),
  );
}

/** Subscribe to the provided moves only — the player's reference. */
export function watchPublishedMoves(cb: (rows: MoveEntry[]) => void): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where('app', '==', 'ttrpg'), where('published', '==', true));
  return onSnapshot(
    q,
    (snap) => cb(sortMoves(snap.docs.map((d) => toEntry(d.id, d.data())))),
    () => cb([]),
  );
}

export async function createMove(input: MoveInput, createdBy?: string): Promise<string> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = await addDoc(collection(db, COLLECTION), {
    app: 'ttrpg',
    ...input,
    createdBy: createdBy ?? null,
    updatedBy: createdBy ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function saveMove(id: string, input: MoveInput, updatedBy?: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await setDoc(
    doc(db, COLLECTION, id),
    { app: 'ttrpg', ...input, updatedBy: updatedBy ?? null, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function setMovePublished(id: string, published: boolean): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await setDoc(doc(db, COLLECTION, id), { published, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteMove(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Seed the catalogue from the canon basic + general moves in pbta.ts. Idempotent:
 * it reads what is already there and only writes the entries whose `srcId` is
 * absent, so the GM may press it again after adding their own house moves.
 * Returns how many were added.
 */
export async function seedCanon(createdBy?: string): Promise<number> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const existing = await getDocs(query(collection(db, COLLECTION), where('app', '==', 'ttrpg')));
  const haveSrc = new Set(existing.docs.map((d) => d.data().srcId).filter(Boolean));
  const canon = [...BASIC_MOVES, ...GENERAL_MOVES];
  let added = 0;
  for (const m of canon) {
    if (haveSrc.has(m.id)) continue;
    await addDoc(collection(db, COLLECTION), {
      app: 'ttrpg',
      name: m.en,
      ru: m.ru,
      kind: m.kind,
      house: null,
      tier: null,
      xp: m.xp ?? null,
      stat: m.stat ?? null,
      trigger: m.trigger,
      outcomes: {},
      crossHouseNote: '',
      published: true,
      srcId: m.id,
      createdBy: createdBy ?? null,
      updatedBy: createdBy ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    added += 1;
  }
  return added;
}
