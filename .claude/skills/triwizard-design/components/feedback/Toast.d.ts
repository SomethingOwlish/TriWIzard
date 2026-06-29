import * as React from 'react';

export interface ToastProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'alive' | 'wounded' | 'dead';
  icon?: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

/** Transient notice with a tone-coloured left edge. Stack in a fixed corner. */
export function Toast(props: ToastProps): JSX.Element;
