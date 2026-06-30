/**
 * Chronology data layer (B4.2) — the `chronology` collection.
 *
 * Two chronologies, both GM-authored and read by players (save → publish):
 *   - `chronology/world`     — the shared campaign timeline every player reads.
 *   - `chronology/{charId}`  — a private timeline per character; a player reads
 *     only their own (the doc carries `ownerUid` so the rules can gate it).
 *
 * Documents use deterministic ids, so they are written with `setDoc(merge)`
 * (create-if-absent) rather than the auto-id `addDoc` path in `authored.ts`,
 * but they wear the same draft/published/state/isPublished shape. Reads are on
 * demand: the whole timeline is one document, so one `getDoc` = one read.
 */
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { type AuthoredDoc, readAuthored } from './authored';

const COLL = 'chronology';
export const WORLD_ID = 'world';
const SEALED = 'The chronicle is sealed — no firebase config is set.';

export interface ChronEvent {
  id: string;
  /** Era / date label shown on the timeline node (e.g. "Session IV", "Year 312"). */
  time: string;
  title: string;
  body: string;
  tone: 'neutral' | 'accent' | 'alive' | 'dead';
}

export interface ChronContent {
  events: ChronEvent[];
}

export interface Chronicle extends AuthoredDoc<ChronContent> {
  kind: 'world' | 'character';
  /** Owning account for a character chronicle; null for the world timeline. */
  ownerUid: string | null;
  /** Cached character name for the GM picker. */
  charName: string;
}

export function blankChronicle(): ChronContent {
  return { events: [] };
}

function shape(id: string, data: Record<string, unknown> | undefined): Chronicle | null {
  if (!data) return null;
  const base = readAuthored<ChronContent>(id, data);
  return {
    ...base,
    draft: base.draft ?? { events: [] },
    kind: (data.kind as 'world' | 'character') ?? (id === WORLD_ID ? 'world' : 'character'),
    ownerUid: (data.ownerUid as string) ?? null,
    charName: (data.charName as string) ?? '',
  };
}

/** One-shot read of a single chronicle (world or a character's). */
export async function fetchChronicle(id: string): Promise<Chronicle | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, COLL, id));
  return snap.exists() ? shape(id, snap.data()) : null;
}

/** Read the world chronicle plus a player's own character chronicles. */
export async function fetchPlayerChronicles(
  charIds: string[],
): Promise<{ world: Chronicle | null; perChar: Chronicle[] }> {
  if (!isFirebaseConfigured) return { world: null, perChar: [] };
  const world = await fetchChronicle(WORLD_ID);
  const perChar: Chronicle[] = [];
  for (const cid of charIds) {
    const c = await fetchChronicle(cid);
    if (c && c.isPublished) perChar.push(c);
  }
  return { world: world && world.isPublished ? world : null, perChar };
}

/** Save a chronicle draft, creating the doc if absent. */
export async function saveChronicleDraft(
  id: string,
  content: ChronContent,
  extra: { kind: 'world' | 'character'; ownerUid?: string | null; charName?: string },
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = doc(db, COLL, id);
  const snap = await getDoc(ref);
  const wasPublished =
    snap.exists() && (snap.data().state === 'published' || snap.data().state === 'dirty');
  await setDoc(
    ref,
    {
      app: 'ttrpg',
      draft: content,
      kind: extra.kind,
      ownerUid: extra.ownerUid ?? null,
      charName: extra.charName ?? '',
      state: wasPublished ? 'dirty' : 'draft',
      updatedAt: serverTimestamp(),
      ...(snap.exists() ? {} : { published: null, isPublished: false, createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

export async function publishChronicle(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = doc(db, COLL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('There is no chronicle to publish.');
  const draft = snap.data().draft as ChronContent | undefined;
  if (!draft) throw new Error('There is no draft to publish.');
  await setDoc(
    ref,
    { published: draft, state: 'published', isPublished: true, publishedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function unpublishChronicle(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await setDoc(
    doc(db, COLL, id),
    { published: null, state: 'draft', isPublished: false },
    { merge: true },
  );
}
