import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Inline label to the right of the box. */
  label?: React.ReactNode;
}

/** Checkbox — square, rune-check, hairline border. Controlled or uncontrolled. */
export function Checkbox({ checked, defaultChecked, onChange, label, disabled = false, style = {}, ...rest }: CheckboxProps) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;

  function toggle(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  }

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <input type="checkbox" checked={isControlled ? checked : undefined} defaultChecked={isControlled ? undefined : defaultChecked}
        onChange={toggle} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} {...rest} />
      <span style={{
        width: 20, height: 20, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-xs)',
        border: '1px solid', borderColor: on ? 'var(--accent)' : 'var(--border-strong)',
        background: on ? 'var(--accent)' : 'var(--surface-inset)',
        boxShadow: on ? 'none' : 'var(--shadow-well)',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      }}>
        {on && (
          <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
            <path d="M2.5 6.8l2.6 2.7L10.5 3.5" fill="none" stroke="var(--accent-contrast)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', color: 'var(--text-1)' }}>{label}</span>}
    </label>
  );
}
