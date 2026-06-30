/* TriWizard — TTRPG Bestiary (Tier 4: B4.4). The GM keeps NPC dossiers (a single
   soft-hidden doc each: a player-facing card plus behind-the-screen secret, stats
   and graph position) and a GM-only connections graph (drag-positioned SVG nodes,
   directed & toned edges). Players see only the published cards, never the web.
   Built on src/lib/npcs.ts + the design primitives. */
import React from 'react';
import {
  Button, Card, Badge, Field, Input, Textarea, Select, Switch, Dialog, Toast, ImagePicker, Markdown,
} from '../../components';
import { Plus, Edit, Users, Chart } from '../icons';
import { STAT_KEYS, STATS, HOUSES, HOUSE_BY_ID, isGmRole, type CardRole, type CharStatus, type HouseId, type StatKey } from '../../lib/pbta';
import {
  blankNpcCard, blankNpcExtras, createNpc, saveNpcDraft, publishNpc, unpublishNpc, deleteNpc,
  fetchNpcs, setNpcPos, fetchEdges, saveEdges,
  type NpcCard, type NpcEntry, type NpcExtras, type NpcEdge, type EdgeTone,
} from '../../lib/npcs';

const uid = () => Math.random().toString(36).slice(2, 8);
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-3)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-1)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' };

const STATUS: { value: CharStatus; label: string }[] = [
  { value: 'alive', label: 'Alive' }, { value: 'wounded', label: 'Wounded' }, { value: 'dead', label: 'Dead' }, { value: 'unknown', label: 'Unknown' },
];
const statusTone = (s: CharStatus) => s === 'alive' ? 'alive' : s === 'wounded' ? 'wounded' : s === 'dead' ? 'dead' : 'neutral';
const edgeColor = (t: EdgeTone) => t === 'ally' ? 'var(--status-alive)' : t === 'enemy' ? 'var(--status-dead)' : 'var(--border-strong)';

