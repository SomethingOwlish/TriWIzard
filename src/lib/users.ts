/**
 * User profile data layer — `users/{uid}`.
 *
 * The profile carries the bearer's name and the single global `isAdmin` flag.
 * Security Rules let an account create and tend its own profile but forbid it
 * from raising its own `isAdmin` — that key is turned only from the console.
 */
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, isFirebaseConfigured } from './firebase';
import type { UserProfile } from './types';

const COLLECTION = 'users';

function userRef(uid: string) {
  return doc(db, COLLECTION, uid);
}

/** Coerce a raw Firestore doc into a typed profile with safe defaults. */
function toProfile(uid: string, data: Record<string, unknown> | undefined): UserProfile {
  return {
    uid,
    email: (data?.email as string) ?? null,
    displayName: (data?.displayName as string) ?? null,
    photoURL: (data?.photoURL as string) ?? null,
    isAdmin: Boolean(data?.isAdmin),
    createdAt: data?.createdAt as number | undefined,
    lastSurface: (data?.lastSurface as string) ?? null,
    lastTheme: (data?.lastTheme as Record<string, string>) ?? {},
  };
}

/**
 * Bootstrap the profile on first crossing (B1.1). Idempotent: an existing doc
 * is left untouched apart from refreshing the mirrored auth fields. Never
 * writes `isAdmin` — that flag is the console's to set.
 */
export async function ensureUserDoc(
  user: User,
  extra: Partial<Pick<UserProfile, 'displayName'>> = {},
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      displayName: extra.displayName ?? user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      isAdmin: false,
      createdAt: serverTimestamp(),
    });
    return;
  }
  // Keep the mirrored auth fields fresh without disturbing isAdmin or ledger data.
  await updateDoc(ref, {
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
    ...(extra.displayName ? { displayName: extra.displayName } : {}),
  });
}

/** Subscribe to a profile. Returns an unsubscribe fn. */
export function watchUserProfile(
  uid: string,
  cb: (profile: UserProfile | null) => void,
): () => void {
  if (!isFirebaseConfigured) {
    cb(null);
    return () => {};
  }
  return onSnapshot(
    userRef(uid),
    (snap) => cb(snap.exists() ? toProfile(uid, snap.data()) : null),
    () => cb(null),
  );
}

/** One-shot read of a profile. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? toProfile(uid, snap.data()) : null;
}

/** Remember where the bearer last stood and which skin they chose there. */
export async function rememberSurface(
  uid: string,
  surface: string,
  theme: { surface: string; value: string } | null,
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const patch: Record<string, unknown> = { lastSurface: surface };
  if (theme) patch[`lastTheme.${theme.surface}`] = theme.value;
  try {
    await updateDoc(userRef(uid), patch);
  } catch {
    // Best-effort memory; never block navigation on a write.
  }
}
