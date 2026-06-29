import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  /** Red border for validation failure. */
  invalid?: boolean;
  /** Icon rendered inside the left edge. */
  iconStart?: React.ReactNode;
}

/** Single-line text well with an etched recess and accent focus ring. */
export function Input(props: InputProps): JSX.Element;
