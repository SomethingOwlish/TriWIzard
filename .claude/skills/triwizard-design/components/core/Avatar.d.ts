import * as React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  /** Monogram shown when there is no image. */
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Accent ring (e.g. current player / active turn). */
  ring?: boolean;
  /** Corner status dot. */
  status?: 'alive' | 'wounded' | 'dead' | 'unknown';
  /** Rounded square instead of circle. */
  square?: boolean;
  style?: React.CSSProperties;
}

/** Character / player portrait with monogram fallback and status dot. */
export function Avatar(props: AvatarProps): JSX.Element;
