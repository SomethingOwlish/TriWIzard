import React from 'react';

const DIM = { xs: 24, sm: 32, md: 44, lg: 64, xl: 96 };

/** Avatar — character / player portrait. Falls back to monogram initials. */
export function Avatar({ src, alt = '', initials, size = 'md', ring = false, status, square = false, style = {} }) {
  const d = DIM[size] || DIM.md;
  const fontSize = Math.round(d * 0.4);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span style={{
        width: d, height: d,
        borderRadius: square ? 'var(--radius-sm)' : '50%',
        overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-raised)',
        color: 'var(--text-2)',
        fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize,
        border: ring ? '2px solid var(--accent)' : '1px solid var(--border-2)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}>
        {src
          ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.25) contrast(1.05)' }} />
          : (initials || '?')}
      </span>
      {status && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1,
          width: Math.max(8, d * 0.26), height: Math.max(8, d * 0.26), borderRadius: '50%',
          background: status === 'alive' ? 'var(--status-alive)' : status === 'wounded' ? 'var(--status-wounded)' : status === 'dead' ? 'var(--status-dead)' : 'var(--text-3)',
          border: '2px solid var(--surface-card)',
        }} />
      )}
    </span>
  );
}
