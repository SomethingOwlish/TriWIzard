/**
 * useSessionInit — wires Firebase listeners into the session store, once.
 *
 * Call this exactly once near the root. It watches the swearing-in state and,
 * for whoever is signed in, subscribes to their profile (`users/{uid}`) and
 * their grants of standing (`roles where uid ==`). All three feed the zustand
 * store the rest of the app reads from. Unsubscribes are tracked so a sign-out
 * or account switch never leaks listeners.
 */
import React from 'react';
import { watchAuth } from '../lib/auth';
import { watchUserProfile } from '../lib/users';
import { watchRolesForUser } from '../lib/roles';
import { useSession, type SessionUser } from './sessionStore';

export function useSessionInit(): void {
  React.useEffect(() => {
    const store = useSession.getState();
    let unsubProfile: (() => void) | null = null;
    let unsubRoles: (() => void) | null = null;

    const dropPerUser = () => {
      unsubProfile?.();
      unsubRoles?.();
      unsubProfile = null;
      unsubRoles = null;
    };

    const unsubAuth = watchAuth((user) => {
      dropPerUser();
      if (!user) {
        store.signOutReset();
        return;
      }
      const slim: SessionUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      store.setUser(slim);
      store.setStatus('authed');
      unsubProfile = watchUserProfile(user.uid, (profile) => store.setProfile(profile));
      unsubRoles = watchRolesForUser(user.uid, (roles) => store.setRoles(roles));
    });

    return () => {
      dropPerUser();
      unsubAuth();
    };
  }, []);
}
