/* TriWizard — route guards (B1.4).
   Per-app, per-role gates over the HashRouter tree. Authorization is enforced
   for real by Firestore Security Rules; these guards keep the unsworn from ever
   reaching a screen they couldn't read anyway, and speak in-world when they bar
   the door. Effective standing accounts for the admin "view as" overlay. */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components';
import type { RoleApp } from '../../lib/types';
import { canEnter, useSession } from '../../stores/sessionStore';

const rune: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  color: 'var(--accent-text)',
  letterSpacing: '0.3em',
};

/** Held at the threshold while the ledger is consulted. */
export function HallLoading({ label = 'Consulting the ledger…' }: { label?: string }) {
  return (
    <div
      className="tw-stone-wash"
      style={{
        minHeight: '100vh',
        background: 'var(--surface-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '2px solid var(--border-strong)',
          borderTopColor: 'var(--accent)',
          display: 'inline-block',
          animation: 'tw-spin 0.7s linear infinite',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}
      >
        {label}
      </span>
      <style>{`@keyframes tw-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/** Shown when the bearer is sworn but holds no standing in the hall they sought. */
export function Denied({ app, onLeave }: { app: RoleApp; onLeave: () => void }) {
  const hall = app === 'larp' ? 'the Cabinet' : 'the Table';
  return (
    <div
      className="tw-stone-wash"
      style={{
        minHeight: '100vh',
        background: 'var(--surface-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ ...rune, fontSize: 18, marginBottom: 14 }}>ᚷ</div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 34,
            color: 'var(--text-1)',
          }}
        >
          No oath in {hall}
        </h1>
        <p
          style={{
            margin: '14px 0 26px',
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--text-2)',
          }}
        >
          You hold no standing here. A master must enter your name into this hall's ledger before
          its doors will open to you.
        </p>
        <Button onClick={onLeave}>← Back to the halls</Button>
      </div>
    </div>
  );
}

/** Gate: a sworn bearer is required. Unsworn are sent to the threshold. */
export function RequireAuth({ children }: { children: React.ReactElement }) {
  const status = useSession((s) => s.status);
  if (status === 'loading') return <HallLoading />;
  if (status === 'anon') return <Navigate to="/login" replace />;
  return children;
}

/** Gate: a verified bearer is required. Unverified are sent to the rite. */
export function RequireVerified({ children }: { children: React.ReactElement }) {
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  if (status === 'loading') return <HallLoading />;
  if (status === 'anon') return <Navigate to="/login" replace />;
  if (user && !user.emailVerified) return <Navigate to="/verify" replace />;
  return children;
}

/** Gate: active standing (or admin) in one hall. */
export function RequireRole({
  app,
  onLeave,
  children,
}: {
  app: RoleApp;
  onLeave: () => void;
  children: React.ReactElement;
}) {
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  // Re-render on the inputs that change effective standing.
  const allowed = useSession((s) => canEnter(s, app));
  const profileLoaded = useSession((s) => s.profile !== null);

  if (status === 'loading') return <HallLoading />;
  if (status === 'anon') return <Navigate to="/login" replace />;
  if (user && !user.emailVerified) return <Navigate to="/verify" replace />;
  // Wait for the profile/roles to arrive before judging standing.
  if (!profileLoaded && !allowed) return <HallLoading label="Reading your standing…" />;
  if (!allowed) return <Denied app={app} onLeave={onLeave} />;
  return children;
}
