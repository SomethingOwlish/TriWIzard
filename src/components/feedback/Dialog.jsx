import React from 'react';

/** Dialog — modal over a scrim. Render conditionally on `open`. */
export function Dialog({ open, onClose, title, eyebrow, children, footer, width = 480, style = {} }) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose && onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'var(--scrim)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-5)',
        animation: 'tw-fade var(--dur-base) var(--ease-out)',
      }}
    >
      <div
        role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, maxHeight: '88vh', overflow: 'auto',
          background: 'var(--surface-overlay)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'tw-rise var(--dur-base) var(--ease-out)',
          ...style,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: 'var(--space-5) var(--space-5) 0' }}>
          <div>
            {eyebrow && <div className="tw-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
            {title && <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-xl)', color: 'var(--text-1)', lineHeight: 'var(--leading-snug)' }}>{title}</h2>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, marginTop: -2, marginRight: -4, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div style={{ padding: 'var(--space-4) var(--space-5)', fontFamily: 'var(--font-serif)', color: 'var(--text-2)', lineHeight: 'var(--leading-relaxed)' }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0 var(--space-5) var(--space-5)' }}>{footer}</div>
        )}
      </div>
      <style>{`@keyframes tw-fade{from{opacity:0}to{opacity:1}}@keyframes tw-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
