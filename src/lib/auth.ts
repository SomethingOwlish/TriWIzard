/**
 * Auth layer (B1.1) — swearing in, enrolment, and recovery.
 *
 * Wraps Firebase Auth with the two sanctioned providers (Google, Email/Password)
 * and the `users/{uid}` bootstrap. Every entry point routes its raw Firebase
 * error through `oathError` so the bearer hears an in-world voice, never a
 * `auth/invalid-credential` code.
 */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import { ensureUserDoc } from './users';

/** Thrown by every auth action; `.message` is already in-world and legible. */
export class OathError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'OathError';
    this.code = code;
  }
}

const SEALED =
  'The hall is sealed — no firebase config is set. Fill the ledger keys in .env to open it.';

/** Map a raw Firebase auth error to a solemn, second-person message. */
function oathError(err: unknown): OathError {
  const code = (err as { code?: string })?.code ?? 'auth/unknown';
  const message: string = (() => {
    switch (code) {
      case 'auth/invalid-email':
        return 'That is not a name the ledger recognises.';
      case 'auth/missing-password':
      case 'auth/weak-password':
        return 'Your oath is too thin — choose at least six characters.';
      case 'auth/email-already-in-use':
        return 'An oath already stands in that name. Enter instead, or recover it.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'That name and oath do not match the ledger.';
      case 'auth/too-many-requests':
        return 'Too many attempts. The hall bars the door a while — wait, then try again.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'You stepped back from the threshold.';
      case 'auth/network-request-failed':
        return 'The road to the hall is dark — check your connection.';
      case 'auth/operation-not-allowed':
        return 'That manner of entry is not permitted at this hall.';
      default:
        return 'The rite faltered. Try again.';
    }
  })();
  return new OathError(code, message);
}

function assertConfigured(): void {
  if (!isFirebaseConfigured) throw new OathError('app/not-configured', SEALED);
}

/** Subscribe to the swearing-in state. Returns an unsubscribe fn. */
export function watchAuth(cb: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

/** Enter with Google. Bootstraps `users/{uid}` on first crossing. */
export async function signInWithGoogle(): Promise<User> {
  assertConfigured();
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(cred.user);
    return cred.user;
  } catch (err) {
    if ((err as { code?: string })?.code === 'auth/account-exists-with-different-credential') {
      throw new OathError(
        'auth/account-exists-with-different-credential',
        'An oath already stands in that name, sworn another way. Enter as you first did.',
      );
    }
    throw oathError(err);
  }
}

/** Enter with email + oath. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  assertConfigured();
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await ensureUserDoc(cred.user);
    return cred.user;
  } catch (err) {
    throw oathError(err);
  }
}

/**
 * Be enrolled — create an account, inscribe the chosen name, send the
 * verification rite, and bootstrap the profile.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  assertConfigured();
  const name = displayName.trim();
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name) await updateProfile(cred.user, { displayName: name });
    await ensureUserDoc(cred.user, { displayName: name || null });
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // The account stands even if the verification letter is delayed.
    }
    return cred.user;
  } catch (err) {
    throw oathError(err);
  }
}

/** Send the recover-your-oath letter. */
export async function resetPassword(email: string): Promise<void> {
  assertConfigured();
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err) {
    throw oathError(err);
  }
}

/** Re-send the verification rite to the standing bearer. */
export async function resendVerification(): Promise<void> {
  assertConfigured();
  if (!auth.currentUser) throw new OathError('auth/no-user', 'No oath stands to verify.');
  try {
    await sendEmailVerification(auth.currentUser);
  } catch (err) {
    throw oathError(err);
  }
}

/** Pull the latest state of the standing bearer (e.g. after verifying email). */
export async function refreshCurrentUser(): Promise<User | null> {
  if (!isFirebaseConfigured || !auth.currentUser) return null;
  await auth.currentUser.reload();
  return auth.currentUser;
}

/** Step back across the threshold. */
export async function logOut(): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await signOut(auth);
  } catch (err) {
    throw oathError(err);
  }
}

export { GoogleAuthProvider };
export type { User };
