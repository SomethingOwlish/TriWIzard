/* TriWizard brand deck — composes the live UI-kit screens into framed,
   per-slide-themed previews. window.Deck.getScreen(key) -> React element.
   Relies on window.LarpSite / LarpCabinet / TtrpgCabinet + the DS bundle. */
(function () {
  const noop = () => {};

  // Thin static top strip standing in for each kit's (document-theming) TopBar,
  // so per-slide theming via the wrapper isn't clobbered.
  function Strip({ label, right }) {
    return (
      <div style={{ height: 52, flexShrink: 0, borderBottom: '1px solid var(--border-1)', background: 'var(--surface-page)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-3)' }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--accent-text)' }}>{right}</span>
      </div>
    );
  }

  // Full app shell: left nav rail + top strip + scrolling content (clipped).
  function AppShell({ Nav, view, master, strip, children }) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--surface-page)' }}>
        <Nav view={view} setView={noop} master={master} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Strip {...strip} />
          <div style={{ flex: 1, overflow: 'hidden' }} className="tw-stone-wash">{children}</div>
        </div>
      </div>
    );
  }

  // A bare scrolling page (clipped to the frame) for the open-site screens.
  function PageShell({ children }) {
    return (
      <div style={{ height: '100%', width: '100%', overflow: 'hidden', background: 'var(--surface-page)' }} className="tw-stone-wash">
        {children}
      </div>
    );
  }

  function getScreen(key) {
    const S = window.LarpSite, C = window.LarpCabinet, T = window.TtrpgCabinet;
    switch (key) {
      case 'larp-landing': return <PageShell><S.Landing onNav={noop} /></PageShell>;
      case 'larp-rules':   return <PageShell><S.RulesPage /></PageShell>;
      case 'larp-order':   return <PageShell><S.OrderPage /></PageShell>;

      case 'larp-roster':  return <AppShell Nav={C.NavRail} view="roster" strip={{ label: 'LARP · The Field', right: 'Cohort B' }}><C.Roster onOpen={noop} /></AppShell>;
      case 'larp-sheet':   return <AppShell Nav={C.NavRail} view="sheet" strip={{ label: 'LARP · Character', right: 'House Storm' }}><C.Sheet /></AppShell>;
      case 'larp-manage':  return <AppShell Nav={C.NavRail} view="manage" master strip={{ label: 'LARP · Master', right: 'Player Manager' }}><C.PlayerManager /></AppShell>;
      case 'larp-texts':   return <AppShell Nav={C.NavRail} view="texts" master strip={{ label: 'LARP · Master', right: 'Text Manager' }}><C.TextManager /></AppShell>;

      case 'ttrpg-card':   return <AppShell Nav={T.NavRail} view="card" strip={{ label: 'TTRPG · Session XII', right: 'Player Card' }}><T.PlayerCard /></AppShell>;
      case 'ttrpg-dice':   return <AppShell Nav={T.NavRail} view="dice" strip={{ label: 'TTRPG · Session XII', right: 'The Dice Tray' }}><T.DiceView /></AppShell>;
      case 'ttrpg-graphs': return <AppShell Nav={T.NavRail} view="graphs" strip={{ label: 'TTRPG · Session XII', right: 'Saga Graphs' }}><T.Graphs /></AppShell>;
      case 'ttrpg-tables': return <AppShell Nav={T.NavRail} view="tables" strip={{ label: 'TTRPG · Session XII', right: 'Reference Tables' }}><T.Tables /></AppShell>;
      case 'ttrpg-chron':  return <AppShell Nav={T.NavRail} view="chronicle" strip={{ label: 'TTRPG · Session XII', right: 'The Chronicle' }}><T.Chronicle /></AppShell>;
      case 'ttrpg-master': return <AppShell Nav={T.NavRail} view="master" master strip={{ label: 'TTRPG · Master', right: 'Behind the Screen' }}><T.MasterScreen /></AppShell>;
      default: return <div style={{ color: 'var(--text-3)', padding: 40 }}>Unknown screen: {key}</div>;
    }
  }

  window.Deck = { getScreen };
})();
