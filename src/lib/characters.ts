/**
 * Character data layer (B2.1) — the `characters` collection.
 *
 * A player may hold several characters, so each is its own document with an
 * auto-id, keyed to its owner by `ownerUid` and to the hall by `app: 'ttrpg'`.
 * The sheet content rides the Tier-1 save→publish primitive (`Publishable<T>`):
 * the bearer edits a `draft`, and only a `publish` seals the copy the table sees.
 *
 * A few fields (name, house, status) are denormalised to the document root so
 * the player roster and the GM roster (B2.4) can list cards without reading every
 * full sheet — a free-tier read-budget concern.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { publishDoc, revertDraft, type Publishable, type PublishState } from './publish';
import { newCharacter, type Character, type CharStatus, type HouseId } from './pbta';

const COLLECTION = 'characters';

export interface CharacterRecord {
  id: string;
  ownerUid: string;
  ownerEmail: string | null;
  app: 'ttrpg';
  // denormalised index fields (mirror the draft on every save)
  name: string;
  house: HouseId | '';
  status: CharStatus;
  // the publishable sheet
  draft: Character | null;
  published: Character | null;
  state: PublishState;
  updatedAt?: number;
  publishedAt?: number;
  updatedBy?: string | null;
}

function toRecord(id: string, data: Record<string, unknown>): CharacterRecord {
  return {
    id,
    ownerUid: (data.ownerUid as string) ?? '',
    ownerEmail: (data.ownerEmail as string) ?? null,
    app: 'ttrpg',
    name: (data.name as string) ?? '',
    house: (data.house as HouseId | '') ?? '',
    status: (data.status as CharStatus) ?? 'alive',
    draft: (data.draft as Character) ?? null,
    published: (data.published as Character) ?? null,
    state: (data.state as PublishState) ?? 'draft',
    updatedAt: data.updatedAt as number | undefined,
    publishedAt: data.publishedAt as number | undefined,
    updatedBy: (data.updatedBy as string) ?? null,
  };
}

const SEALED = 'The table is sealed — no firebase config is set.';

/** Enter a new, unsworn character into the ledger. Returns its id. */
export async function createCharacter(
  ownerUid: string,
  ownerEmail: string | null,
  house: HouseId | '' = '',
): Promise<string> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const draft = newCharacter(house);
  const ref = await addDoc(collection(db, COLLECTION), {
    ownerUid,
    ownerEmail: ownerEmail ?? null,
    app: 'ttrpg',
    name: draft.cardName,
    house: draft.house,
    status: draft.status,
    draft,
    published: null,
    state: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: ownerUid,
  });
  return ref.id;
}

/**
 * Save a draft sheet. Mirrors the publish-primitive's draft logic (marks a
 * published record `dirty`) while also refreshing the denormalised index fields.
 */
export async function saveCharacterDraft(
  id: string,
  draft: Character,
  updatedBy?: string,
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  const wasPublished =
    snap.exists() && (snap.data().state === 'published' || snap.data().state === 'dirty');
  await setDoc(
    ref,
    {
      draft,
      name: draft.cardName,
      house: draft.house,
      status: draft.status,
      state: wasPublished ? 'dirty' : 'draft',
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy ?? null,
    },
    { merge: true },
  );
}

/** Seal the current draft as the copy the table sees. */
export async function publishCharacter(id: string): Promise<void> {
  await publishDoc<Character>(COLLECTION, [id]);
}

/** Discard draft edits back to the published sheet. */
export async function revertCharacter(id: string): Promise<void> {
  await revertDraft<Character>(COLLECTION, [id]);
}

export async function deleteCharacter(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Subscribe to every character a bearer owns. Returns an unsubscribe fn. */
export function watchMyCharacters(ownerUid: string, cb: (rows: CharacterRecord[]) => void): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where('app', '==', 'ttrpg'), where('ownerUid', '==', ownerUid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toRecord(d.id, d.data()))),
    () => cb([]),
  );
}

/** Subscribe to every character at the table — the master/admin roster (B2.4). */
export function watchAllCharacters(cb: (rows: CharacterRecord[]) => void): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where('app', '==', 'ttrpg'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toRecord(d.id, d.data()))),
    () => cb([]),
  );
}

/** Subscribe to one character. */
export function watchCharacter(id: string, cb: (row: CharacterRecord | null) => void): () => void {
  if (!isFirebaseConfigured) {
    cb(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, COLLECTION, id),
    (snap) => cb(snap.exists() ? toRecord(snap.id, snap.data()) : null),
    () => cb(null),
  );
}
