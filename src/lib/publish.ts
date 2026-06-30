/**
 * Save → publish primitive (B1.6).
 *
 * The whole product works by **save then publish**, never live editing (the one
 * exception is the TTRPG Scene, T3). This is the shared util every authored
 * module — character pages, lore, plot, rules, CMS pages — will build on, so the
 * draft/published split is defined once, here.
 *
 * A publishable document stores two faces of its content:
 *   - `draft`     — the working copy the author edits and saves freely.
 *   - `published` — the sealed copy readers see. Only a `publish` reveals it.
 *
 * `state` tracks where the two stand relative to each other so the UI can show
 * "unpublished changes" without diffing payloads:
 *   - `draft`     — never published; readers see nothing.
 *   - `published` — published and unchanged since.
 *   - `dirty`     — published once, but the draft has moved ahead.
 */
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export type PublishState = 'draft' | 'published' | 'dirty';

export interface Publishable<T> {
  draft: T | null;
  published: T | null;
  state: PublishState;
  updatedAt?: number;
  publishedAt?: number;
  /** uid of whoever last touched the draft. */
  updatedBy?: string | null;
}

const SEALED = 'This ledger is sealed — no firebase config is set.';

function reveal<T>(data: Record<string, unknown> | undefined): Publishable<T> {
  return {
    draft: (data?.draft as T) ?? null,
    published: (data?.published as T) ?? null,
    state: (data?.state as PublishState) ?? 'draft',
    updatedAt: data?.updatedAt as number | undefined,
    publishedAt: data?.publishedAt as number | undefined,
    updatedBy: (data?.updatedBy as string) ?? null,
  };
}

/**
 * Save a draft. Creates the document if absent. Leaves any published copy
 * untouched but marks the record `dirty` when it had already been published —
 * so readers keep the sealed copy until the author chooses to publish again.
 */
export async function saveDraft<T>(
  path: string,
  segments: string[],
  draft: T,
  updatedBy?: string,
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = doc(db, path, ...segments);
  const snap = await getDoc(ref);
  const wasPublished =
    snap.exists() && (snap.data().state === 'published' || snap.data().state === 'dirty');
  await setDoc(
    ref,
    {
      draft,
      state: wasPublished ? 'dirty' : 'draft',
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy ?? null,
    },
    { merge: true },
  );
}

/**
 * Publish — seal the current draft as the copy readers see. No-op-safe: if there
 * is no draft to publish it throws rather than sealing nothing.
 */
export async function publishDoc<T>(path: string, segments: string[]): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = doc(db, path, ...segments);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Nothing is written here to publish.');
  const draft = snap.data().draft as T | undefined;
  if (draft === undefined || draft === null) throw new Error('There is no draft to publish.');
  await updateDoc(ref, {
    published: draft,
    state: 'published',
    publishedAt: serverTimestamp(),
  });
}

/** Discard draft edits, falling back to the published copy (or empty if none). */
export async function revertDraft<T>(path: string, segments: string[]): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = doc(db, path, ...segments);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const published = snap.data().published as T | undefined;
  await updateDoc(ref, {
    draft: published ?? null,
    state: published === undefined || published === null ? 'draft' : 'published',
    updatedAt: serverTimestamp(),
  });
}

/** One-shot read of a publishable record. */
export async function readPublishable<T>(
  path: string,
  segments: string[],
): Promise<Publishable<T> | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, path, ...segments));
  return snap.exists() ? reveal<T>(snap.data()) : null;
}
