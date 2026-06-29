import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Inline label to the right of the box. */
  label?: React.ReactNode;
}

/** Square checkbox with a rune-check tick. Controlled or uncontrolled. */
export function Checkbox(props: CheckboxProps): JSX.Element;
