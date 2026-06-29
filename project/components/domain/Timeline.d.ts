import * as React from 'react';

export interface TimelineEvent {
  id?: string | number;
  time: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Node colour. */
  tone?: 'neutral' | 'accent' | 'alive' | 'dead';
}

export interface TimelineProps {
  events: TimelineEvent[];
  style?: React.CSSProperties;
}

/** Vertical chronology of saga / session events. */
export function Timeline(props: TimelineProps): JSX.Element;
