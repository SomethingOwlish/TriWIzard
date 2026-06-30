import React from 'react';
import { Avatar } from '../core/Avatar';
import { Badge } from '../core/Badge';

export interface Vital {
  label: string;
  value: React.ReactNode;
}

export interface CharacterCardProps {
  name: string;
  /** Italic by-line under the name. */
  epithet?: string;
  faction?: string;
  portrait?: string;
  initials?: string;
  status?: 'alive' | 'wounded' | 'dead';
  level?: number;
  /** Bottom stat strip (HP / armour / will …). */
  vitals?: Vital[];
  tags?: string[];
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * CharacterCard — roster tile. Portrait, name, epithet, faction, status,
 * and a compact stat strip. Click to open the full sheet.
 */
export function CharacterCard({
  name, epithet, faction, portrait, initials,
  status = 'alive', level, vitals = [], tags = [],
  onClick, style = {},
}: CharacterCardProps) {
  const [hover, setHover] = React.useState(false);
  const statusTone = status === 'dead' ? 'dead' : status === 'wounded' ? 'wounded' : 'alive';
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', cursor: onClick ? 'pointer' : 'default',
        background: 'var(--surface-card)', border: '1px solid var(--border-1)',
        borderColor: hover ? 'var(--border-strong)' : 'var(--border-1)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        ...style,
      }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: status === 'dead' ? 'var(--status-dead)' : 'var(--accent)' }} />
      <div style={{ display: 'flex', gap: 14, padding: '16px 18px' }}>
        <Avatar src={portrait} initials={initials || (name || '?').slice(0, 2).toUpperCase()} size="lg" square status={status} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-lg)', color: 'var(--text-1)', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h3>
            {level != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', flexShrink: 0 }}>LVL {level}</span>}
          </div>
          {epithet && <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginTop: 1 }}>{epithet}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {faction && <Badge tone="ember" outline>{faction}</Badge>}
            <Badge tone={statusTone} dot>{status}</Badge>
          </div>
        </div>
      </div>

      {vitals.length > 0 && (
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-1)', background: 'var(--surface-sunken)' }}>
          {vitals.map((v, i) => (
            <div key={v.label + i} style={{ flex: 1, textAlign: 'center', padding: '9px 6px', borderLeft: i ? '1px solid var(--border-1)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-3)' }}>{v.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-md)', color: 'var(--text-1)' }}>{v.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
