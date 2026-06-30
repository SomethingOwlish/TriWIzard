/* TriWizard — LARP cabinet (player + master).
   Roster, character sheet with assessment + comments, and master tools
   (player manager, text manager). Same folklore-academy skins as the site. */
import React from 'react';
import {
  Button, IconButton, Card, Badge, Tag, Avatar, Tabs, Field, Input, Textarea,
  Select, CharacterCard, CommentThread, DataTable, Switch, Dialog, ThemeSwitcher,
} from '../components';
import { Users, Scroll as ScrollI, Edit, Plus } from './icons';

interface Vital {
  label: string;
  value: number;
}

interface Char {
  name: string;
  epithet: string;
  faction: string;
  level: number;
  status: 'alive' | 'wounded' | 'dead';
  initials: string;
  vitals: Vital[];
}

interface Props {
  theme: string;
  setTheme: (t: string) => void;
  onTTRPG: () => void;
  onExit: () => void;
}

const CHARS: Char[] = [
  { name: 'Ivar the Drowned', epithet: 'Saltbound, third of his line', faction: 'House Storm', level: 7, status: 'wounded', initials: 'IV', vitals: [{ label: 'HP', value: 18 }, { label: 'Armour', value: 4 }, { label: 'Standing', value: 62 }] },
  { name: 'Kára Nightveil', epithet: 'Reader of the drowned', faction: 'House Ash', level: 6, status: 'alive', initials: 'KN', vitals: [{ label: 'HP', value: 21 }, { label: 'Armour', value: 2 }, { label: 'Standing', value: 88 }] },
  { name: 'Dragomir Vale', epithet: 'Oathbreaker, struck', faction: 'House Crow', level: 4, status: 'dead', initials: 'DV', vitals: [{ label: 'HP', value: 0 }, { label: 'Armour', value: 3 }, { label: 'Standing', value: 12 }] },
  { name: 'Sieglinde Frost', epithet: 'First of the cohort', faction: 'House Storm', level: 8, status: 'alive', initials: 'SF', vitals: [{ label: 'HP', value: 24 }, { label: 'Armour', value: 5 }, { label: 'Standing', value: 94 }] },
];

type IconComponent = (p: { s?: number; style?: React.CSSProperties }) => React.ReactElement;
type CabinetView = 'roster' | 'sheet' | 'manage' | 'texts';

interface NavRailProps {
  view: CabinetView;
  setView: (v: CabinetView) => void;
  master: boolean;
  onExit?: () => void;
}

