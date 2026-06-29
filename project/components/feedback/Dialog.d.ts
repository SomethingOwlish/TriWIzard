import * as React from 'react';

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
  /** Right-aligned action row (buttons). */
  footer?: React.ReactNode;
  /** Max width in px. */
  width?: number;
  style?: React.CSSProperties;
}

/** Modal dialog over a blurred scrim. Closes on Esc / scrim click. */
export function Dialog(props: DialogProps): JSX.Element | null;
