import React from 'react';

const SHELL = {
  width: '100%',
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-1)',
  background: 'var(--surface-inset)',
  border: '1px solid var(--border-2)',
  borderRadius: 'var(--radius-sm)',
  boxShadow: 'var(--shadow-well)',
  outline: 'none',
  transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
};

/** Input — single-line text well with an etched recess. */
export function Input({ size = 'md', invalid = false, iconStart = null, style = {}, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const pad = size === 'sm' ? '7px 10px' : size === 'lg' ? '13px 16px' : '10px 13px';
  const ring = focus
    ? { borderColor: 'var(--accent)', boxShadow: 'var(--shadow-well), 0 0 0 3px var(--focus-ring)' }
    : invalid ? { borderColor: 'var(--status-dead)' } : {};

  const field = (
    <input
      onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
      onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
      style={{ ...SHELL, padding: pad, ...(iconStart ? { paddingLeft: 38 } : null), ...ring, ...style }}
      {...rest}
    />
  );

  if (!iconStart) return field;
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex', pointerEvents: 'none' }}>
        {iconStart}
      </span>
      {field}
    </div>
  );
}
