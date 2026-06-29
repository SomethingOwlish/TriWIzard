import React from 'react';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  /** <option> / <optgroup> elements. */
  children: React.ReactNode;
}

/** Select — native dropdown with custom chevron, matching Input shell. */
export function Select({ children, size = 'md', invalid = false, style = {}, ...rest }: SelectProps) {
  const [focus, setFocus] = React.useState(false);
  const pad = size === 'sm' ? '7px 34px 7px 10px' : size === 'lg' ? '13px 40px 13px 16px' : '10px 38px 10px 13px';
  const ring: React.CSSProperties = focus
    ? { borderColor: 'var(--accent)', boxShadow: 'var(--shadow-well), 0 0 0 3px var(--focus-ring)' }
    : invalid ? { borderColor: 'var(--status-dead)' } : {};
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--text-base)',
          color: 'var(--text-1)',
          background: 'var(--surface-inset)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-well)',
          padding: pad,
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
          ...ring,
          ...style,
        }}
        {...rest}
      >
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"
        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }}>
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
