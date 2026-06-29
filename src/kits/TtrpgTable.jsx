/* TriWizard — TTRPG cabinet (player + master).
   Player card, dice tray, saga graphs, reference tables, chronicle, and a
   master screen. Folklore-horror × dark-academia: blue / violet / light skins. */
import React from 'react';
import {
  Button, IconButton, Card, Badge, Tag, Avatar, Tabs, DiceRoller, StatBlock,
  DataTable, Timeline, CommentThread, Switch, ThemeSwitcher,
} from '../components';
import { Dice, Chart, Grid, Clock, CardGlyph } from './icons.jsx';

// ---- simple data-viz: bar chart ----
function BarChart({ data, max, height = 180 }) {
  const m = max || Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height, padding: '8px 4px 0' }}>
      {data.map((d) => (
        <div key={d.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{d.v}</div>
          <div style={{ width: '100%', maxWidth: 38, height: (d.v / m) * (height - 44), background: d.hi ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 42%, var(--surface-inset))', borderRadius: '3px 3px 0 0', transition: 'height var(--dur-slow) var(--ease-out)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)' }}>{d.l}</div>
        </div>
      ))}
    </div>
  );
}

// ---- simple data-viz: area/line chart (sparkline of rolls) ----
function LineChart({ points, height = 180 }) {
  const W = 520, H = height, pad = 24;
  const max = Math.max(...points), min = Math.min(...points);
  const sx = (i) => pad + (i / (points.length - 1)) * (W - pad * 2);
  const sy = (v) => pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);
  const line = points.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(' ');
  const area = `${line} L${sx(points.length - 1)} ${H - pad} L${sx(0)} ${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="tw-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g) => <line key={g} x1={pad} x2={W - pad} y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)} stroke="var(--border-1)" strokeWidth="1" />)}
      <path d={area} fill="url(#tw-area)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      {points.map((v, i) => <circle key={i} cx={sx(i)} cy={sy(v)} r="3" fill="var(--surface-card)" stroke="var(--accent)" strokeWidth="1.6" />)}
    </svg>
  );
}

function NavRail({ view, setView, master, onExit }) {
  const items = [['card', 'Player Card', CardGlyph], ['dice', 'Dice', Dice], ['graphs', 'Graphs', Chart], ['tables', 'Tables', Grid], ['chronicle', 'Chronicle', Clock]];
  if (master) items.push(['master', 'Master Screen', Grid]);
  return (
    <aside style={{ width: 216, flexShrink: 0, borderRight: '1px solid var(--border-1)', background: 'var(--surface-sunken)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div onClick={onExit} title="Back to the public site" style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 10, cursor: onExit ? 'pointer' : 'default' }}>
        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-text)', fontSize: 18, letterSpacing: '0.2em' }}>ᛜ</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, letterSpacing: '0.05em', color: 'var(--text-1)' }}>THE TABLE</span>
      </div>
      <nav style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(([k, l, I]) => (
          <a key={k} onClick={() => setView(k)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', fontSize: 15, color: view === k ? 'var(--text-1)' : 'var(--text-3)', background: view === k ? 'var(--surface-raised)' : 'transparent', borderLeft: '2px solid', borderColor: view === k ? 'var(--accent)' : 'transparent' }}>
            <I s={17} style={{ color: view === k ? 'var(--accent-text)' : 'var(--text-3)' }} />{l}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function TopBar({ master, setMaster, theme, setTheme, onLarp }) {
  return (
    <div style={{ height: 60, flexShrink: 0, borderBottom: '1px solid var(--border-1)', background: 'color-mix(in srgb, var(--surface-page) 88%, transparent)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-3)' }}>TTRPG · Session XII</div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Switch checked={master} onChange={setMaster} label="Master mode" size="sm" />
        <span style={{ width: 1, height: 24, background: 'var(--border-2)' }} />
        <ThemeSwitcher scope="ttrpg" value={theme} onChange={setTheme} />
        {onLarp && <Button variant="secondary" size="sm" onClick={onLarp}>← To the Field</Button>}
      </div>
    </div>
  );
}

function PlayerCard() {
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 26 }}>
        <Avatar initials="KN" size="xl" square status="alive" ring />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>Kára Nightveil</h1>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-3)' }}>Reader of the drowned · House Ash</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Badge tone="accent" dot>Level 6</Badge>
            <Badge tone="ember" outline>Necromancer</Badge>
            <Badge tone="alive" dot>Alive</Badge>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Attributes" eyebrow="The bones of the character" padding="20px">
            <StatBlock columns={3} stats={[
              { label: 'STR', value: 9, modifier: -1 }, { label: 'DEX', value: 14, modifier: 2 }, { label: 'CON', value: 12, modifier: 1 },
              { label: 'INT', value: 17, modifier: 3 }, { label: 'WIS', value: 16, modifier: 3 }, { label: 'CHA', value: 11, modifier: 0 },
            ]} />
          </Card>
          <Card title="Vitals" padding="20px">
            <div style={{ display: 'flex', gap: 18 }}>
              {[['Hit Points', '21 / 24', 0.875], ['Will', '9 / 10', 0.9], ['Dread', '4 / 10', 0.4]].map(([l, v, p]) => (
                <div key={l} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>{l}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)' }}>{v}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-inset)', boxShadow: 'var(--shadow-well)', overflow: 'hidden' }}>
                    <div style={{ width: (p * 100) + '%', height: '100%', background: l === 'Dread' ? 'var(--status-dead)' : 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card title="Spells & Rites" eyebrow="Known" padding="20px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Summon the Drowned', 'd8'], ['Salt Ward', 'd4'], ['Read the Bones', '—'], ['Cold Whisper', 'd6']].map(([s, d]) => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border-1)' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' }}>{s}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-text)' }}>{d}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DiceView() {
  const [log, setLog] = React.useState([{ sides: 20, raw: 14, total: 17 }, { sides: 6, raw: 5, total: 5 }]);
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>The Dice Tray</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <DiceRoller defaultSides={20} modifier={3} onRoll={(r) => setLog((l) => [r, ...l].slice(0, 8))} />
        <Card title="Roll Log" eyebrow="This session" padding="0">
          <div>
            {log.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border-1)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>d{r.sides} → {r.raw}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: r.raw === r.sides ? 'var(--status-alive)' : r.raw === 1 ? 'var(--status-dead)' : 'var(--text-1)' }}>{r.total}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Graphs() {
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>Saga Graphs</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Dread over sessions" eyebrow="The party's descent" padding="20px">
          <LineChart points={[2, 3, 3, 5, 4, 6, 7, 6, 8]} />
        </Card>
        <Card title="Rolls by die" eyebrow="Session XII" padding="20px">
          <BarChart data={[{ l: 'd4', v: 6 }, { l: 'd6', v: 11 }, { l: 'd8', v: 7 }, { l: 'd10', v: 4 }, { l: 'd20', v: 18, hi: true }, { l: 'd100', v: 2 }]} />
        </Card>
        <Card title="House standing" eyebrow="End of season" padding="20px" style={{ gridColumn: '1 / -1' }}>
          <BarChart data={[{ l: 'Storm', v: 94, hi: true }, { l: 'Ash', v: 88 }, { l: 'Crow', v: 41 }, { l: 'Frost', v: 67 }, { l: 'Salt', v: 73 }]} height={200} />
        </Card>
      </div>
    </div>
  );
}

function Tables() {
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>Reference Tables</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-text)', marginBottom: 10 }}>Wild Magic · d20</div>
          <DataTable dense
            columns={[{ key: 'roll', label: 'Roll', mono: true, width: 70, align: 'right' }, { key: 'effect', label: 'Effect' }, { key: 'sev', label: 'Severity', render: (v) => <Badge tone={v === 'Grave' ? 'dead' : v === 'Ill' ? 'wounded' : 'alive'} dot>{v}</Badge> }]}
            rows={[
              { roll: '1', effect: 'The drowned answer in your stead.', sev: 'Grave' },
              { roll: '7', effect: 'Salt crusts the caster\'s eyes for an hour.', sev: 'Ill' },
              { roll: '13', effect: 'A cold wind reveals one hidden thing.', sev: 'Fair' },
              { roll: '20', effect: 'The bones favour you — reroll any one die.', sev: 'Fair' },
            ]} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-text)', marginBottom: 10 }}>Party Roster</div>
          <DataTable
            columns={[
              { key: 'name', label: 'Character', render: (v, r) => <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar initials={r.i} size="xs" status={r.s} />{v}</span> },
              { key: 'cls', label: 'Discipline' }, { key: 'lvl', label: 'Lvl', align: 'right', mono: true }, { key: 'hp', label: 'HP', align: 'right', mono: true },
            ]}
            rows={[
              { i: 'KN', name: 'Kára Nightveil', cls: 'Necromancer', lvl: 6, hp: '21/24', s: 'alive' },
              { i: 'IV', name: 'Ivar the Drowned', cls: 'Runecaster', lvl: 7, hp: '8/18', s: 'wounded' },
              { i: 'SF', name: 'Sieglinde Frost', cls: 'Pyromancer', lvl: 8, hp: '24/24', s: 'alive' },
            ]} />
        </div>
      </div>
    </div>
  );
}

function Chronicle() {
  return (
    <div style={{ padding: 32, maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>The Chronicle</h1>
      <p style={{ margin: '0 0 28px', fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-3)' }}>Player chronology · Kára Nightveil</p>
      <Card padding="26px">
        <Timeline events={[
          { time: 'Session I', title: 'The Crossing', body: 'Arrived at the sea-gate. Sworn to House Ash.', tone: 'neutral' },
          { time: 'Session IV', title: 'Oath of Salt', body: 'Bound to read the drowned for the cohort.', tone: 'accent' },
          { time: 'Session VII', title: 'The First Summoning', body: 'Raised a drowned sailor. Gained 1 Dread.', tone: 'neutral' },
          { time: 'Session IX', title: 'Dragomir Falls', body: 'Witnessed the oathbreaker struck from the ledger.', tone: 'dead' },
          { time: 'Session XII', title: 'Into the Dark', body: 'Descends with the party. Dread at 8 of 10.', tone: 'accent' },
        ]} />
      </Card>
    </div>
  );
}

function MasterScreen() {
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--accent-text)', marginBottom: 8 }}>Master · Behind the screen</div>
      <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>Master Screen</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, alignItems: 'start' }}>
        <Card title="Initiative" eyebrow="This encounter" padding="0">
          <div>
            {[['Sieglinde Frost', 21, 'SF', 'alive'], ['Kára Nightveil', 17, 'KN', 'alive'], ['The Drowned Host', 14, 'DH', 'wounded'], ['Ivar the Drowned', 9, 'IV', 'wounded']].map(([n, init, i, s], idx) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border-1)', background: idx === 0 ? 'var(--accent-soft)' : 'transparent' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: idx === 0 ? 'var(--accent-text)' : 'var(--text-3)', width: 30 }}>{init}</span>
                <Avatar initials={i} size="sm" status={s} />
                <span style={{ flex: 1, fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' }}>{n}</span>
                {idx === 0 && <Badge tone="accent" dot>Acting</Badge>}
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Master's roll" padding="18px"><DiceRoller defaultSides={20} dice={[6, 8, 12, 20]} /></Card>
        </div>
      </div>
    </div>
  );
}

/** TtrpgTable — player & master TTRPG cabinet shell. Theme is owned by the App. */
export default function TtrpgTable({ theme, setTheme, onExit, onLarp }) {
  const [view, setView] = React.useState('card');
  const [master, setMaster] = React.useState(false);
  React.useEffect(() => { if (!master && view === 'master') setView('card'); }, [master, view]);
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <NavRail view={view} setView={setView} master={master} onExit={onExit} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar master={master} setMaster={setMaster} theme={theme} setTheme={setTheme} onLarp={onLarp} />
        <div style={{ flex: 1, overflow: 'auto' }} className="tw-stone-wash">
          {view === 'card' && <PlayerCard />}
          {view === 'dice' && <DiceView />}
          {view === 'graphs' && <Graphs />}
          {view === 'tables' && <Tables />}
          {view === 'chronicle' && <Chronicle />}
          {view === 'master' && master && <MasterScreen />}
        </div>
      </div>
    </div>
  );
}

export { NavRail, TopBar, PlayerCard, DiceView, Graphs, Tables, Chronicle, MasterScreen };
