import React from 'react';

/** Textarea — multi-line well; same etched treatment as Input. */
export function Textarea({ invalid = false, rows = 4, style = {}, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const ring = focus
    ? { borderColor: 'var(--accent)', boxShadow: 'var(--shadow-well), 0 0 0 3px var(--focus-ring)' }
    : invalid ? { borderColor: 'var(--status-dead)' } : {};
  return (
    <textarea
      rows={rows}
      onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
      onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
      style={{
        width: '100%',
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--text-base)',
        lineHeight: 'var(--leading-normal)',
        color: 'var(--text-1)',
        background: 'var(--surface-inset)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-well)',
        padding: '11px 13px',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        ...ring,
        ...style,
      }}
      {...rest}
    />
  );
}
