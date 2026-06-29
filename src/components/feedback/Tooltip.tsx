import React from 'react';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Tooltip text / content. */
  label: React.ReactNode;
  side?: TooltipSide;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Tooltip — hover label. Wraps its children; shows on mouseenter/focus. */
export function Tooltip({ label, side = 'top', children, style = {} }: TooltipProps) {
  const [show, setShow] = React.useState(false);
  const pos: React.CSSProperties = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  }[side];

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && (
        <span role="tooltip" style={{
          position: 'absolute', ...pos, zIndex: 1300, whiteSpace: 'nowrap',
          padding: '5px 9px', borderRadius: 'var(--radius-xs)',
          background: 'var(--stone-950)', color: 'var(--bone-100)',
          border: '1px solid var(--border-strong)',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wide)',
          boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
          animation: 'tw-fade var(--dur-fast) var(--ease-out)',
          ...style,
        }}>
          {label}
        </span>
      )}
    </span>
  );
}
