import React from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Strings or {value,label,disabled} objects. */
  options: Array<string | RadioOption>;
  direction?: 'row' | 'column';
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** RadioGroup — vertical or horizontal set of single-choice options. */
export function RadioGroup({ name, value, defaultValue, onChange, options = [], direction = 'column', disabled = false, style = {} }: RadioGroupProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = isControlled ? value : internal;

  function pick(v: string) {
    if (disabled) return;
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  }

  return (
    <div role="radiogroup" style={{ display: 'flex', flexDirection: direction, gap: direction === 'row' ? 20 : 12, ...style }}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const lab = typeof opt === 'string' ? opt : opt.label;
        const optDisabled = disabled || (typeof opt === 'object' && opt.disabled);
        const on = current === val;
        return (
          <label key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: optDisabled ? 'not-allowed' : 'pointer', opacity: optDisabled ? 0.5 : 1 }}>
            <input type="radio" name={name} checked={on} onChange={() => pick(val)} disabled={optDisabled}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
            <span style={{
              width: 20, height: 20, flexShrink: 0, borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid', borderColor: on ? 'var(--accent)' : 'var(--border-strong)',
              background: 'var(--surface-inset)', boxShadow: 'var(--shadow-well)',
              transition: 'border-color var(--dur-fast) var(--ease-out)',
            }}>
              {on && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)' }} />}
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', color: 'var(--text-1)' }}>{lab}</span>
          </label>
        );
      })}
    </div>
  );
}
