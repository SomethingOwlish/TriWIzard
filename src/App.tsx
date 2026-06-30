import React from 'react';
import LarpSite from './kits/LarpSite';
import LarpCabinet from './kits/LarpCabinet';
import TtrpgTable from './kits/TtrpgTable';

/*
 * App — the TriWizard three-surface shell.
 *
 *   site   → public LARP site (dark / light)
 *   larp   → LARP cabinet, player + master (dark / light)
 *   ttrpg  → TTRPG table, player + master (blue / violet / light)
 *
 * The Site and LARP cabinet share one folklore-academy skin (`siteTheme`);
 * the TTRPG table keeps its own skin (`ttrpgTheme`). The active `data-theme`
 * on <html> is derived from whichever surface is showing.
 */
type Surface = 'site' | 'larp' | 'ttrpg';

export default function App() {
  const [surface, setSurface] = React.useState<Surface>('site');
  const [siteTheme, setSiteTheme] = React.useState('dark');
  const [ttrpgTheme, setTtrpgTheme] = React.useState('ttrpg-violet');

  const activeTheme = surface === 'ttrpg' ? ttrpgTheme : siteTheme;

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  switch (surface) {
    case 'larp':
      return (
        <LarpCabinet
          theme={siteTheme}
          setTheme={setSiteTheme}
          onTTRPG={() => setSurface('ttrpg')}
          onExit={() => setSurface('site')}
        />
      );
    case 'ttrpg':
      return (
        <TtrpgTable
          theme={ttrpgTheme}
          setTheme={setTtrpgTheme}
          onLarp={() => setSurface('larp')}
          onExit={() => setSurface('site')}
        />
      );
    case 'site':
    default:
      return (
        <LarpSite
          theme={siteTheme}
          setTheme={setSiteTheme}
          onEnterCabinet={() => setSurface('larp')}
          onTTRPG={() => setSurface('ttrpg')}
        />
      );
  }
}
