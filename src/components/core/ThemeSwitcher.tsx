import React from 'react';

export type TwTheme = 'dark' | 'light' | 'ttrpg-blue' | 'ttrpg-violet' | 'ttrpg-light';

/** Built-in theme registry: page + accent preview swatch per theme. */
export const TW_THEMES: Record<string, { label: string; page: string; accent: string }> = {
  dark:         { label: 'Dark',   page: '#100F15', accent: '#9B1C1C' },
  light:        { label: 'Light',  page: '#E7DFCC', accent: '#7C1418' },
  'ttrpg-blue':   { label: 'Blue',   page: '#080C12', accent: '#3E78A8' },
  'ttrpg-violet': { label: 'Violet', page: '#0B0813', accent: '#6B4FB0' },
  'ttrpg-light':  { label: 'Light',  page: '#ECE8F2', accent: '#4A3478' },
};

const SETS: Record<string, TwTheme[]> = {
  site: ['dark', 'light'],
  ttrpg: ['ttrpg-blue', 'ttrpg-violet', 'ttrpg-light'],
  all: ['dark', 'light', 'ttrpg-blue', 'ttrpg-violet', 'ttrpg-light'],
};

export interface ThemeSwitcherProps {
  /** Which built-in set of swatches to show. Ignored if `themes` is given. */
  scope?: 'site' | 'ttrpg' | 'all';
  /** Explicit list of theme names to offer. */
  themes?: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (theme: string) => void;
  /** 'document' writes data-theme on <html>; a CSS selector writes it on that element. */
  applyTo?: 'document' | string;
  showLabels?: boolean;
  style?: React.CSSProperties;
}

/**
 * ThemeSwitcher — swatch row that selects a TriWizard theme.
 * If `applyTo` is set ('document' or a CSS selector) it writes data-theme there;
 * otherwise just calls onChange and the caller applies it.
 */
export function ThemeSwitcher({ scope = 'site', themes, value, defaultValue, onChange, applyTo, showLabels = true, style = {} }: ThemeSwitcherProps) {
  const list: string[] = themes || SETS[scope] || SETS.site;
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string>(defaultValue ?? list[0]);
  const current = isControlled ? value : internal;

  function apply(name: string) {
    if (applyTo) {
      const el = applyTo === 'document' ? document.documentElement : document.querySelector(applyTo);
      if (el) el.setAttribute('data-theme', name);
    }
  }

  React.useEffect(() => { if (current) apply(current); /* eslint-disable-next-line */ }, []);

  function pick(name: string) {
    if (!isControlled) setInternal(name);
    apply(name);
    onChange && onChange(name);
  }

  return (
    <div role="radiogroup" aria-label="Theme" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4,
      background: 'var(--surface-inset)', border: '1px solid var(--border-1)',
      borderRadius: 'var(--radius-pill)', ...style,
    }}>
      {list.map((name) => {
        const t = TW_THEMES[name] || { label: name, page: '#444', accent: '#999' };
        const on = current === name;
        return (
          <button key={name} type="button" role="radio" aria-checked={on} title={t.label} onClick={() => pick(name)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: showLabels ? '5px 12px 5px 6px' : 5,
              borderRadius: 'var(--radius-pill)', cursor: 'pointer',
              border: '1px solid', borderColor: on ? 'var(--border-strong)' : 'transparent',
              background: on ? 'var(--surface-raised)' : 'transparent',
              transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
            }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: t.page, border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: `inset -6px -6px 0 -3px ${t.accent}`,
            }} />
            {showLabels && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: on ? 'var(--text-1)' : 'var(--text-3)' }}>
                {t.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
