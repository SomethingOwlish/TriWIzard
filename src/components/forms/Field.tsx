import React from 'react';

export interface FieldProps {
  label?: React.ReactNode;
  /** id of the control this label points at. */
  htmlFor?: string;
  /** Muted helper text under the control. */
  hint?: React.ReactNode;
  /** Error message — overrides hint and turns the message red. */
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Field — label + helper/error wrapper for any form control. */
export function Field({ label, htmlFor, hint, error, required, children, style = {} }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wider)',
            color: 'var(--text-3)',
            fontWeight: 'var(--fw-medium)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--accent-text)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--text-xs)',
          fontStyle: 'italic',
          color: error ? 'var(--status-dead)' : 'var(--text-3)',
        }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
