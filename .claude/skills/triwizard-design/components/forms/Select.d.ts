import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  /** <option> / <optgroup> elements. */
  children: React.ReactNode;
}

/** Native dropdown styled to match Input, with a carved chevron. */
export function Select(props: SelectProps): JSX.Element;
