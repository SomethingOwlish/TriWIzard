/* TriWizard — admin role-switch (B1.5), "view as".
   An admin's standing already permits every hall, so switching role needs no
   re-swearing: the UI simply simulates the chosen standing and the guards and
   cabinets read it back through the session selectors. Visible to admins only. */
import React from 'react';
import type { RoleApp, RoleType } from '../../lib/types';
import { effectiveRole, selectIsAdmin, useSession } from '../../stores/sessionStore';

const TYPES: { type: RoleType; label: string }[] = [
  { type: 'player', label: 'Player' },
  { type: 'master', label: 'Master' },
  { type: 'admin', label: 'Admin' },
];

interface Props {
  app: RoleApp;
  style?: React.CSSProperties;
}

export function RoleSwitcher({ app, style = {} }: Props) {
  const isAdmin = useSession(selectIsAdmin);
  const current = useSession((s) => effectiveRole(s, app));
  const setViewAs = useSession((s) => s.setViewAs);

  if (!isAdmin) return null;

  function pick(type: RoleType) {
    // Standing as native admin clears the overlay; anything else simulates it.
    setViewAs(type === 'admin' ? null : { app, type });
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-sm)',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}
      >
        Viewing as
      </span>
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {TYPES.map(({ type, label }) => {
          const on = current === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => pick(type)}
              style={{
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid transparent',
                background: on ? 'var(--accent)' : 'transparent',
                color: on ? 'var(--accent-contrast)' : 'var(--text-2)',
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-xs)',
                fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-regular)',
                letterSpacing: '0.02em',
                transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
