import React from 'react';

/** Switch — sliding toggle. Use for binary on/off settings (theme, master mode). */
export function Switch({ checked, defaultChecked, onChange, label, disabled = false, size = 'md', style = {} }) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  const W = size === 'sm' ? 34 : 44;
  const H = size === 'sm' ? 20 : 26;
  const knob = H - 6;

  function toggle() {
    if (disabled) return;
    const next = !on;
    if (!isControlled) setInternal(next);
    onChange && onChange(next);
  }

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <button type="button" role="switch" aria-checked={on} onClick={toggle} disabled={disabled}
        style={{
          width: W, height: H, flexShrink: 0, padding: 0, border: '1px solid',
          borderColor: on ? 'var(--accent)' : 'var(--border-strong)',
          borderRadius: 'var(--radius-pill)',
          background: on ? 'var(--accent)' : 'var(--surface-inset)',
          boxShadow: on ? 'none' : 'var(--shadow-well)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? W - knob - 4 : 2,
          width: knob, height: knob, borderRadius: '50%',
          background: on ? 'var(--accent-contrast)' : 'var(--bone-300)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--dur-base) var(--ease-out)',
        }} />
      </button>
      {label && <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', color: 'var(--text-1)' }}>{label}</span>}
    </label>
  );
}
