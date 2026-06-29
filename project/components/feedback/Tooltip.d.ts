import * as React from 'react';

export interface TooltipProps {
  /** Tooltip text / content. */
  label: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Hover/focus label wrapping a trigger element. */
export function Tooltip(props: TooltipProps): JSX.Element;
