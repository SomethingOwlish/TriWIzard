import * as React from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Strings or {value,label,disabled} objects. */
  options: Array<string | RadioOption>;
  direction?: 'row' | 'column';
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Single-choice radio set. */
export function RadioGroup(props: RadioGroupProps): JSX.Element;
