/**
 * Shared identity types for the TriWizard cabinets (Tier 1).
 *
 * A single account (one `uid`) can hold different standing in the two halls:
 * a player in the LARP cohort may be a master at the TTRPG table. Standing is
 * recorded as `roles` documents — never in Auth custom claims, which need the
 * paid Admin SDK. Authorization is enforced by Firestore Security Rules; these
 * types are the client's mirror of that shape.
 */

/** The two halls. A role always belongs to exactly one. */
export type RoleApp = 'larp' | 'ttrpg';

/**
 * Standing within a hall. `player` reads and tends their own; `master` (the GM
 * at the table, the master in the LARP cabinet) authors and oversees; `admin`
 * keeps the ledger and may stand in any role without re-swearing.
 */
export type RoleType = 'player' | 'master' | 'admin';

/** A role's life: sworn but not yet sealed, in good standing, or set aside. */
export type RoleStatus = 'pending' | 'active' | 'suspended';

/** A single grant of standing in one hall, linked to one account. */
export interface Role {
  id: string;
  app: RoleApp;
  type: RoleType;
  /** The account this standing is bound to. */
  uid: string;
  /** Denormalised for master/admin dashboards that link by email before uid. */
  email: string;
  status: RoleStatus;
  /** uid of the master/admin who entered this role into the ledger. */
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

/** The account profile — `users/{uid}`. Global flags live here, not on roles. */
export interface UserProfile {
  uid: string;
  email: string | null;
  /** The name the bearer is known by; captured at enrolment. */
  displayName: string | null;
  photoURL: string | null;
  /**
   * The single global flag that grants the keys to every hall. Set only from
   * the console / a trusted hand — Security Rules forbid an account raising
   * its own standing.
   */
  isAdmin: boolean;
  createdAt?: number;
  /** Where the bearer last stood, so they return to the same hall. */
  lastSurface?: string | null;
  /** The skin chosen per surface, remembered across visits. */
  lastTheme?: Record<string, string>;
}

/** An admin standing "in view as" a chosen role without re-swearing (B1.5). */
export interface ViewAs {
  app: RoleApp;
  type: RoleType;
}
