import React from 'react';

/**
 * Button — TriWizard's primary action control.
 * Carved-stone feel: tight radius, hairline border, weighty press.
 */
const SIZES = {
  sm: { padding: '6px 12px', fontSize: 'var(--text-sm)', minHeight: 30, gap: 6 },
  md: { padding: '9px 18px', fontSize: 'var(--text-base)', minHeight: 38, gap: 8 },
  lg: { padding: '13px 26px', fontSize: 'var(--text-md)', minHeight: 48, gap: 10 },
};

function variantStyle(variant) {
  switch (variant) {
    case 'secondary':
      return {
        background: 'var(--surface-raised)',
        color: 'var(--text-1)',
        border: '1px solid var(--border-strong)',
        boxShadow: 'var(--shadow-sm)',
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--text-2)',
        border: '1px solid transparent',
      };
    case 'danger':
      return {
        background: 'transparent',
        color: 'var(--status-dead)',
        border: '1px solid var(--status-dead)',
      };
    case 'primary':
    default:
      return {
        background: 'var(--accent)',
        color: 'var(--accent-contrast)',
        border: '1px solid var(--accent)',
        boxShadow: 'var(--shadow-sm)',
      };
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  iconStart = null,
  iconEnd = null,
  type = 'button',
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const sz = SIZES[size] || SIZES.md;
  const base = variantStyle(variant);

  const hoverPatch = !disabled && hover
    ? variant === 'primary'
      ? { background: 'var(--accent-hover)', borderColor: 'var(--accent-hover)' }
      : variant === 'danger'
        ? { background: 'var(--accent-soft)' }
        : { background: 'var(--surface-overlay)', borderColor: 'var(--border-strong)', color: 'var(--text-1)' }
    : {};

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        padding: sz.padding,
        minHeight: sz.minHeight,
        fontSize: sz.fontSize,
        fontFamily: 'var(--font-ui)',
        fontWeight: 'var(--fw-semibold)',
        letterSpacing: 'var(--tracking-wide)',
        lineHeight: 1,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: active && !disabled ? 'translateY(1px)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
        ...base,
        ...hoverPatch,
        ...style,
      }}
      {...rest}
    >
      {loading
        ? <span style={{ width: '1em', height: '1em', borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'tw-spin 0.7s linear infinite' }} />
        : iconStart}
      {children}
      {!loading && iconEnd}
      <style>{`@keyframes tw-spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
