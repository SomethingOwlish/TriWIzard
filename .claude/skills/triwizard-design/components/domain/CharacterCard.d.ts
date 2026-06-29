import * as React from 'react';

export interface Vital {
  label: string;
  value: React.ReactNode;
}

/**
 * @startingPoint section="LARP" subtitle="Character roster tile" viewport="700x520"
 */
export interface CharacterCardProps {
  name: string;
  /** Italic by-line under the name. */
  epithet?: string;
  faction?: string;
  portrait?: string;
  initials?: string;
  status?: 'alive' | 'wounded' | 'dead';
  level?: number;
  /** Bottom stat strip (HP / armour / will …). */
  vitals?: Vital[];
  tags?: string[];
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Roster tile for a player character — portrait, status, vitals strip.
 * @startingPoint section="LARP" subtitle="Character roster tile" viewport="700x220"
 */
export function CharacterCard(props: CharacterCardProps): JSX.Element;
