import React from 'react';

const TONES = {
  neutral: 'var(--border-strong)',
  accent: 'var(--accent)',
  alive: 'var(--status-alive)',
  wounded: 'var(--status-wounded)',
  dead: 'var(--status-dead)',
};

/** Toast — transient notice. Render one or a stack; left edge marks tone. */
export function Toast({ title, children, tone = 'neutral', icon = null, onDismiss, style = {} }) {
  return (
    <div role="status" style={{
      position: 'relative',
      display: 'flex', gap: 12, alignItems: 'flex-start',
      width: 340, maxWidth: '90vw',
      padding: '13px 14px 13px 16px',
      background: 'var(--surface-overlay)',
      border: '1px solid var(--border-2)',
      borderLeft: `3px solid ${TONES[tone] || TONES.neutral}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-lg)',
      animation: 'tw-toast-in var(--dur-base) var(--ease-out)',
      ...style,
    }}>
      {icon && <span style={{ color: TONES[tone] || 'var(--text-2)', display: 'flex', marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-1)', marginBottom: children ? 3 : 0 }}>{title}</div>}
        {children && <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 'var(--leading-normal)' }}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, display: 'flex' }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      )}
      <style>{`@keyframes tw-toast-in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
