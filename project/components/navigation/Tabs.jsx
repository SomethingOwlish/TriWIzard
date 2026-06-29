import React from 'react';

/** Tabs — underlined navigation. Controlled (value) or uncontrolled. */
export function Tabs({ tabs = [], value, defaultValue, onChange, style = {} }) {
  const isControlled = value !== undefined;
  const first = tabs[0] && (typeof tabs[0] === 'string' ? tabs[0] : tabs[0].value);
  const [internal, setInternal] = React.useState(defaultValue ?? first);
  const current = isControlled ? value : internal;

  function pick(v) {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  }

  return (
    <div role="tablist" style={{
      display: 'flex', gap: 4, borderBottom: '1px solid var(--border-1)', ...style,
    }}>
      {tabs.map((t) => {
        const val = typeof t === 'string' ? t : t.value;
        const lab = typeof t === 'string' ? t : t.label;
        const count = typeof t === 'object' ? t.count : undefined;
        const on = current === val;
        return (
          <button key={val} role="tab" aria-selected={on} onClick={() => pick(val)}
            style={{
              position: 'relative',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '11px 16px',
              fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)',
              fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              letterSpacing: 'var(--tracking-wide)',
              color: on ? 'var(--text-1)' : 'var(--text-3)',
              transition: 'color var(--dur-fast) var(--ease-out)',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
            {lab}
            {count != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: on ? 'var(--accent-text)' : 'var(--text-3)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-pill)', padding: '1px 7px' }}>{count}</span>
            )}
            <span style={{
              position: 'absolute', left: 0, right: 0, bottom: -1, height: 2,
              background: on ? 'var(--accent)' : 'transparent',
              transition: 'background var(--dur-fast) var(--ease-out)',
            }} />
          </button>
        );
      })}
    </div>
  );
}
