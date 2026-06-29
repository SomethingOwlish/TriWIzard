import * as React from 'react';

export interface TagProps {
  children: React.ReactNode;
  /** Show an × and call this when clicked. */
  onRemove?: (e: React.MouseEvent) => void;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Selected (accent-filled) state — for filter chips. */
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** Removable / selectable label — skills, factions, traits, filters. */
export function Tag(props: TagProps): JSX.Element;
