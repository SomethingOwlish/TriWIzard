/* TriWizard — LARP public site screens.
   Exposes window.LarpSite.{ Header, Footer, Landing, RulesPage, OrderPage }.
   Consumes design-system primitives from window.TriWizardDesignSystem_a98f10. */
(function () {
  const DS = window.TriWizardDesignSystem_a98f10;
  const { Button, Card, Badge, Tag, ThemeSwitcher, Avatar, Tabs } = DS;

  // ---- tiny inline icon set (thin stroke, Lucide-like) ----
  const Ico = (p) => React.createElement('svg', { width: p.s || 18, height: p.s || 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', style: p.style }, p.children);
  const Anchor = (p) => <Ico {...p}><circle cx="12" cy="5" r="2.5"/><path d="M12 22V8M5 12H2a10 10 0 0020 0h-3"/></Ico>;
  const Scroll = (p) => <Ico {...p}><path d="M8 3h9a2 2 0 012 2v12M8 3a2 2 0 00-2 2v12a2 2 0 01-2 2h12a2 2 0 002-2M8 3v0"/><path d="M9 8h7M9 12h7"/></Ico>;
  const Compass = (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z"/></Ico>;
  const Shield = (p) => <Ico {...p}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></Ico>;

  const rune = { fontFamily: 'var(--font-display)', color: 'var(--accent-text)', letterSpacing: '0.3em' };

  function Header({ page, onNav }) {
    const links = [['lore', 'The Keep'], ['rules', 'The Rite'], ['order', 'The Order']];
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'color-mix(in srgb, var(--surface-page) 86%, transparent)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-1)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', gap: 32 }}>
          <a onClick={() => onNav('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <span style={{ ...rune, fontSize: 20 }}>ᛏ</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 19, letterSpacing: '0.06em', color: 'var(--text-1)' }}>TRI<span style={{ color: 'var(--accent-text)' }}>WIZARD</span></span>
          </a>
          <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            {links.map(([k, l]) => (
              <a key={k} onClick={() => onNav(k)} style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', fontSize: 15, letterSpacing: '0.02em', color: page === k ? 'var(--text-1)' : 'var(--text-3)', fontWeight: page === k ? 600 : 400, background: page === k ? 'var(--surface-raised)' : 'transparent' }}>{l}</a>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <ThemeSwitcher scope="site" applyTo="document" defaultValue="dark" showLabels={false} />
            <Button variant="secondary" size="sm">Enter the Cabinet</Button>
          </div>
        </div>
      </header>
    );
  }

  function Footer() {
    return (
      <footer style={{ borderTop: '1px solid var(--border-1)', background: 'var(--surface-sunken)', marginTop: 80 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 17, letterSpacing: '0.06em', color: 'var(--text-1)' }}>TRIWIZARD</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'var(--text-3)', marginTop: 6 }}>Durmstrang · Larp & Ttrpg</div>
          </div>
          <div style={{ display: 'flex', gap: 28, fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-3)' }}>
            <a style={{ cursor: 'pointer' }}>Charter</a><a style={{ cursor: 'pointer' }}>Calendar</a><a style={{ cursor: 'pointer' }}>Contact the Masters</a>
          </div>
        </div>
      </footer>
    );
  }

  function Hero() {
    return (
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-1)' }} className="tw-stone-wash">
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '110px 32px 96px' }}>
          <div style={{ ...rune, fontSize: 22, marginBottom: 22 }}>ᛏ&nbsp;&nbsp;ᛁ&nbsp;&nbsp;ᛜ</div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(48px, 7vw, 92px)', lineHeight: 0.98, letterSpacing: '-0.01em', color: 'var(--text-1)', maxWidth: 16 + 'ch' }}>
            Enrolment is <span style={{ color: 'var(--accent-text)' }}>survived</span>, not granted.
          </h1>
          <p style={{ margin: '28px 0 0', maxWidth: '54ch', fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.65, color: 'var(--text-2)' }}>
            A live-action saga set in the northern keep of Durmstrang. You arrive by sea, alone, bearing nothing but a name — and from that hour the school keeps a ledger of every oath you swear.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 38, flexWrap: 'wrap' }}>
            <Button size="lg" iconStart={<Anchor s={18} />}>Begin the Crossing</Button>
            <Button size="lg" variant="secondary" iconStart={<Scroll s={18} />}>Read the Rite</Button>
          </div>
          <div style={{ display: 'flex', gap: 40, marginTop: 56 }}>
            {[['IV', 'Sagas told'], ['312', 'Oaths sworn'], ['MMXXVI', 'Cohort']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, color: 'var(--text-1)' }}>{n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const PILLARS = [
    { icon: Compass, t: 'The Crossing', b: 'New players arrive by sea and are assessed at the threshold. No background is refused — only tested.' },
    { icon: Scroll, t: 'The Ledger', b: 'Every deed, wound and debt is recorded as a card. Your character is the sum of what the keep remembers.' },
    { icon: Shield, t: 'The Order', b: 'Masters keep the rite. They manage cohorts, author lore, and read the chronicle of the whole saga.' },
  ];

  function Landing({ onNav }) {
    return (
      <div>
        <Hero />
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 32px 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'var(--accent-text)', marginBottom: 14 }}>What the keep is</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {PILLARS.map((p) => (
              <Card key={p.t} interactive accentEdge>
                <p.icon s={26} style={{ color: 'var(--accent-text)' }} />
                <h3 style={{ margin: '16px 0 8px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--text-1)' }}>{p.t}</h3>
                <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-2)' }}>{p.b}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 32px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'var(--accent-text)', marginBottom: 14 }}>The two sides</div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, lineHeight: 1.05, color: 'var(--text-1)' }}>One keep. Two ways to play.</h2>
              <p style={{ margin: '20px 0 24px', fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.65, color: 'var(--text-2)', maxWidth: '46ch' }}>
                Cross the hall to the field for live events, or to the table for the chronicle in miniature — dice, sessions, and the long saga of your house.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button onClick={() => onNav('rules')}>The LARP rite</Button>
                <Button variant="ghost">The TTRPG table →</Button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card padding="18px"><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Avatar initials="LA" square /><div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--text-1)' }}>LARP — the field</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-3)' }}>Live events, assessments, house standing.</div></div></div></Card>
              <Card padding="18px"><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Avatar initials="TT" square /><div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--text-1)' }}>TTRPG — the table</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-3)' }}>Dice, sessions, graphs, the chronicle.</div></div></div></Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function RulesPage() {
    const [tab, setTab] = React.useState('crossing');
    const bodyByTab = {
      crossing: ['The Crossing', 'No candidate enters the keep by land. You arrive at the sea-gate at dusk and are met by a master who records your name, your homeland, and the marks your past has left on you. This is your first ledger entry; it cannot be unwritten.'],
      oath: ['The Iron Oath', 'At the threshold you swear the Iron Oath. The words bind you to the keep for the season. Breaking the oath is not punished by the masters — it is recorded, and the chronicle is read by all.'],
      standing: ['House Standing', 'Deeds raise standing; debts and fumbles lower it. Standing is public, drawn from the ledger, and decides who speaks first in council and who is sent first into the dark.'],
    };
    const [t, b] = bodyByTab[tab];
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 32px 0' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'var(--accent-text)', marginBottom: 12 }}>The Rite</div>
        <h1 style={{ margin: '0 0 28px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 56, color: 'var(--text-1)' }}>The Rite of Durmstrang</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 92 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[['crossing', 'I · The Crossing'], ['oath', 'II · The Iron Oath'], ['standing', 'III · House Standing']].map(([k, l]) => (
                <a key={k} onClick={() => setTab(k)} style={{ cursor: 'pointer', padding: '10px 12px', borderLeft: '2px solid', borderColor: tab === k ? 'var(--accent)' : 'var(--border-2)', color: tab === k ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'var(--font-serif)', fontSize: 15, background: tab === k ? 'var(--accent-soft)' : 'transparent' }}>{l}</a>
              ))}
            </div>
          </div>
          <article style={{ maxWidth: '68ch' }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--text-1)' }}>{t}</h2>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.75, color: 'var(--text-2)' }}>{b}</p>
            <blockquote style={{ margin: '28px 0', padding: '4px 0 4px 22px', borderLeft: '3px solid var(--accent)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.6, color: 'var(--text-1)' }}>
              “What the sea takes, the keep records. What the keep records, the saga keeps.”
            </blockquote>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.75, color: 'var(--text-2)' }}>
              Each clause of the rite is enforced not by guards but by the ledger. To play at Durmstrang is to accept that every action is written, and that the written cannot be undone — only answered.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              {['Threshold', 'Oath', 'Ledger', 'Standing', 'Council'].map((x) => <Tag key={x}>{x}</Tag>)}
            </div>
          </article>
        </div>
      </div>
    );
  }

  function OrderPage() {
    const masters = [
      ['Vök Eldgrim', 'Master of the Threshold', 'VE'],
      ['Sieglinde Ash', 'Keeper of the Ledger', 'SA'],
      ['Dragomir Crow', 'Master of the Rite', 'DC'],
      ['Hervör Salt', 'Mistress of the Dark', 'HS'],
    ];
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 32px 0' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.28em', color: 'var(--accent-text)', marginBottom: 12 }}>The Order</div>
        <h1 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 56, color: 'var(--text-1)' }}>Masters of the Keep</h1>
        <p style={{ margin: '0 0 36px', maxWidth: '56ch', fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.65, color: 'var(--text-2)' }}>
          The Order keeps the rite, authors the lore, and reads the chronicle of the whole saga. Each master runs a cabinet of cohorts and tables.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {masters.map(([n, r, i]) => (
            <Card key={n} interactive>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Avatar initials={i} size="lg" ring />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, color: 'var(--text-1)' }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text-3)' }}>{r}</div>
                </div>
                <Badge tone="ember" outline>Master</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  window.LarpSite = { Header, Footer, Landing, RulesPage, OrderPage };
})();
