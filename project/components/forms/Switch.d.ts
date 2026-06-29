import * as React from 'react';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/** Sliding binary toggle — settings, master mode, theme switching. */
export function Switch(props: SwitchProps): JSX.Element;
