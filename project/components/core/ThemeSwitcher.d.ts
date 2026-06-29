import * as React from 'react';

export type TwTheme = 'dark' | 'light' | 'ttrpg-blue' | 'ttrpg-violet' | 'ttrpg-light';

export interface ThemeSwitcherProps {
  /** Which built-in set of swatches to show. Ignored if `themes` is given. */
  scope?: 'site' | 'ttrpg' | 'all';
  /** Explicit list of theme names to offer. */
  themes?: TwTheme[];
  value?: TwTheme;
  defaultValue?: TwTheme;
  onChange?: (theme: TwTheme) => void;
  /** 'document' writes data-theme on <html>; a CSS selector writes it on that element. */
  applyTo?: 'document' | string;
  showLabels?: boolean;
  style?: React.CSSProperties;
}

/** Swatch row for selecting a TriWizard theme; can apply data-theme itself. */
export function ThemeSwitcher(props: ThemeSwitcherProps): JSX.Element;

export const TW_THEMES: Record<string, { label: string; page: string; accent: string }>;
