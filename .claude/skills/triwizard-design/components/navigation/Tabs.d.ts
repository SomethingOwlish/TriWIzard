import * as React from 'react';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  /** Strings or {value,label,count} objects. */
  tabs: Array<string | TabItem>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/** Underlined tab bar with optional counts. */
export function Tabs(props: TabsProps): JSX.Element;