// ---- one player-facing dossier card ----------------------------------------
function NpcDossier({ c, children }: { c: NpcCard; children?: React.ReactNode }) {
  const house = c.house ? HOUSE_BY_ID[c.house] : null;
  return (
    <Card padding="0" accentEdge={false}>
      <div style={{ display: 'flex', gap: 14, padding: 16 }}>
        <div style={{ width: 76, height: 76, flexShrink: 0, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-2)', boxShadow: 'var(--shadow-well)', background: c.portrait ? `center / cover no-repeat url(${c.portrait})` : 'var(--surface-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!c.portrait && <span style={{ ...display, fontSize: 24, color: 'var(--text-3)' }}>{(c.name || '?').slice(0, 1)}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...display, fontSize: 19 }}>{c.name || 'Unnamed'}</span>
            {c.ru && <span style={{ ...serif, fontStyle: 'italic', fontSize: 13, color: 'var(--text-3)' }}>{c.ru}</span>}
          </div>
          {c.epithet && <div style={{ ...serif, fontStyle: 'italic', fontSize: 14, color: 'var(--text-2)' }}>{c.epithet}</div>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            <Badge tone={statusTone(c.status)} dot>{c.status}</Badge>
            {house && <Badge tone="accent" outline>{house.rune} {house.en}</Badge>}
            {c.faction && <Badge tone="neutral" outline>{c.faction}</Badge>}
          </div>
        </div>
        {children}
      </div>
      {(c.description || c.tags.length > 0) && (
        <div style={{ borderTop: '1px solid var(--border-1)', padding: '14px 16px' }}>
          {c.description && <Markdown source={c.description} />}
          {c.tags.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>{c.tags.map((t) => <Badge key={t} tone="neutral" outline>{t}</Badge>)}</div>}
        </div>
      )}
    </Card>
  );
}

// ---- GM editor -------------------------------------------------------------
function NpcEditor({ initial, onSave, onClose, onDelete }: {
  initial: { card: NpcCard; extras: NpcExtras }; onSave: (card: NpcCard, extras: NpcExtras) => void; onClose: () => void; onDelete?: () => void;
}) {
  const [card, setCard] = React.useState<NpcCard>(initial.card);
  const [extras, setExtras] = React.useState<NpcExtras>(initial.extras);
  const setC = (p: Partial<NpcCard>) => setCard((c) => ({ ...c, ...p }));
  const hasStats = extras.stats !== null;
  const setStat = (k: StatKey, v: number) => setExtras((e) => ({ ...e, stats: { ...(e.stats ?? { dex: 0, end: 0, will: 0, mag: 0, per: 0, wit: 0 }), [k]: v } }));
  return (
    <Dialog open width={640} onClose={onClose} eyebrow="Master · the bestiary" title={card.name || 'A new soul'}
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          {onDelete && <Button variant="danger" size="sm" onClick={onDelete}>Banish</Button>}
          <span style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!card.name.trim()} onClick={() => onSave(card, extras)}>Save</Button>
        </div>
      }>
      <div style={{ display: 'grid', gap: 14, padding: '4px 0' }}>
        <Field label="Portrait"><ImagePicker height={120} value={{ url: card.portrait, deletehash: card.portraitDeletehash }} onChange={(v) => setC({ portrait: v.url, portraitDeletehash: v.deletehash })} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Name (EN)"><Input value={card.name} onChange={(e) => setC({ name: e.target.value })} /></Field>
          <Field label="Имя (RU)"><Input value={card.ru} onChange={(e) => setC({ ru: e.target.value })} /></Field>
        </div>
        <Field label="Epithet / title"><Input value={card.epithet} onChange={(e) => setC({ epithet: e.target.value })} placeholder="the Drowned" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="House">
            <Select value={card.house} onChange={(e) => setC({ house: (e.target.value || '') as HouseId | '' })}>
              <option value="">— none —</option>
              {HOUSES.map((h) => <option key={h.id} value={h.id}>{h.rune} {h.en}</option>)}
            </Select>
          </Field>
          <Field label="Faction"><Input value={card.faction} onChange={(e) => setC({ faction: e.target.value })} placeholder="The Host" /></Field>
          <Field label="Status">
            <Select value={card.status} onChange={(e) => setC({ status: e.target.value as CharStatus })}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Public description" hint="Shown to players · markdown"><Textarea rows={4} value={card.description} onChange={(e) => setC({ description: e.target.value })} /></Field>
        <Field label="Tags" hint="Comma-separated"><Input value={card.tags.join(', ')} onChange={(e) => setC({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} /></Field>
        <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 12 }}>
          <div style={mono}>Behind the screen</div>
          <Field label="Secret notes" hint="Not meant for players" style={{ marginTop: 8 }}><Textarea rows={3} value={extras.secret} onChange={(e) => setExtras((x) => ({ ...x, secret: e.target.value }))} /></Field>
          <Switch style={{ marginTop: 10 }} checked={hasStats} label="This NPC rolls dice (give a stat line)" onChange={(v) => setExtras((x) => ({ ...x, stats: v ? (x.stats ?? { dex: 0, end: 0, will: 0, mag: 0, per: 0, wit: 0 }) : null }))} />
          {hasStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 10 }}>
              {STAT_KEYS.map((k) => (
                <Field key={k} label={STATS[k].en}><Input size="sm" type="number" value={String(extras.stats?.[k] ?? 0)} onChange={(e) => setStat(k, Number(e.target.value))} /></Field>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// ---- GM connections graph --------------------------------------------------
const CANVAS = { w: 1400, h: 880 };
function ConnectionsGraph({ npcs, edges, onMovePos, onEditEdges }: {
  npcs: NpcEntry[]; edges: NpcEdge[]; onMovePos: (id: string, pos: { x: number; y: number }) => void; onEditEdges: (edges: NpcEdge[]) => void;
}) {
  const [pos, setPos] = React.useState<Record<string, { x: number; y: number }>>({});
  const drag = React.useRef<{ id: string; dx: number; dy: number } | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setPos(Object.fromEntries(npcs.map((n) => [n.id, n.pos ?? { x: 120, y: 120 }])));
  }, [npcs]);

  const at = (id: string) => pos[id] ?? { x: 120, y: 120 };

  function down(e: React.PointerEvent, id: string) {
    const box = wrap.current?.getBoundingClientRect(); if (!box) return;
    const p = at(id);
    drag.current = { id, dx: e.clientX - box.left + (wrap.current?.scrollLeft ?? 0) - p.x, dy: e.clientY - box.top + (wrap.current?.scrollTop ?? 0) - p.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    const d = drag.current; const box = wrap.current?.getBoundingClientRect(); if (!d || !box) return;
    const x = Math.max(0, e.clientX - box.left + (wrap.current?.scrollLeft ?? 0) - d.dx);
    const y = Math.max(0, e.clientY - box.top + (wrap.current?.scrollTop ?? 0) - d.dy);
    setPos((cur) => ({ ...cur, [d.id]: { x, y } }));
  }
  function up() { const d = drag.current; if (d) onMovePos(d.id, at(d.id)); drag.current = null; }

  const [ef, setEf] = React.useState<{ from: string; to: string; label: string; tone: EdgeTone }>({ from: '', to: '', label: '', tone: 'neutral' });
  const addEdge = () => { if (!ef.from || !ef.to || ef.from === ef.to) return; onEditEdges([...edges, { id: uid(), ...ef }]); setEf({ from: '', to: '', label: '', tone: 'neutral' }); };
  const nameOf = (id: string) => npcs.find((n) => n.id === id)?.draft?.name || 'NPC';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, height: '100%', minHeight: 0 }}>
      <div ref={wrap} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        style={{ position: 'relative', overflow: 'auto', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-sunken)', boxShadow: 'var(--shadow-well)' }}>
        <div style={{ position: 'relative', width: CANVAS.w, height: CANVAS.h }}>
          <svg width={CANVAS.w} height={CANVAS.h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <defs>
              {(['ally', 'enemy', 'neutral'] as EdgeTone[]).map((t) => (
                <marker key={t} id={`arrow-${t}`} markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill={edgeColor(t)} /></marker>
              ))}
            </defs>
            {edges.map((ed) => {
              const a = at(ed.from), b = at(ed.to);
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
              return (
                <g key={ed.id}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={edgeColor(ed.tone)} strokeWidth="1.6" markerEnd={`url(#arrow-${ed.tone})`} />
                  {ed.label && <text x={mx} y={my - 4} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-3)' }}>{ed.label}</text>}
                </g>
              );
            })}
          </svg>
          {npcs.map((n) => {
            const p = at(n.id); const c = n.draft;
            return (
              <div key={n.id} onPointerDown={(e) => down(e, n.id)}
                style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', cursor: 'grab', userSelect: 'none', touchAction: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', border: `2px solid ${edgeColor(statusTone(c?.status ?? 'unknown') === 'alive' ? 'ally' : statusTone(c?.status ?? 'unknown') === 'dead' ? 'enemy' : 'neutral')}`, background: c?.portrait ? `center / cover no-repeat url(${c.portrait})` : 'var(--surface-raised)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!c?.portrait && <span style={{ ...display, fontSize: 16, color: 'var(--text-2)' }}>{(c?.name || '?').slice(0, 1)}</span>}
                </div>
                <span style={{ ...serif, fontSize: 12, background: 'var(--surface-card)', padding: '1px 6px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-1)', whiteSpace: 'nowrap' }}>{c?.name || 'NPC'}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <Card title="Bind a tie" eyebrow="Connection" padding="14px">
          <div style={{ display: 'grid', gap: 8 }}>
            <Select size="sm" value={ef.from} onChange={(e) => setEf((x) => ({ ...x, from: e.target.value }))}><option value="">From…</option>{npcs.map((n) => <option key={n.id} value={n.id}>{n.draft?.name || 'NPC'}</option>)}</Select>
            <Select size="sm" value={ef.to} onChange={(e) => setEf((x) => ({ ...x, to: e.target.value }))}><option value="">To…</option>{npcs.map((n) => <option key={n.id} value={n.id}>{n.draft?.name || 'NPC'}</option>)}</Select>
            <Input size="sm" value={ef.label} onChange={(e) => setEf((x) => ({ ...x, label: e.target.value }))} placeholder="serves, betrayed, kin to…" />
            <Select size="sm" value={ef.tone} onChange={(e) => setEf((x) => ({ ...x, tone: e.target.value as EdgeTone }))}><option value="neutral">neutral</option><option value="ally">ally</option><option value="enemy">enemy</option></Select>
            <Button size="sm" iconStart={<Plus s={13} />} onClick={addEdge}>Bind</Button>
          </div>
        </Card>
        <Card title="Ties" eyebrow={`${edges.length}`} padding="0">
          {edges.length === 0 ? <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)', padding: 14 }}>No ties bound.</div> : edges.map((ed) => (
            <div key={ed.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: '1px solid var(--border-1)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: edgeColor(ed.tone), flexShrink: 0 }} />
              <span style={{ flex: 1, ...serif, fontSize: 13 }}>{nameOf(ed.from)} <span style={{ color: 'var(--text-3)' }}>{ed.label || '→'}</span> {nameOf(ed.to)}</span>
              <button type="button" aria-label="Cut" onClick={() => onEditEdges(edges.filter((x) => x.id !== ed.id))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export function BestiaryModule({ role }: { role: CardRole }) {
  const gm = isGmRole(role);
  const [rows, setRows] = React.useState<NpcEntry[]>([]);
  const [edges, setEdges] = React.useState<NpcEdge[]>([]);
  const [view, setView] = React.useState<'dossiers' | 'web'>('dossiers');
  const [editing, setEditing] = React.useState<{ id: string | null; card: NpcCard; extras: NpcExtras } | null>(null);
  const [toast, setToast] = React.useState<{ tone: 'accent' | 'dead'; msg: string } | null>(null);

  const reload = React.useCallback(async () => { try { setRows(await fetchNpcs(gm)); } catch { setRows([]); } }, [gm]);
  React.useEffect(() => { reload(); }, [reload]);
  React.useEffect(() => { if (gm) fetchEdges().then(setEdges).catch(() => setEdges([])); }, [gm]);

  async function save(card: NpcCard, extras: NpcExtras) {
    try {
      if (editing?.id) await saveNpcDraft(editing.id, card, extras); else await createNpc(card, extras);
      setEditing(null); await reload(); setToast({ tone: 'accent', msg: 'The dossier is set down.' });
    } catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'The bestiary refused it.' }); }
  }
  async function act(fn: () => Promise<void>, msg: string) {
    try { await fn(); await reload(); setToast({ tone: 'accent', msg }); }
    catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'Refused.' }); }
  }
  async function persistEdges(next: NpcEdge[]) { setEdges(next); try { await saveEdges(next); } catch { /* noop */ } }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '24px 32px 16px', gap: 16, flexWrap: 'wrap' }}>
        <div><div style={mono}>{gm ? 'Master · the bestiary' : 'Those you have met'}</div><h1 style={{ margin: '4px 0 0', ...display, fontSize: 34 }}>Bestiary</h1></div>
        {gm && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant={view === 'dossiers' ? 'primary' : 'secondary'} iconStart={<Users s={15} />} onClick={() => setView('dossiers')}>Dossiers</Button>
            <Button size="sm" variant={view === 'web' ? 'primary' : 'secondary'} iconStart={<Chart s={15} />} onClick={() => setView('web')}>The Web</Button>
            <Button size="sm" iconStart={<Plus s={15} />} onClick={() => setEditing({ id: null, card: blankNpcCard(), extras: blankNpcExtras() })}>New NPC</Button>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: view === 'web' ? 'hidden' : 'auto', padding: view === 'web' ? '0 32px 24px' : '0 32px 28px', minHeight: 0 }}>
        {rows.length === 0 ? (
          <Card padding="28px"><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Users s={22} style={{ color: 'var(--accent-text)' }} /><div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>{gm ? 'No souls recorded. Set down a dossier.' : 'You have met no one of note yet.'}</div></div></Card>
        ) : gm && view === 'web' ? (
          <ConnectionsGraph npcs={rows} edges={edges} onMovePos={(id, pos) => setNpcPos(id, pos).catch(() => {})} onEditEdges={persistEdges} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {rows.map((n) => {
              const c = gm ? n.draft : n.published; if (!c) return null;
              return (
                <NpcDossier key={n.id} c={c}>
                  {gm && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <Switch size="sm" checked={n.isPublished} onChange={(v) => act(() => v ? publishNpc(n.id) : unpublishNpc(n.id), v ? 'Revealed to the table.' : 'Hidden.')} />
                      {!n.isPublished && <Badge tone="wounded" outline>held</Badge>}
                      {n.state === 'dirty' && <Badge tone="ember" outline>edited</Badge>}
                      <Button size="sm" variant="ghost" iconStart={<Edit s={14} />} onClick={() => setEditing({ id: n.id, card: n.draft, extras: { secret: n.secret ?? '', stats: n.stats ?? null, pos: n.pos ?? { x: 120, y: 120 } } })}>Edit</Button>
                    </div>
                  )}
                </NpcDossier>
              );
            })}
          </div>
        )}
      </div>

      {editing && <NpcEditor initial={{ card: editing.card, extras: editing.extras }} onSave={save} onClose={() => setEditing(null)} onDelete={editing.id ? () => { const id = editing.id!; setEditing(null); act(() => deleteNpc(id), 'Banished from the bestiary.'); } : undefined} />}
      {toast && <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}><Toast tone={toast.tone === 'dead' ? 'dead' : 'accent'} title="The bestiary" onDismiss={() => setToast(null)}>{toast.msg}</Toast></div>}
    </div>
  );
}
