import * as React from 'react';

export interface Stat {
  label: string;
  value: React.ReactNode;
  /** Optional D&D-style modifier; coloured +green / -red. */
  modifier?: number;
}

export interface StatBlockProps {
  stats: Stat[];
  columns?: number;
  compact?: boolean;
  style?: React.CSSProperties;
}

/** Attribute grid for character sheets — STR/DEX/… with modifiers. */
export function StatBlock(props: StatBlockProps): JSX.Element;
