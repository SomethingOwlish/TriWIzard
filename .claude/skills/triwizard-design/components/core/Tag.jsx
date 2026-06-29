import React from 'react';

/** Tag — removable label for skills, factions, traits. Softer than Badge. */
export function Tag({ children, onRemove, icon = null, selected = false, onClick, style = {} }) {
  const clickable = !!onClick;
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '4px 10px', borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-serif)', fontSize: 'var(--text-sm)',
        color: selected ? 'var(--accent-contrast)' : 'var(--text-2)',
        background: selected ? 'var(--accent)' : 'var(--surface-raised)',
        border: '1px solid', borderColor: selected ? 'var(--accent)' : 'var(--border-2)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
    >
      {icon}
      {children}
      {onRemove && (
        <button type="button" aria-label="Remove" onClick={(e) => { e.stopPropagation(); onRemove(e); }}
          style={{ display: 'inline-flex', border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, padding: 0, marginLeft: 1 }}>
          <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
            <path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
