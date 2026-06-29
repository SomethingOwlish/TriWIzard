import * as React from 'react';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Glyph (e.g. a Lucide icon element). */
  children: React.ReactNode;
  /** Accessible name (also the tooltip). */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
  /** Selected / toggled-on state. */
  active?: boolean;
}

/** Square control for a single icon — toolbars, nav rails, table row actions. */
export function IconButton(props: IconButtonProps): JSX.Element;
