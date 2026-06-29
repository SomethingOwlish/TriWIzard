import * as React from 'react';

/**
 * @startingPoint section="Core" subtitle="Buttons in every variant & size" viewport="700x440"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill container width. */
  block?: boolean;
  loading?: boolean;
  /** Element rendered before the label (e.g. a Lucide icon). */
  iconStart?: React.ReactNode;
  /** Element rendered after the label. */
  iconEnd?: React.ReactNode;
}

/**
 * Primary action control. Blood-filled primary, stone secondary, text ghost.
 * @startingPoint section="Core" subtitle="Buttons in every variant & size" viewport="700x200"
 */
export function Button(props: ButtonProps): JSX.Element;
