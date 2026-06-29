import * as React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  /** Status colour. */
  tone?: 'neutral' | 'accent' | 'alive' | 'wounded' | 'dead' | 'ember';
  /** Leading status dot. */
  dot?: boolean;
  /** Transparent fill with coloured border. */
  outline?: boolean;
  style?: React.CSSProperties;
}

/** Uppercase status pill — character state, roles, counts. */
export function Badge(props: BadgeProps): JSX.Element;
