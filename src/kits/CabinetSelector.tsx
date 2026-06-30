/* TriWizard — the cabinet selector (B1.4).
   The sworn bearer's crossroads: choose the hall to enter. Each hall shows the
   standing held there; halls without standing are shown sealed. Admins may
   enter either. Composes design-system primitives only. */
import React from 'react';
import { Avatar, Badge, Button, Card, ThemeSwitcher } from '../components';
import { Shield, Dice } from './icons';
import type { Role, RoleApp } from '../lib/types';
import { logOut } from '../lib/auth';
import { activeRoleFor } from '../lib/roles';
import { canEnter, effectiveRole, selectIsAdmin, useSession } from '../stores/sessionStore';

interface Props {
  onEnterLarp: () => void;
  onEnterTtrpg: () => void;
  onBack: () => void;
  theme: string;
  setTheme: (t: string) => void;
}

const rune: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  color: 'var(--accent-text)',
  letterSpacing: '0.3em',
};

const ROLE_LABEL: Record<string, string> = {
  player: 'Player',
  master: 'Master',
  admin: 'Admin',
};

interface HallProps {
  app: RoleApp;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  onEnter: () => void;
}

function HallCard({ app, title, blurb, icon, onEnter }: HallProps) {
  const allowed = useSession((s) => canEnter(s, app));
  const role = useSession((s) => effectiveRole(s, app));
  const isAdmin = useSession(selectIsAdmin);
  const pending = useSession((s) =>
    s.roles.find((r: Role) => r.app === app && r.status === 'pending'),
  );
  const native = useSession((s) => activeRoleFor(s.roles, app));

  return (
    <Card accentEdge={allowed} padding="var(--space-5)" style={{ opacity: allowed ? 1 : 0.7 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 184 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}>{icon}</span>
          {allowed && role && (
            <Badge tone={role === 'admin' ? 'accent' : 'neutral'}>
              {isAdmin && !native ? 'Admin' : ROLE_LABEL[role]}
            </Badge>
          )}
        </div>
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 26,
              color: 'var(--text-1)',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: '8px 0 0',
              fontFamily: 'var(--font-serif)',
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--text-2)',
            }}
          >
            {blurb}
          </p>
        </div>
        <div style={{ marginTop: 'auto' }}>
          {allowed ? (
            <Button block onClick={onEnter}>
              Enter →
            </Button>
          ) : pending ? (
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--text-3)',
              }}
            >
              Your name is entered, awaiting a master's seal.
            </div>
          ) : (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-3)',
              }}
            >
              Sealed · no standing
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function CabinetSelector({
  onEnterLarp,
  onEnterTtrpg,
  onBack,
  theme,
  setTheme,
}: Props) {
  const profile = useSession((s) => s.profile);
  const user = useSession((s) => s.user);
  const name = profile?.displayName || user?.displayName || user?.email || 'bearer';
  const initials = name
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'B';

  return (
    <div
      className="tw-stone-wash"
      style={{ minHeight: '100vh', background: 'var(--surface-page)' }}
    >
      <header
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '0 32px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <a
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <span style={{ ...rune, fontSize: 20 }}>ᛏ</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 19,
              letterSpacing: '0.06em',
              color: 'var(--text-1)',
            }}
          >
            TRI<span style={{ color: 'var(--accent-text)' }}>WIZARD</span>
          </span>
        </a>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <ThemeSwitcher scope="site" value={theme} onChange={setTheme} showLabels={false} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar
              initials={initials}
              alt={name}
              src={profile?.photoURL || user?.photoURL || undefined}
              size="sm"
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                color: 'var(--text-2)',
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logOut()}>
            Step out
          </Button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '60px 32px 90px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ ...rune, fontSize: 18, marginBottom: 16 }}>ᛏ&nbsp;&nbsp;ᛁ&nbsp;&nbsp;ᛜ</div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(34px, 5vw, 52px)',
              lineHeight: 1.02,
              color: 'var(--text-1)',
            }}
          >
            Choose your hall
          </h1>
          <p
            style={{
              margin: '14px auto 0',
              maxWidth: '46ch',
              fontFamily: 'var(--font-serif)',
              fontSize: 17,
              lineHeight: 1.6,
              color: 'var(--text-2)',
            }}
          >
            One name, two halls. Your standing in each is kept apart in the ledger.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            maxWidth: 760,
            margin: '0 auto',
          }}
        >
          <HallCard
            app="larp"
            title="The Cabinet"
            blurb="The LARP hall — roster, character sheets, assessment, the chronicle of every oath."
            icon={<Shield s={26} />}
            onEnter={onEnterLarp}
          />
          <HallCard
            app="ttrpg"
            title="The Table"
            blurb="The TTRPG hall — your card, the dice tray, the saga graphs, and the master's screen."
            icon={<Dice s={26} />}
            onEnter={onEnterTtrpg}
          />
        </div>
      </main>
    </div>
  );
}
