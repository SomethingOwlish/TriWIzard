import React from 'react';

const TONES = {
  neutral: { bg: 'var(--surface-raised)', fg: 'var(--text-2)', bd: 'var(--border-2)' },
  accent:  { bg: 'var(--accent-soft)', fg: 'var(--accent-text)', bd: 'var(--accent)' },
  alive:   { bg: 'rgba(91,122,78,0.16)', fg: 'var(--status-alive)', bd: 'var(--status-alive)' },
  wounded: { bg: 'rgba(181,96,31,0.16)', fg: 'var(--status-wounded)', bd: 'var(--status-wounded)' },
  dead:    { bg: 'rgba(138,31,42,0.18)', fg: 'var(--status-dead)', bd: 'var(--status-dead)' },
  ember:   { bg: 'rgba(201,154,91,0.14)', fg: 'var(--accent-2-text)', bd: 'var(--accent-2)' },
};

/** Badge — small status pill. Use for character state, roles, counts. */
export function Badge({ children, tone = 'neutral', dot = false, outline = false, style = {} }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 9px', borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-medium)', letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: t.fg,
      background: outline ? 'transparent' : t.bg,
      border: `1px solid ${outline ? t.bd : 'transparent'}`,
      lineHeight: 1.4,
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.fg }} />}
      {children}
    </span>
  );
}
