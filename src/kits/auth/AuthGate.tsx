/* TriWizard — the threshold (B1.1).
   Sworn entry to the cabinets: enter with a standing oath, be enrolled anew,
   or recover a forgotten one. Google + Email/Password, in-world throughout.
   Composes design-system primitives only; theme is owned by the layout. */
import React from 'react';
import { Button, Card, Field, Input, Tabs, Toast, ThemeSwitcher } from '../../components';
import { isFirebaseConfigured } from '../../lib/firebase';
import {
  OathError,
  registerWithEmail,
  resetPassword,
  signInWithEmail,
  signInWithGoogle,
} from '../../lib/auth';

type Mode = 'enter' | 'enrol' | 'recover';

interface Props {
  /** Return to the open site. */
  onBack: () => void;
  theme: string;
  setTheme: (t: string) => void;
}

const rune: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  color: 'var(--accent-text)',
  letterSpacing: '0.3em',
};

/** Plain mark for the Google entry — no brand colour, in keeping with the skin. */
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.2c0-.6-.05-1.2-.15-1.8H12v3.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.1z"
        opacity="0.9"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
        opacity="0.6"
      />
      <path
        fill="currentColor"
        d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"
        opacity="0.4"
      />
      <path
        fill="currentColor"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.6 9.4 5.9 12 5.9z"
        opacity="0.8"
      />
    </svg>
  );
}

export default function AuthGate({ onBack, theme, setTheme }: Props) {
  const [mode, setMode] = React.useState<Mode>('enter');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function reset() {
    setError(null);
    setNotice(null);
  }

  async function run(action: () => Promise<unknown>) {
    reset();
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof OathError ? err.message : 'The rite faltered. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (mode === 'enter') run(() => signInWithEmail(email, password));
    else if (mode === 'enrol') run(() => registerWithEmail(email, password, name));
    else
      run(async () => {
        await resetPassword(email);
        setNotice('If that name stands in the ledger, a letter of recovery is on its way.');
      });
  };

  return (
    <div
      className="tw-stone-wash"
      style={{
        minHeight: '100vh',
        background: 'var(--surface-page)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          maxWidth: 1180,
          width: '100%',
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
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← To the Field
          </Button>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px 80px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ ...rune, fontSize: 18, marginBottom: 14 }}>ᛏ&nbsp;&nbsp;ᛁ&nbsp;&nbsp;ᛜ</div>
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(30px, 5vw, 40px)',
                lineHeight: 1.04,
                color: 'var(--text-1)',
              }}
            >
              {mode === 'enrol' ? 'Swear your oath' : mode === 'recover' ? 'Recover your oath' : 'The threshold'}
            </h1>
            <p
              style={{
                margin: '12px 0 0',
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--text-2)',
              }}
            >
              {mode === 'enrol'
                ? 'The keep will open a ledger in your name.'
                : mode === 'recover'
                  ? 'Name yourself, and a letter of recovery is sent.'
                  : 'Only the sworn cross into the cabinets.'}
            </p>
          </div>

          <Card padding="var(--space-5)">
            {!isFirebaseConfigured && (
              <div style={{ marginBottom: 18 }}>
                <Toast tone="wounded" title="The hall is sealed">
                  No ledger keys are set. Entry opens once the Firebase config is filled in
                  <code style={{ fontFamily: 'var(--font-mono)' }}> .env</code>.
                </Toast>
              </div>
            )}

            {mode !== 'recover' && (
              <Tabs
                tabs={[
                  { value: 'enter', label: 'Enter' },
                  { value: 'enrol', label: 'Be enrolled' },
                ]}
                value={mode}
                onChange={(v) => {
                  setMode(v as Mode);
                  reset();
                }}
                style={{ marginBottom: 20 }}
              />
            )}

            {mode !== 'recover' && (
              <>
                <Button
                  block
                  variant="secondary"
                  iconStart={<GoogleMark />}
                  disabled={!isFirebaseConfigured || busy}
                  onClick={() => run(() => signInWithGoogle())}
                >
                  {mode === 'enrol' ? 'Be enrolled with Google' : 'Enter with Google'}
                </Button>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '18px 0',
                    color: 'var(--text-3)',
                  }}
                >
                  <span style={{ flex: 1, height: 1, background: 'var(--border-1)' }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                    }}
                  >
                    or by name
                  </span>
                  <span style={{ flex: 1, height: 1, background: 'var(--border-1)' }} />
                </div>
              </>
            )}

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'enrol' && (
                <Field label="Known as" htmlFor="tw-name" required>
                  <Input
                    id="tw-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="The name the keep will call you"
                    autoComplete="name"
                  />
                </Field>
              )}
              <Field label="Name in the ledger" htmlFor="tw-email" required>
                <Input
                  id="tw-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </Field>
              {mode !== 'recover' && (
                <Field
                  label="Oath"
                  htmlFor="tw-password"
                  required
                  hint={mode === 'enrol' ? 'At least six characters.' : undefined}
                >
                  <Input
                    id="tw-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'enrol' ? 'new-password' : 'current-password'}
                    required
                  />
                </Field>
              )}

              {error && (
                <Toast tone="dead" title="The rite faltered" onDismiss={() => setError(null)}>
                  {error}
                </Toast>
              )}
              {notice && (
                <Toast tone="accent" title="So it is recorded" onDismiss={() => setNotice(null)}>
                  {notice}
                </Toast>
              )}

              <Button
                block
                type="submit"
                size="lg"
                loading={busy}
                disabled={!isFirebaseConfigured}
              >
                {mode === 'enrol' ? 'Swear & enrol' : mode === 'recover' ? 'Send recovery' : 'Enter the cabinet'}
              </Button>
            </form>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
              }}
            >
              {mode === 'enter' ? (
                <a
                  onClick={() => {
                    setMode('recover');
                    reset();
                  }}
                  style={{ cursor: 'pointer', color: 'var(--text-3)' }}
                >
                  Forgotten your oath?
                </a>
              ) : (
                <a
                  onClick={() => {
                    setMode('enter');
                    reset();
                  }}
                  style={{ cursor: 'pointer', color: 'var(--text-3)' }}
                >
                  ← Back to entry
                </a>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
