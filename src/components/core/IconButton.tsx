import React from 'react';

/** IconButton — square ghost/solid control for a single glyph. */
const SIZES: Record<string, number> = { sm: 30, md: 38, lg: 46 };

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Glyph (e.g. a Lucide icon element). */
  children: React.ReactNode;
  /** Accessible name (also the tooltip). */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
  /** Selected / toggled-on state. */
  active?: boolean;
}

export function IconButton({
  children,
  label,
  size = 'md',
  variant = 'ghost',
  active = false,
  disabled = false,
  style = {},
  ...rest
}: IconButtonProps) {
  const [hover, setHover] = React.useState(false);
  const dim = SIZES[size] || SIZES.md;
  const solid = variant === 'solid';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        color: active ? 'var(--accent-contrast)' : (solid ? 'var(--text-1)' : 'var(--text-2)'),
        background: active
          ? 'var(--accent)'
          : solid
            ? 'var(--surface-raised)'
            : hover ? 'var(--surface-overlay)' : 'transparent',
        border: '1px solid',
        borderColor: active ? 'var(--accent)' : (solid ? 'var(--border-2)' : 'transparent'),
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
