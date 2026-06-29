import React from 'react';

/**
 * Card — the core surface. TriWizard stores most data as cards.
 * Optional eyebrow + title header, optional accent edge, hover lift.
 */
export function Card({
  children,
  title,
  eyebrow,
  actions,
  accentEdge = false,
  interactive = false,
  padding = 'var(--space-5)',
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-md)',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        borderColor: hover ? 'var(--border-strong)' : 'var(--border-1)',
        ...style,
      }}
      {...rest}
    >
      {accentEdge && (
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--accent)' }} />
      )}
      {(title || eyebrow || actions) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          padding: `var(--space-4) ${padding} 0`,
        }}>
          <div style={{ minWidth: 0 }}>
            {eyebrow && <div className="tw-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
            {title && (
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-lg)', color: 'var(--text-1)', lineHeight: 'var(--leading-snug)' }}>
                {title}
              </h3>
            )}
          </div>
          {actions && <div style={{ flexShrink: 0, display: 'flex', gap: 6 }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
    </div>
  );
}
