/**
 * Session store (zustand) — the one place that knows who stands in the hall.
 *
 * Holds the swearing-in state, the bearer's profile, their grants of standing,
 * and the admin "view as" overlay (B1.5). It also remembers the last surface
 * and per-surface theme (a Tier-1 convenience), persisted to localStorage and
 * mirrored to the profile when signed in.
 *
 * Guards and cabinets read *effective* standing through the selectors here so
 * an admin viewing-as-player sees exactly what a player would.
 */
import { create } from 'zustand';
import type { Role, RoleApp, RoleType, UserProfile, ViewAs } from '../lib/types';
import { activeRoleFor } from '../lib/roles';

/** The slice of the Firebase user the UI actually needs. */
export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export type AuthStatus = 'loading' | 'anon' | 'authed';

const THEME_KEY = 'tw.theme';
const SURFACE_KEY = 'tw.surface';
const DEFAULT_THEMES: Record<string, string> = { site: 'dark', ttrpg: 'ttrpg-violet' };

function readThemes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw) return { ...DEFAULT_THEMES, ...JSON.parse(raw) };
  } catch {
    /* localStorage may be unavailable; fall through to defaults. */
  }
  return { ...DEFAULT_THEMES };
}

function persistThemes(themes: Record<string, string>): void {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(themes));
  } catch {
    /* best-effort */
  }
}

function readSurface(): string {
  try {
    return localStorage.getItem(SURFACE_KEY) ?? 'site';
  } catch {
    return 'site';
  }
}

interface SessionState {
  status: AuthStatus;
  user: SessionUser | null;
  profile: UserProfile | null;
  roles: Role[];
  /** Admin-only overlay: stand as this role without re-swearing. */
  viewAs: ViewAs | null;

  /** Theme chosen per surface ('site' | 'ttrpg'), remembered across visits. */
  themes: Record<string, string>;
  /** Where the bearer last stood. */
  lastSurface: string;

  // --- mutations -----------------------------------------------------------
  setStatus: (status: AuthStatus) => void;
  setUser: (user: SessionUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setRoles: (roles: Role[]) => void;
  setViewAs: (viewAs: ViewAs | null) => void;
  setTheme: (surface: string, theme: string) => void;
  setLastSurface: (surface: string) => void;
  /** Wipe everything on sign-out (keeps theme/surface memory). */
  signOutReset: () => void;
}

export const useSession = create<SessionState>((set) => ({
  status: 'loading',
  user: null,
  profile: null,
  roles: [],
  viewAs: null,
  themes: readThemes(),
  lastSurface: readSurface(),

  setStatus: (status) => set({ status }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setRoles: (roles) => set({ roles }),
  setViewAs: (viewAs) => set({ viewAs }),
  setTheme: (surface, theme) =>
    set((s) => {
      const themes = { ...s.themes, [surface]: theme };
      persistThemes(themes);
      return { themes };
    }),
  setLastSurface: (surface) => {
    try {
      localStorage.setItem(SURFACE_KEY, surface);
    } catch {
      /* best-effort */
    }
    set({ lastSurface: surface });
  },
  signOutReset: () =>
    set({ status: 'anon', user: null, profile: null, roles: [], viewAs: null }),
}));

// --- selectors (call with useSession(selector) or read getState() outside React) --

/** Does the bearer hold the global keys? */
export function selectIsAdmin(s: SessionState): boolean {
  return Boolean(s.profile?.isAdmin);
}

/**
 * The standing this bearer effectively has in a hall, accounting for the admin
 * "view as" overlay. Returns null if they have no business in that hall.
 */
export function effectiveRole(s: SessionState, app: RoleApp): RoleType | null {
  const admin = selectIsAdmin(s);
  if (admin && s.viewAs && s.viewAs.app === app) return s.viewAs.type;
  const granted = activeRoleFor(s.roles, app)?.type ?? null;
  if (admin) return granted ?? 'admin'; // admins may enter any hall, default to admin
  return granted;
}

/** May the bearer enter this hall at all? */
export function canEnter(s: SessionState, app: RoleApp): boolean {
  return effectiveRole(s, app) !== null;
}

/** Halls the bearer may enter, in display order. */
export function enterableApps(s: SessionState): RoleApp[] {
  return (['larp', 'ttrpg'] as RoleApp[]).filter((app) => canEnter(s, app));
}
