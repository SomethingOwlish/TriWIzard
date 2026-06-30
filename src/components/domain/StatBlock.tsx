import React from 'react';

export interface Stat {
  label: string;
  value: React.ReactNode;
  /** Optional D&D-style modifier; coloured +green / -red. */
  modifier?: number;
}

export interface StatBlockProps {
  stats: Stat[];
  columns?: number;
  compact?: boolean;
  style?: React.CSSProperties;
}

/** StatBlock — TTRPG attribute grid. Each stat: label, value, optional modifier. */
export function StatBlock({ stats = [], columns = 3, compact = false, style = {} }: StatBlockProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: compact ? 8 : 12, ...style }}>
      {stats.map((s, i) => {
        const mod = s.modifier;
        const modStr = mod == null ? null : (mod >= 0 ? `+${mod}` : `${mod}`);
        return (
          <div key={s.label + i} style={{
            background: 'var(--surface-inset)',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--radius-sm)',
            padding: compact ? '8px 10px' : '12px 14px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-well)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--text-3)' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: compact ? 'var(--text-xl)' : 'var(--text-2xl)', color: 'var(--text-1)', lineHeight: 1.05, margin: '2px 0' }}>{s.value}</div>
            {modStr != null && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: mod! >= 0 ? 'var(--status-alive)' : 'var(--status-dead)' }}>{modStr}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