function NavRail({ view, setView, master, onExit }: NavRailProps) {
  const items: [CabinetView, string, IconComponent][] = [['roster', 'Cohort', Users], ['sheet', 'Character', ScrollI]];
  if (master) items.push(['manage', 'Player Manager', Users], ['texts', 'Text Manager', Edit]);
  return (
    <aside style={{ width: 232, flexShrink: 0, borderRight: '1px solid var(--border-1)', background: 'var(--surface-sunken)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div onClick={onExit} title="Back to the public site" style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 10, cursor: onExit ? 'pointer' : 'default' }}>
        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-text)', fontSize: 18, letterSpacing: '0.2em' }}>ᛏ</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', color: 'var(--text-1)' }}>CABINET</span>
      </div>
      <nav style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(([k, l, I]) => (
          <a key={k} onClick={() => setView(k)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', fontSize: 15, color: view === k ? 'var(--text-1)' : 'var(--text-3)', background: view === k ? 'var(--surface-raised)' : 'transparent', borderLeft: '2px solid', borderColor: view === k ? 'var(--accent)' : 'transparent' }}>
            <I s={17} style={{ color: view === k ? 'var(--accent-text)' : 'var(--text-3)' }} />{l}
          </a>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initials="IV" size="sm" status="wounded" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ivar Holm</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>Player · Cohort B</div>
        </div>
      </div>
    </aside>
  );
}

interface TopBarProps {
  master: boolean;
  setMaster: (m: boolean) => void;
  onTTRPG: () => void;
  theme: string;
  setTheme: (t: string) => void;
}

function TopBar({ master, setMaster, onTTRPG, theme, setTheme }: TopBarProps) {
  return (
    <div style={{ height: 60, flexShrink: 0, borderBottom: '1px solid var(--border-1)', background: 'color-mix(in srgb, var(--surface-page) 88%, transparent)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-3)' }}>LARP · The Field</div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Switch checked={master} onChange={setMaster} label="Master mode" size="sm" />
        <span style={{ width: 1, height: 24, background: 'var(--border-2)' }} />
        <ThemeSwitcher scope="site" value={theme} onChange={setTheme} showLabels={false} />
        <Button variant="secondary" size="sm" onClick={onTTRPG}>To the Table →</Button>
      </div>
    </div>
  );
}

interface RosterProps {
  onOpen: (c: Char) => void;
}

function Roster({ onOpen }: RosterProps) {
  const [filter, setFilter] = React.useState('all');
  const shown = filter === 'all' ? CHARS : CHARS.filter((c) => c.status === filter);
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--accent-text)', marginBottom: 8 }}>Your cohort</div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 38, color: 'var(--text-1)' }}>Characters of Record</h1>
        </div>
        <Button iconStart={<Plus s={16} />}>New Character</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {([['all', 'All'], ['alive', 'Alive'], ['wounded', 'Wounded'], ['dead', 'Fallen']] as [string, string][]).map(([k, l]) => (
          <Tag key={k} selected={filter === k} onClick={() => setFilter(k)}>{l}</Tag>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
        {shown.map((c) => <CharacterCard key={c.name} {...c} onClick={() => onOpen(c)} />)}
      </div>
    </div>
  );
}

interface Comment {
  author: string;
  role?: string;
  time: string;
  body: string;
}

interface SheetProps {
  character: Char | null;
}

function Sheet({ character }: SheetProps) {
  const c = character || CHARS[0];
  const [tab, setTab] = React.useState('assessment');
  const [comments, setComments] = React.useState<Comment[]>([
    { author: 'Master Vök', role: 'Master', time: '2d', body: 'Assessment approved. The salt-mark is genuine — note it in the chronicle.' },
    { author: 'Kára Nightveil', time: '1d', body: 'I witnessed the crossing. He did not flinch at the gate.' },
  ]);
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 26 }}>
        <Avatar initials={c.initials} size="xl" square status={c.status} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>{c.name}</h1>
            <Badge tone={c.status === 'dead' ? 'dead' : c.status === 'wounded' ? 'wounded' : 'alive'} dot>{c.status}</Badge>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-3)', marginTop: 2 }}>{c.epithet}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Badge tone="ember" outline>{c.faction}</Badge>
            <Badge tone="neutral">Level {c.level}</Badge>
          </div>
        </div>
        <Button variant="secondary" iconStart={<Edit s={15} />}>Edit</Button>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'assessment', label: 'Assessment' }, { value: 'remarks', label: 'Remarks', count: comments.length }, { value: 'inventory', label: 'Inventory' }]} />

      <div style={{ marginTop: 24 }}>
        {tab === 'assessment' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card title="Threshold Assessment" eyebrow="Recorded at the sea-gate" padding="20px">
              <div style={{ display: 'grid', gap: 16 }}>
                <Field label="Homeland"><Input defaultValue="Vestfjord, Norway" /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Discipline"><Select defaultValue="rune"><option value="rune">Runecraft</option><option value="pyro">Pyromancy</option><option value="necro">Necromancy</option></Select></Field>
                  <Field label="House"><Select defaultValue="storm"><option value="storm">Storm</option><option value="ash">Ash</option><option value="crow">Crow</option></Select></Field>
                </div>
                <Field label="The mark the past has left" hint="Spoken at the threshold; cannot be unwritten.">
                  <Textarea rows={3} defaultValue="The sea took his brothers. He carries their names tattooed at the wrist and answers to none of them." />
                </Field>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Salt-marked', 'Oathbound', 'Silent', 'Stormblood'].map((t) => <Tag key={t}>{t}</Tag>)}
                  <Tag onClick={() => {}} icon={<Plus s={12} />}>Add trait</Tag>
                </div>
              </div>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card title="Vitals" eyebrow="Drawn from the ledger" padding="20px">
                <div style={{ display: 'flex' }}>
                  {c.vitals.map((v, i) => (
                    <div key={v.label} style={{ flex: 1, textAlign: 'center', padding: '8px 6px', borderLeft: i ? '1px solid var(--border-1)' : 'none' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)' }}>{v.label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--text-1)' }}>{v.value}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Standing" eyebrow="Public to the cohort" padding="20px" accentEdge>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 44, color: 'var(--accent-text)' }}>{c.vitals[2]?.value ?? '—'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--status-alive)' }}>▲ +6 this season</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-inset)', boxShadow: 'var(--shadow-well)', marginTop: 12, overflow: 'hidden' }}>
                  <div style={{ width: (c.vitals[2]?.value ?? 0) + '%', height: '100%', background: 'var(--accent)' }} />
                </div>
              </Card>
            </div>
          </div>
        )}
        {tab === 'remarks' && (
          <Card title="Remarks" eyebrow="The cohort speaks" padding="22px" style={{ maxWidth: 720 }}>
            <CommentThread comments={comments} onSubmit={(text: string) => setComments((cs) => [...cs, { author: 'Ivar Holm', time: 'now', body: text }])} />
          </Card>
        )}
        {tab === 'inventory' && (
          <DataTable
            columns={[{ key: 'item', label: 'Item' }, { key: 'kind', label: 'Kind' }, { key: 'cond', label: 'Condition' }, { key: 'val', label: 'Worth', align: 'right', mono: true }]}
            rows={[
              { item: 'Sea-iron blade', kind: 'Weapon', cond: 'Notched', val: '120' },
              { item: 'Drowned charm', kind: 'Relic', cond: 'Whole', val: '340' },
              { item: 'Oath token', kind: 'Bond', cond: 'Sworn', val: '—' },
            ]} />
        )}
      </div>
    </div>
  );
}

