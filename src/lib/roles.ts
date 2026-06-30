/**
 * Role data layer (B1.2) — the `roles` collection.
 *
 * Each document is one grant of standing in one hall (LARP or TTRPG), bound to
 * one account. A master/admin enters the role into the ledger and links it to
 * an existing player by email; Security Rules gate the rest. The acceptance
 * dashboard that drives creation lands later (B7.2) — this layer is the shared
 * primitive every cabinet reads its permissions from.
 */
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Role, RoleApp, RoleStatus, RoleType } from './types';

const COLLECTION = 'roles';

/**
 * Deterministic role id: one grant per hall per account. The fixed shape lets
 * Firestore Security Rules `get` a bearer's standing directly (rules cannot
 * query), so `${app}__${uid}` is the contract the rules depend on.
 */
export function roleId(app: RoleApp, uid: string): string {
  return `${app}__${uid}`;
}

function toRole(id: string, data: Record<string, unknown>): Role {
  return {
    id,
    app: data.app as RoleApp,
    type: data.type as RoleType,
    uid: data.uid as string,
    email: (data.email as string) ?? '',
    status: (data.status as RoleStatus) ?? 'pending',
    createdBy: data.createdBy as string | undefined,
    createdAt: data.createdAt as number | undefined,
    updatedAt: data.updatedAt as number | undefined,
  };
}

/** Subscribe to every role bound to one account. Returns an unsubscribe fn. */
export function watchRolesForUser(uid: string, cb: (roles: Role[]) => void): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toRole(d.id, d.data()))),
    () => cb([]),
  );
}

/** Subscribe to every role in one hall — the master/admin acceptance view. */
export function watchRolesForApp(app: RoleApp, cb: (roles: Role[]) => void): () => void {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where('app', '==', app));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toRole(d.id, d.data()))),
    () => cb([]),
  );
}

/**
 * Enter (or amend) a grant of standing into the ledger. Keyed by `${app}__${uid}`
 * so re-granting in a hall updates the same record. Created `pending` by default.
 */
export async function createRole(input: {
  app: RoleApp;
  type: RoleType;
  uid: string;
  email: string;
  status?: RoleStatus;
  createdBy?: string;
}): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('The ledger is sealed — no firebase config.');
  const id = roleId(input.app, input.uid);
  await setDoc(
    doc(db, COLLECTION, id),
    {
      app: input.app,
      type: input.type,
      uid: input.uid,
      email: input.email,
      status: input.status ?? 'pending',
      createdBy: input.createdBy ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return id;
}

/** Seal, suspend, or restore a role. */
export async function updateRoleStatus(roleId: string, status: RoleStatus): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, COLLECTION, roleId), { status, updatedAt: serverTimestamp() });
}

/** A bearer holds standing in a hall only if a role there is `active`. */
export function activeRoleFor(roles: Role[], app: RoleApp): Role | null {
  return roles.find((r) => r.app === app && r.status === 'active') ?? null;
}

/** Standing rank for "view as" defaults and UI ordering. */
export const ROLE_RANK: Record<RoleType, number> = { player: 0, master: 1, admin: 2 };
