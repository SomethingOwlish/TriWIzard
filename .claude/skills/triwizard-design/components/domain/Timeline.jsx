import React from 'react';

/** Timeline — vertical chronology of saga events. Each: {time,title,body,tone}. */
export function Timeline({ events = [], style = {} }) {
  const dot = (tone) => tone === 'accent' ? 'var(--accent)' : tone === 'dead' ? 'var(--status-dead)' : tone === 'alive' ? 'var(--status-alive)' : 'var(--border-strong)';
  return (
    <div style={{ position: 'relative', paddingLeft: 28, ...style }}>
      <span style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: 'var(--border-2)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {events.map((e, i) => (
          <div key={e.id ?? i} style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: -28, top: 3, width: 15, height: 15, borderRadius: '50%',
              background: 'var(--surface-page)', border: `2px solid ${dot(e.tone)}`,
              boxShadow: e.tone === 'accent' ? '0 0 10px -2px var(--accent)' : 'none',
            }} />
            <div className="tw-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 3 }}>{e.time}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-md)', color: 'var(--text-1)', lineHeight: 'var(--leading-snug)' }}>{e.title}</div>
            {e.body && <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-serif)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-2)' }}>{e.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