function PlayerManager() {
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--accent-text)', marginBottom: 8 }}>Master · Cohort B</div>
      <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>Player Manager</h1>
      <DataTable
        onRowClick={() => {}}
        columns={[
          { key: 'player', label: 'Player', render: (v: React.ReactNode, r: { initials: string; status: 'alive' | 'wounded' | 'dead' }) => <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar initials={r.initials} size="xs" status={r.status} />{v}</span> },
          { key: 'character', label: 'Character' },
          { key: 'house', label: 'House' },
          { key: 'standing', label: 'Standing', align: 'right', mono: true },
          { key: 'state', label: 'State', render: (v: string) => <Badge tone={v === 'dead' ? 'dead' : v === 'wounded' ? 'wounded' : 'alive'} dot>{v}</Badge> },
        ]}
        rows={CHARS.map((c) => ({ initials: c.initials, player: c.name.split(' ')[0] + ' Holm', character: c.name, house: c.faction.replace('House ', ''), standing: c.vitals[2].value, state: c.status, status: c.status }))} />
    </div>
  );
}

function TextManager() {
  const [open, setOpen] = React.useState(false);
  const texts: [string, string, string][] = [['The Crossing', 'Published', 'I'], ['The Iron Oath', 'Published', 'II'], ['House Standing', 'Draft', 'III'], ['The Drowning Rite', 'Draft', 'IV']];
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--accent-text)', marginBottom: 8 }}>Master · Lore</div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--text-1)' }}>Text Manager</h1>
        </div>
        <Button iconStart={<Plus s={16} />} onClick={() => setOpen(true)}>New Text</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {texts.map(([t, s, n]) => (
          <Card key={t} interactive padding="16px 20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-3)', width: 34 }}>{n}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--text-1)' }}>{t}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-3)' }}>Clause of the Rite</div>
              </div>
              <Badge tone={s === 'Published' ? 'alive' : 'neutral'} dot>{s}</Badge>
              <IconButton label="Edit"><Edit s={16} /></IconButton>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} eyebrow="New text" title="Author a clause"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Discard</Button><Button onClick={() => setOpen(false)}>Save draft</Button></>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Field label="Title"><Input placeholder="The Drowning Rite" /></Field>
          <Field label="Body"><Textarea rows={4} placeholder="What the sea takes…" /></Field>
        </div>
      </Dialog>
    </div>
  );
}

/** LarpCabinet — player & master cabinet shell. */
export default function LarpCabinet({ onTTRPG, onExit, theme, setTheme }: Props) {
  const [view, setView] = React.useState<CabinetView>('roster');
  const [master, setMaster] = React.useState(false);
  const [character, setCharacter] = React.useState<Char | null>(null);
  React.useEffect(() => { if (!master && (view === 'manage' || view === 'texts')) setView('roster'); }, [master, view]);
  const open = (c: Char) => { setCharacter(c); setView('sheet'); };
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <NavRail view={view} setView={setView} master={master} onExit={onExit} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar master={master} setMaster={setMaster} onTTRPG={onTTRPG} theme={theme} setTheme={setTheme} />
        <div style={{ flex: 1, overflow: 'auto' }} className="tw-stone-wash">
          {view === 'roster' && <Roster onOpen={open} />}
          {view === 'sheet' && <Sheet character={character} />}
          {view === 'manage' && master && <PlayerManager />}
          {view === 'texts' && master && <TextManager />}
        </div>
      </div>
    </div>
  );
}

export { NavRail, TopBar, Roster, Sheet, PlayerManager, TextManager };
