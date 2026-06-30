import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LarpSite from './kits/LarpSite';
import LarpCabinet from './kits/LarpCabinet';
import TtrpgTable from './kits/TtrpgTable';
import CabinetSelector from './kits/CabinetSelector';
import AuthGate from './kits/auth/AuthGate';
import VerifyNotice from './kits/auth/VerifyNotice';
import { RequireRole, RequireVerified } from './kits/auth/guards';
import { RoleSwitcher } from './kits/auth/RoleSwitcher';
import { useSessionInit } from './stores/useSessionInit';
import { useSession } from './stores/sessionStore';
import { rememberSurface } from './lib/users';
import type { RoleApp } from './lib/types';

/*
 * App — the TriWizard three-surface shell, now route-driven (Tier 1).
 *
 *   /          → public LARP site (dark / light)
 *   /login     → the threshold: sign in / enrol / recover
 *   /verify    → email-verification gate
 *   /cabinet   → cabinet selector (sworn + verified)
 *   /larp      → LARP cabinet  (active 'larp' standing, or admin)
 *   /ttrpg     → TTRPG table   (active 'ttrpg' standing, or admin)
 *
 * Site / LARP cabinet share one folklore-academy skin ('site'); the TTRPG table
 * keeps its own ('ttrpg'). The active data-theme on <html> follows the route.
 * Per-route guards live in kits/auth/guards. Auth state is wired into the
 * session store by useSessionInit (called once here).
 */

/** Which theme surface a path belongs to. */
function surfaceOf(pathname: string): 'site' | 'ttrpg' {
  return pathname.startsWith('/ttrpg') ? 'ttrpg' : 'site';
}

/** Floating admin role-switch over the cabinet routes (B1.5); admins only. */
function AdminOverlay({ app, children }: { app: RoleApp; children: React.ReactElement }) {
  return (
    <>
      {children}
      <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 400 }}>
        <RoleSwitcher app={app} />
      </div>
    </>
  );
}

export default function App() {
  useSessionInit();
  const navigate = useNavigate();
  const location = useLocation();

  const themes = useSession((s) => s.themes);
  const setThemeFor = useSession((s) => s.setTheme);
  const setLastSurface = useSession((s) => s.setLastSurface);
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);

  const surface = surfaceOf(location.pathname);
  const activeTheme = surface === 'ttrpg' ? themes.ttrpg : themes.site;

  // Active skin follows the route.
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Remember where the bearer last stood and the skin chosen there.
  React.useEffect(() => {
    setLastSurface(surface);
    if (user) rememberSurface(user.uid, surface, { surface, value: activeTheme });
  }, [surface, activeTheme, user, setLastSurface]);

  const setSiteTheme = (t: string) => setThemeFor('site', t);
  const setTtrpgTheme = (t: string) => setThemeFor('ttrpg', t);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LarpSite
            theme={themes.site}
            setTheme={setSiteTheme}
            onEnterCabinet={() => navigate('/cabinet')}
            onTTRPG={() => navigate('/ttrpg')}
          />
        }
      />

      <Route
        path="/login"
        element={
          status === 'authed' ? (
            <Navigate to="/cabinet" replace />
          ) : (
            <AuthGate theme={themes.site} setTheme={setSiteTheme} onBack={() => navigate('/')} />
          )
        }
      />

      <Route path="/verify" element={<VerifyNotice />} />

      <Route
        path="/cabinet"
        element={
          <RequireVerified>
            <CabinetSelector
              theme={themes.site}
              setTheme={setSiteTheme}
              onEnterLarp={() => navigate('/larp')}
              onEnterTtrpg={() => navigate('/ttrpg')}
              onBack={() => navigate('/')}
            />
          </RequireVerified>
        }
      />

      <Route
        path="/larp"
        element={
          <RequireRole app="larp" onLeave={() => navigate('/cabinet')}>
            <AdminOverlay app="larp">
              <LarpCabinet
                theme={themes.site}
                setTheme={setSiteTheme}
                onTTRPG={() => navigate('/ttrpg')}
                onExit={() => navigate('/')}
              />
            </AdminOverlay>
          </RequireRole>
        }
      />

      <Route
        path="/ttrpg"
        element={
          <RequireRole app="ttrpg" onLeave={() => navigate('/cabinet')}>
            <AdminOverlay app="ttrpg">
              <TtrpgTable
                theme={themes.ttrpg}
                setTheme={setTtrpgTheme}
                onLarp={() => navigate('/larp')}
                onExit={() => navigate('/')}
              />
            </AdminOverlay>
          </RequireRole>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
