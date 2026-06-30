/**
 * Authored-collection save → publish layer (Tier 4).
 *
 * The Tier-1 `publish.ts` primitive defines the draft/published split for a
 * single document at a known path. The Tier-4 knowledge modules (lore entries,
 * rulebook entries, NPC dossiers) each hold MANY authored documents in one
 * collection, and players must be able to *list* the ones provided to them. A
 * Firestore query can only return documents the reader is permitted to read, so
 * every authored doc carries a denormalised `isPublished` flag the player query
 * filters on — the collection analogue of `publish.ts`'s `state`.
 *
 * Reads are **on demand** (`getDocs` when a tab opens, re-fetch after a write),
 * never live: only the Scene module holds `onSnapshot`, per the free-tier rule.
 *
 * Each doc stores two faces of its content, exactly like `publish.ts`:
 *   - `draft`     — the working copy the GM edits and saves freely.
 *   - `published` — the sealed copy players see (null until first published).
 * `state` ∈ draft | published | dirty mirrors `publish.ts`. Module-specific
 * fields (a lore node's `parentId`, a rulebook entry's `kind`, an NPC's hidden
 * `secret`) ride alongside via the `extra` bag and are spread back on read.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { PublishState } from './publish';

export const AUTHORED_SEALED = 'This ledger is sealed — no firebase config is set.';

/** A draft/published document living in an authored collection. */
export interface AuthoredDoc<T> {
  id: string;
  app: 'ttrpg';
  draft: T;
  published: T | null;
  state: PublishState;
  /** Denormalised `state !== 'draft'` — the player-queryable visibility flag. */
  isPublished: boolean;
  /** Sibling ordering; defaults to creation time so new entries sort last. */
  order: number;
  createdAt?: number;
  updatedAt?: number;
  publishedAt?: number;
  updatedBy?: string | null;
}

/** Normalise a raw snapshot, carrying any module-specific extras through. */
export function readAuthored<T>(id: string, data: Record<string, unknown>): AuthoredDoc<T> {
  return {
    ...(data as object),
    id,
    app: 'ttrpg',
    draft: (data.draft as T) ?? (null as unknown as T),
    published: (data.published as T) ?? null,
    state: (data.state as PublishState) ?? 'draft',
    isPublished: (data.isPublished as boolean) ?? false,
    order: (data.order as number) ?? 0,
    createdAt: data.createdAt as number | undefined,
    updatedAt: data.updatedAt as number | undefined,
    publishedAt: data.publishedAt as number | undefined,
    updatedBy: (data.updatedBy as string) ?? null,
  } as AuthoredDoc<T>;
}

/**
 * Fetch a collection on demand. The GM sees everything in the hall
 * (`where app == 'ttrpg'`); a player sees only what has been provided
 * (`where isPublished == true`) — both single-field equalities, so no composite
 * index is needed. Results are sorted by `order`.
 */
export async function fetchAuthored<T>(
  coll: string,
  gm: boolean,
): Promise<AuthoredDoc<T>[]> {
  if (!isFirebaseConfigured) return [];
  const q = gm
    ? query(collection(db, coll), where('app', '==', 'ttrpg'))
    : query(collection(db, coll), where('isPublished', '==', true));
  const snap = await getDocs(q);
  return snap.docs
    .map((s) => readAuthored<T>(s.id, s.data()))
    .sort((a, b) => a.order - b.order);
}

/** Create a new authored doc (born as an unpublished draft). */
export async function createAuthored<T>(
  coll: string,
  draft: T,
  extra: Record<string, unknown> = {},
  uid?: string | null,
): Promise<string> {
  if (!isFirebaseConfigured) throw new Error(AUTHORED_SEALED);
  const ref = await addDoc(collection(db, coll), {
    app: 'ttrpg',
    draft,
    published: null,
    state: 'draft' as PublishState,
    isPublished: false,
    order: Date.now(),
    ...extra,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: uid ?? null,
  });
  return ref.id;
}

/**
 * Save a draft. Leaves the published copy untouched but marks the record
 * `dirty` if it had already been published, so players keep the sealed copy
 * until the GM publishes again. `isPublished` is unchanged (the published copy
 * still exists).
 */
export async function saveAuthoredDraft<T>(
  coll: string,
  id: string,
  draft: T,
  extra: Record<string, unknown> = {},
  uid?: string | null,
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(AUTHORED_SEALED);
  const ref = doc(db, coll, id);
  const snap = await getDoc(ref);
  const wasPublished =
    snap.exists() && (snap.data().state === 'published' || snap.data().state === 'dirty');
  await updateDoc(ref, {
    draft,
    ...extra,
    state: wasPublished ? 'dirty' : 'draft',
    updatedAt: serverTimestamp(),
    updatedBy: uid ?? null,
  });
}

/** Publish — seal the current draft as the copy players read. */
export async function publishAuthored<T>(coll: string, id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(AUTHORED_SEALED);
  const ref = doc(db, coll, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Nothing is written here to publish.');
  const draft = snap.data().draft as T | undefined;
  if (draft === undefined || draft === null) throw new Error('There is no draft to publish.');
  await updateDoc(ref, {
    published: draft,
    state: 'published' as PublishState,
    isPublished: true,
    publishedAt: serverTimestamp(),
  });
}

/** Withdraw — hide from players again (the draft is kept for further editing). */
export async function unpublishAuthored(coll: string, id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(AUTHORED_SEALED);
  await updateDoc(doc(db, coll, id), {
    published: null,
    state: 'draft' as PublishState,
    isPublished: false,
  });
}

/** Patch module-specific fields (e.g. a lore node's parent, an NPC's position). */
export async function patchAuthored(
  coll: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(AUTHORED_SEALED);
  await updateDoc(doc(db, coll, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteAuthored(coll: string, id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(AUTHORED_SEALED);
  await deleteDoc(doc(db, coll, id));
}
