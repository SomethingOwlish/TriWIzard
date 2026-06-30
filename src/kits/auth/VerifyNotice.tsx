/* TriWizard — the verification rite (B1.1, email-verification gate).
   A sworn but unverified bearer waits here until they confirm the letter sent
   to their name. They may resend it, check again, or step back across. */
import React from 'react';
import { Button, Card, Toast } from '../../components';
import { OathError, logOut, refreshCurrentUser, resendVerification } from '../../lib/auth';
import { useSession } from '../../stores/sessionStore';

const rune: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  color: 'var(--accent-text)',
  letterSpacing: '0.3em',
};

export default function VerifyNotice() {
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function resend() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await resendVerification();
      setNotice('The letter is sent again. Look to your inbox.');
    } catch (err) {
      setError(err instanceof OathError ? err.message : 'The letter could not be sent.');
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const fresh = await refreshCurrentUser();
      if (fresh) {
        setUser({
          uid: fresh.uid,
          email: fresh.email,
          displayName: fresh.displayName,
          photoURL: fresh.photoURL,
          emailVerified: fresh.emailVerified,
        });
        if (!fresh.emailVerified) {
          setNotice('Not yet confirmed. Follow the letter, then check again.');
        }
      }
    } catch {
      setError('Could not reach the ledger. Try again.');
    } finally {
      setBusy(false);
    }
  }

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
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ ...rune, fontSize: 18, marginBottom: 14 }}>ᛟ</div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 34,
              color: 'var(--text-1)',
            }}
          >
            Confirm your name
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
            A letter went to <strong style={{ color: 'var(--text-1)' }}>{user?.email}</strong>. Follow
            it to seal your oath, then return and check.
          </p>
        </div>

        <Card padding="var(--space-5)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <Toast tone="dead" title="The rite faltered" onDismiss={() => setError(null)}>
                {error}
              </Toast>
            )}
            {notice && (
              <Toast tone="accent" onDismiss={() => setNotice(null)}>
                {notice}
              </Toast>
            )}
            <Button block size="lg" loading={busy} onClick={check}>
              I have confirmed — let me pass
            </Button>
            <Button block variant="secondary" disabled={busy} onClick={resend}>
              Send the letter again
            </Button>
            <Button block variant="ghost" disabled={busy} onClick={() => logOut()}>
              Step back across the threshold
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
