import * as React from 'react';

export interface FieldProps {
  label?: React.ReactNode;
  /** id of the control this label points at. */
  htmlFor?: string;
  /** Muted helper text under the control. */
  hint?: React.ReactNode;
  /** Error message — overrides hint and turns the message red. */
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Label + helper/error scaffold wrapping any input. */
export function Field(props: FieldProps): JSX.Element;
