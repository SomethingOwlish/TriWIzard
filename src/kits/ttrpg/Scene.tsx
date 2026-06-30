/* TriWizard — TTRPG live Scene (Tier 3: B3.1 setup, B3.2 live sync, B3.3 dice).
   The one live surface in the app. Everyone shares a single onSnapshot on
   sceneTable/main: a 2×2 *wall* of slots into which the GM raises scenes (one
   image+text each; several may stand at once, or one may fill the wall), the
   participants with scene-local condition trackers, and the turn order. The live
   roll board is derived from a small live query over the shared `rolls` stream —
   players only ever append their own roll, never the GM-owned table. Rolls are
   2d6 + stat (auto-pulled from the card, adjusted by scene-local conditions) on
   the custom Durmstrang ladder. The wall can go fullscreen. */
import React from 'react';
import { Button, Card, Badge, Avatar, Field, Input, Textarea, Select, Switch, Dialog, Toast } from '../../components';
import { Plus, Edit, Dice, Bolt } from '../icons';
import {
  STAT_KEYS, STATS, CONDITIONS, CONDITION_PENALTY, isCritical, HOUSE_BY_ID, isGmRole,
  type CardRole, type StatKey, type ConditionLevel, type HouseId, type KnownMove,
} from '../../lib/pbta';
import { rollPbta, rollInitiative, BANDS, signed, rollLabel } from '../../lib/pbtaDice';
import {
  watchSceneTable, watchScenes, updateTable, createScene, saveScene, deleteScene,
  recordRoll, watchRecentRolls, fetchRollLog, lastRollByKey, blankScene, SLOT_COUNT,
  type SceneTable, type AuthoredScene, type SceneInput, type SceneNpc, type SceneParticipant,
  type ActiveSlot, type SlotTarget, type LastRoll, type RollEntry,
} from '../../lib/scenes';
import { watchPublishedMoves, type MoveEntry } from '../../lib/moves';
import { watchAllCharacters, type CharacterRecord } from '../../lib/characters';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-3)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-1)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' };
const uid = () => Math.random().toString(36).slice(2, 9);
const initialsOf = (name: string) => (name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '—');
const toneVar = (b: typeof BANDS[keyof typeof BANDS]['tone']) => `var(--status-${b === 'ember' || b === 'accent' ? 'alive' : b})`;

const NO_COND: Record<StatKey, ConditionLevel> = { dex: 'none', end: 'none', will: 'none', mag: 'none', per: 'none', wit: 'none' };
const ZERO_STATS: Record<StatKey, number> = { dex: 0, end: 0, will: 0, mag: 0, per: 0, wit: 0 };
const SLOT_LABELS = ['Top-left', 'Top-right', 'Bottom-left', 'Bottom-right'];

function rollMod(p: SceneParticipant, stat: StatKey, situational: number): { mod: number; base: number; pen: number; crit: boolean } {
  const base = p.stats[stat] ?? 0;
  const crit = isCritical(p.conditions);
  const hit = (p.conditions[stat] ?? 'none') !== 'none';
  const pen = crit ? (hit ? -10 : -6) : CONDITION_PENALTY[p.conditions[stat] ?? 'none'];
  return { mod: base + pen + situational, base, pen, crit };
}

function participantFromChar(rec: CharacterRecord): SceneParticipant {
  const sheet = rec.published ?? rec.draft;
  return {
    key: rec.id, kind: 'pc', charId: rec.id, uid: rec.ownerUid,
    name: rec.name || 'Unnamed', house: rec.house,
    stats: { ...(sheet?.stats ?? ZERO_STATS) }, conditions: { ...(sheet?.conditions ?? NO_COND) },
    neutralized: false, moves: sheet?.moves ?? [],
  };
}

function allowedMoves(p: SceneParticipant | null, catalogue: MoveEntry[]): MoveEntry[] {
  if (!p) return [];
  if (p.kind === 'npc') return catalogue;
  const known: KnownMove[] = p.moves ?? [];
  const ids = new Set(known.map((k) => k.id).filter(Boolean));
  const names = new Set(known.map((k) => k.name.toLowerCase()));
  return catalogue.filter((m) => m.kind === 'basic' || (m.srcId && ids.has(m.srcId)) || names.has(m.name.toLowerCase()));
}

// ---------------------------------------------------------------------------
// The wall — a 2×2 of slots (or one scene filling it)
// ---------------------------------------------------------------------------

function SlotPanel({ slot, gm, label, onDeactivate, onEdit }: {
  slot: ActiveSlot | null; gm: boolean; label: string; onDeactivate?: () => void; onEdit?: () => void;
}) {
  const img = slot?.image.trim();
  const text = slot?.text.trim();
  return (
    <div style={{
      position: 'relative', height: '100%', minHeight: 120, overflow: 'hidden',
      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-well)',
      background: img ? `center / cover no-repeat url("${img}")` : 'var(--surface-inset)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {!slot && gm && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 10, color: 'var(--text-3)' }}>{label} · empty</div>}
      {slot && (
        <>
          <div style={{ position: 'absolute', top: 10, left: 12, ...mono, fontSize: 9, color: img ? 'var(--text-1)' : 'var(--accent-text)', textShadow: img ? '0 1px 4px rgba(0,0,0,.7)' : 'none' }}>{slot.name}</div>
          {(text || !img) && (
            <div style={{
              position: 'relative', padding: 16, ...serif, whiteSpace: 'pre-wrap', lineHeight: 1.6,
              color: 'var(--text-1)', background: img ? 'linear-gradient(transparent, color-mix(in srgb, var(--surface-page) 92%, transparent))' : 'transparent',
            }}>{text || <span style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>An image-less slot.</span>}</div>
          )}
          {gm && (onDeactivate || onEdit) && (
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
              {onEdit && <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>}
              {onDeactivate && <Button size="sm" variant="danger" onClick={onDeactivate}>Lower</Button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Wall({ t, gm, height, onDeactivate, onEditSlot }: {
  t: SceneTable; gm: boolean; height: number | string;
  onDeactivate: (target: SlotTarget) => void; onEditSlot: (sceneId: string) => void;
}) {
  if (t.full) {
    return (
      <div style={{ height }}>
        <SlotPanel slot={t.full} gm={gm} label="Full wall" onDeactivate={() => onDeactivate('full')} onEdit={() => onEditSlot(t.full!.sceneId)} />
      </div>
    );
  }
  const anyActive = t.slots.some(Boolean);
  if (!anyActive && !gm) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', ...serif, fontStyle: 'italic', color: 'var(--text-3)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)' }}>The wall is bare. The master has raised no scene.</div>;
  }
  return (
    <div style={{ height, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10 }}>
      {Array.from({ length: SLOT_COUNT }, (_, i) => (
        <SlotPanel key={i} slot={t.slots[i] ?? null} gm={gm} label={SLOT_LABELS[i]}
          onDeactivate={() => onDeactivate(i as SlotTarget)} onEdit={t.slots[i] ? () => onEditSlot(t.slots[i]!.sceneId) : undefined} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result chip + condition pips + participant card
// ---------------------------------------------------------------------------

function ResultChip({ roll, compact }: { roll: LastRoll; compact?: boolean }) {
  const def = BANDS[roll.band];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ ...display, fontSize: compact ? 22 : 30, color: toneVar(def.tone), lineHeight: 1 }}>{roll.total}</span>
      <div style={{ minWidth: 0 }}>
        <Badge tone={def.tone} dot>{def.label}</Badge>
        <div style={{ ...mono, fontSize: 9, marginTop: 3 }}>{roll.dice[0]}+{roll.dice[1]} {signed(roll.mod)}{roll.moveName ? ` · ${roll.moveName}` : roll.stat ? ` · ${STATS[roll.stat].en}` : ''}</div>
      </div>
    </div>
  );
}

function ConditionPips({ p, editable, onChange }: {
  p: SceneParticipant; editable: boolean; onChange: (next: Record<StatKey, ConditionLevel>) => void;
}) {
  const cycle: ConditionLevel[] = ['none', 'normal', 'serious'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {STAT_KEYS.map((k) => {
        const lvl = p.conditions[k] ?? 'none';
        const tone = lvl === 'serious' ? 'var(--status-dead)' : lvl === 'normal' ? 'var(--status-wounded)' : 'var(--border-2)';
        const body = (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 'var(--radius-pill)',
            border: `1px solid ${lvl === 'none' ? 'var(--border-1)' : tone}`,
            background: lvl === 'none' ? 'transparent' : 'color-mix(in srgb, ' + tone + ' 18%, transparent)',
            fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: lvl === 'none' ? 'var(--text-3)' : 'var(--text-1)',
          }} title={`${CONDITIONS[k].en} (${CONDITIONS[k].ru})`}>
            {STATS[k].en.slice(0, 3)}{lvl === 'normal' ? ' −1' : lvl === 'serious' ? ' −6' : ''}
          </span>
        );
        if (!editable) return <span key={k}>{body}</span>;
        return <button key={k} type="button" onClick={() => { const i = cycle.indexOf(lvl); onChange({ ...p.conditions, [k]: cycle[(i + 1) % 3] }); }} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>{body}</button>;
      })}
    </div>
  );
}

function ParticipantCard({ p, roll, gm, acting, onConditions, onNeutralize, onRemove }: {
  p: SceneParticipant; roll?: LastRoll; gm: boolean; acting: boolean;
  onConditions: (c: Record<StatKey, ConditionLevel>) => void; onNeutralize: (v: boolean) => void; onRemove: () => void;
}) {
  const house = p.house ? HOUSE_BY_ID[p.house as HouseId] : null;
  const crit = isCritical(p.conditions);
  return (
    <Card padding="14px" accentEdge={acting} style={p.neutralized ? { opacity: 0.6 } : undefined}>
      {/* Header — the name owns the full width so long names never collide. */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Avatar initials={initialsOf(p.name)} size="md" square status={p.neutralized ? 'dead' : crit ? 'wounded' : 'alive'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...display, fontSize: 16, lineHeight: 1.2, wordBreak: 'break-word' }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            <span style={{ ...mono, fontSize: 9 }}>{house ? `${house.rune} ${house.en}` : p.kind === 'npc' ? 'token' : 'no house'}</span>
            {p.kind === 'npc' && <Badge tone="ember" outline>NPC</Badge>}
            {acting && <Badge tone="accent" dot>acting</Badge>}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {STAT_KEYS.map((k) => (
          <span key={k} style={{ ...mono, fontSize: 9, padding: '2px 6px', borderRadius: 'var(--radius-xs)', background: 'var(--surface-inset)', color: 'var(--text-2)' }}>{STATS[k].en.slice(0, 3)} {signed(p.stats[k] ?? 0)}</span>
        ))}
      </div>
      <div style={{ marginTop: 8 }}><ConditionPips p={p} editable={gm} onChange={onConditions} /></div>
      {roll && <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-1)' }}><ResultChip roll={roll} compact /></div>}
      {/* Footer — GM controls, kept clear of the name. */}
      {gm && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => onNeutralize(!p.neutralized)}>{p.neutralized ? 'Revive' : 'Neutralize'}</Button>
          <span style={{ flex: 1 }} />
          <button type="button" aria-label="Remove from scene" title="Remove from scene" onClick={onRemove}
            style={{ width: 26, height: 26, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-2)', background: 'var(--surface-raised)', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Roll panel
// ---------------------------------------------------------------------------

function RollPanel({ mine, moves, sceneName, onRolled }: {
  mine: SceneParticipant[]; moves: MoveEntry[]; sceneName: string; onRolled: (msg: string, tone: 'accent' | 'dead') => void;
}) {
  const [pk, setPk] = React.useState(mine[0]?.key ?? '');
  const [moveId, setMoveId] = React.useState('');
  const [stat, setStat] = React.useState<StatKey>('mag');
  const [situational, setSituational] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => { if (!mine.some((m) => m.key === pk)) setPk(mine[0]?.key ?? ''); }, [mine, pk]);
  const p = mine.find((m) => m.key === pk) ?? null;
  const ownMoves = React.useMemo(() => allowedMoves(p, moves), [p, moves]);
  React.useEffect(() => { if (moveId && !ownMoves.some((m) => m.id === moveId)) setMoveId(''); }, [ownMoves, moveId]);
  const move = ownMoves.find((m) => m.id === moveId) ?? null;
  const effStat: StatKey = move?.stat ?? stat;
  const calc = p ? rollMod(p, effStat, situational) : null;

  async function go() {
    if (!p || !calc) return;
    setBusy(true);
    try {
      const r = rollPbta(calc.mod);
      const entry: LastRoll = {
        key: p.key, name: p.name, label: rollLabel(effStat, calc.mod, STATS[effStat].en),
        moveName: move?.name, stat: effStat, dice: r.dice, mod: r.mod, total: r.total, band: r.band, snake: r.snake, at: Date.now(),
      };
      await recordRoll(entry, p.uid ?? null, sceneName);
      onRolled(`${p.name}: ${BANDS[r.band].label} (${r.total}).`, 'accent');
    } catch (e) { onRolled(e instanceof Error ? e.message : 'The bones would not fall.', 'dead'); }
    finally { setBusy(false); }
  }

  if (mine.length === 0) {
    return <Card title="Cast the bones" eyebrow="2d6 + stat" padding="18px"><div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>You hold no character in this scene. The master must seat you first.</div></Card>;
  }
  return (
    <Card title="Cast the bones" eyebrow="2d6 + stat · the Durmstrang ladder" padding="18px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mine.length > 1 && (
          <Field label="Acting as"><Select value={pk} onChange={(e) => setPk(e.target.value)}>{mine.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}</Select></Field>
        )}
        <Field label="Move" hint={ownMoves.length ? 'Optional — sets the stat & shows the outcome' : 'No moves known yet'}>
          <Select value={moveId} onChange={(e) => setMoveId(e.target.value)}>
            <option value="">— free roll —</option>
            {ownMoves.map((m) => <option key={m.id} value={m.id}>{m.name}{m.stat ? ` · ${STATS[m.stat].en}` : ''}</option>)}
          </Select>
        </Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Stat" style={{ flex: 1 }}>
            <Select value={effStat} disabled={!!move?.stat} onChange={(e) => setStat(e.target.value as StatKey)}>{STAT_KEYS.map((k) => <option key={k} value={k}>{STATS[k].en} ({STATS[k].ru})</option>)}</Select>
          </Field>
          <Field label="Situational" style={{ width: 110 }}><Input type="number" value={String(situational)} onChange={(e) => setSituational(Number(e.target.value) || 0)} /></Field>
        </div>
        {calc && (
          <div style={{ ...mono, fontSize: 10, color: 'var(--text-2)' }}>
            2d6 · base {signed(calc.base)}{calc.pen !== 0 && <span style={{ color: 'var(--status-wounded)' }}> · {calc.crit ? 'critical' : 'condition'} {signed(calc.pen)}</span>}{situational !== 0 && ` · situational ${signed(situational)}`}{' = '}<span style={{ color: 'var(--accent-text)' }}>roll {signed(calc.mod)}</span>
          </div>
        )}
        <Button iconStart={<Dice s={16} />} onClick={go} loading={busy} disabled={!p}>Throw the bones</Button>
        {move && (
          <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-1)' }}>
            <div style={{ ...mono, fontSize: 9, marginBottom: 4 }}>{move.name}{move.trigger ? ' · trigger' : ''}</div>
            {move.trigger && <div style={{ ...serif, fontSize: 13, fontStyle: 'italic', color: 'var(--text-3)' }}>{move.trigger}</div>}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// GM dialogs — scene editor, raise, log
// ---------------------------------------------------------------------------

function NpcEditor({ npcs, onChange }: { npcs: SceneNpc[]; onChange: (n: SceneNpc[]) => void }) {
  const [name, setName] = React.useState('');
  const add = () => { const t = name.trim(); if (!t) return; onChange([...npcs, { id: uid(), name: t, note: '', shown: true }]); setName(''); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {npcs.map((n) => (
        <div key={n.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Input size="sm" value={n.name} onChange={(e) => onChange(npcs.map((x) => x.id === n.id ? { ...x, name: e.target.value } : x))} style={{ flex: 1 }} />
          <Input size="sm" value={n.note} placeholder="note…" onChange={(e) => onChange(npcs.map((x) => x.id === n.id ? { ...x, note: e.target.value } : x))} style={{ flex: 1 }} />
          <Switch size="sm" checked={n.shown} onChange={(v) => onChange(npcs.map((x) => x.id === n.id ? { ...x, shown: v } : x))} label="shown" />
          <button type="button" aria-label="Remove" onClick={() => onChange(npcs.filter((x) => x.id !== n.id))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input size="sm" value={name} placeholder="Add an NPC token…" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button size="sm" variant="secondary" iconStart={<Plus s={14} />} onClick={add}>NPC</Button>
      </div>
    </div>
  );
}

function SceneEditor({ initial, onSave, onClose, onDelete }: {
  initial: SceneInput; onSave: (input: SceneInput) => void; onClose: () => void; onDelete?: () => void;
}) {
  const [s, setS] = React.useState<SceneInput>(initial);
  const set = (patch: Partial<SceneInput>) => setS((cur) => ({ ...cur, ...patch }));
  return (
    <Dialog open width={600} onClose={onClose} eyebrow="Master · stage a scene" title={s.name || 'A new scene'}
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          {onDelete && <Button variant="danger" size="sm" onClick={onDelete}>Strike scene</Button>}
          <span style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!s.name.trim()} onClick={() => onSave(s)}>Save scene</Button>
        </div>
      }>
      <div style={{ display: 'grid', gap: 14, padding: '4px 0' }}>
        <Field label="Name"><Input value={s.name} onChange={(e) => set({ name: e.target.value })} placeholder="The drowned hall…" /></Field>
        <Field label="Image URL" hint="Shown as the slot's background; leave blank for text only"><Input value={s.image} onChange={(e) => set({ image: e.target.value })} placeholder="https://…" /></Field>
        <Field label="Text" hint="Shown to the table — over the image, or alone"><Textarea rows={4} value={s.text} onChange={(e) => set({ text: e.target.value })} /></Field>
        <Field label="Master's notes" hint="Behind the screen — not shown to players"><Textarea rows={3} value={s.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
        <div><div style={{ ...mono, marginBottom: 8 }}>NPC tokens</div><NpcEditor npcs={s.npcs} onChange={(n) => set({ npcs: n })} /></div>
      </div>
    </Dialog>
  );
}

function RaiseDialog({ scene, slots, onRaise, onClose }: {
  scene: AuthoredScene; slots: (ActiveSlot | null)[]; onRaise: (target: SlotTarget) => void; onClose: () => void;
}) {
  const [target, setTarget] = React.useState<SlotTarget>('full');
  return (
    <Dialog open width={420} onClose={onClose} eyebrow="Raise to the wall" title={scene.name || 'Untitled scene'}
      footer={<div style={{ display: 'flex', gap: 8, width: '100%' }}><span style={{ flex: 1 }} /><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={() => onRaise(target)}>Raise</Button></div>}>
      <div style={{ display: 'grid', gap: 8, padding: '4px 0' }}>
        <div style={{ ...mono, marginBottom: 2 }}>Choose a slot</div>
        <button type="button" onClick={() => setTarget('full')} style={slotBtn(target === 'full')}>Full wall</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SLOT_LABELS.map((l, i) => (
            <button key={i} type="button" onClick={() => setTarget(i as SlotTarget)} style={slotBtn(target === i)}>
              {l}{slots[i] ? ' · occupied' : ''}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
function slotBtn(active: boolean): React.CSSProperties {
  return { textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-1)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border-2)'}`, background: active ? 'var(--accent-soft)' : 'var(--surface-inset)' };
}

function LogDialog({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = React.useState<RollEntry[] | null>(null);
  React.useEffect(() => { fetchRollLog(80).then(setRows).catch(() => setRows([])); }, []);
  return (
    <Dialog open width={560} onClose={onClose} eyebrow="The shared stream" title="Roll log" footer={<Button variant="ghost" size="sm" onClick={onClose}>Close</Button>}>
      {rows === null ? <div style={{ ...mono, padding: 8 }}>Consulting the stream…</div>
        : rows.length === 0 ? <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)', padding: 8 }}>No bones have been cast yet.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rows.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 2px', borderBottom: '1px solid var(--border-1)' }}>
                <span style={{ ...display, fontSize: 18, color: toneVar(BANDS[r.band].tone), width: 34, textAlign: 'right' }}>{r.total}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...serif, fontSize: 14 }}>{r.name} <span style={{ ...mono, fontSize: 9 }}>{BANDS[r.band].label}</span></div>
                  <div style={{ ...mono, fontSize: 9 }}>{r.label}{r.moveName ? ` · ${r.moveName}` : ''}{r.sceneName ? ` · ${r.sceneName}` : ''}</div>
                </div>
                <span style={{ ...mono, fontSize: 9 }}>{r.dice[0]}+{r.dice[1]}</span>
              </div>
            ))}
          </div>
        )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// The module
// ---------------------------------------------------------------------------

export function SceneModule({ role, userUid }: { role: CardRole; userUid: string | null }) {
  const gm = isGmRole(role);
  const [tState, setT] = React.useState<SceneTable | null>(null);
  const [moves, setMoves] = React.useState<MoveEntry[]>([]);
  const [recent, setRecent] = React.useState<RollEntry[]>([]);
  const [library, setLibrary] = React.useState<AuthoredScene[]>([]);
  const [chars, setChars] = React.useState<CharacterRecord[]>([]);
  const [editing, setEditing] = React.useState<{ id: string | null; input: SceneInput } | null>(null);
  const [raising, setRaising] = React.useState<AuthoredScene | null>(null);
  const [logOpen, setLogOpen] = React.useState(false);
  const [full, setFull] = React.useState(false);
  const [panel, setPanel] = React.useState<'roll' | 'party' | 'lib' | null>(null);
  const [pinned, setPinned] = React.useState(false);
  const [toast, setToast] = React.useState<{ tone: 'accent' | 'alive' | 'dead'; msg: string } | null>(null);

  React.useEffect(() => watchSceneTable(setT), []);
  React.useEffect(() => watchPublishedMoves(setMoves), []);
  React.useEffect(() => watchRecentRolls(setRecent), []);
  React.useEffect(() => { if (!gm) return; const a = watchScenes(setLibrary); const b = watchAllCharacters(setChars); return () => { a(); b(); }; }, [gm]);

  const lastRolls = React.useMemo(() => lastRollByKey(recent), [recent]);

  if (!tState) return <div style={{ padding: 40, ...mono }}>Drawing back the curtain…</div>;
  const t = tState; // narrowed, non-null for the closures below

  const participants = t.participants;
  const mine = gm ? participants : participants.filter((p) => p.kind === 'pc' && p.uid === userUid);
  const visibleNpcs = t.npcs.filter((n) => gm || n.shown);
  const actingKey = t.turn ? t.turn.order[t.turn.actingIndex] : null;
  const activeNames = [t.full, ...t.slots].filter(Boolean).map((s) => (s as ActiveSlot).name).join(' · ');
  const seatable = chars.filter((c) => !participants.some((p) => p.key === c.id));

  const setParticipants = (next: SceneParticipant[]) => updateTable({ participants: next }).catch(() => {});
  const patchParticipant = (key: string, patch: Partial<SceneParticipant>) => setParticipants(participants.map((p) => p.key === key ? { ...p, ...patch } : p));
  const addPc = (rec: CharacterRecord) => { if (participants.some((p) => p.key === rec.id)) return; setParticipants([...participants, participantFromChar(rec)]); };
  const addNpc = () => setParticipants([...participants, { key: uid(), kind: 'npc', name: 'New foe', house: '', stats: { ...ZERO_STATS }, conditions: { ...NO_COND }, neutralized: false, moves: [] }]);

  function raise(scene: AuthoredScene, target: SlotTarget) {
    const slot: ActiveSlot = { sceneId: scene.id, name: scene.name, image: scene.image, text: scene.text };
    const npcs = [...t.npcs.filter((n) => n.src !== scene.id), ...scene.npcs.map((n) => ({ ...n, src: scene.id }))];
    if (target === 'full') updateTable({ full: slot, slots: [null, null, null, null], npcs }).catch(() => {});
    else { const slots = [...t.slots]; slots[target] = slot; updateTable({ full: null, slots, npcs }).catch(() => {}); }
    setRaising(null); setToast({ tone: 'accent', msg: 'The scene rises to the wall.' });
  }
  function deactivate(target: SlotTarget) {
    if (target === 'full') { const id = t.full?.sceneId; updateTable({ full: null, npcs: t.npcs.filter((n) => n.src !== id) }).catch(() => {}); }
    else { const s = t.slots[target as number]; const slots = [...t.slots]; slots[target as number] = null; updateTable({ slots, npcs: t.npcs.filter((n) => n.src !== s?.sceneId) }).catch(() => {}); }
  }
  function rollInitiativeAll() {
    if (participants.length === 0) return;
    const scored = participants.map((p) => ({ key: p.key, total: rollInitiative().total })).sort((a, b) => b.total - a.total);
    updateTable({ turn: { order: scored.map((s) => s.key), actingIndex: 0, round: 1 } }).catch(() => {});
    setToast({ tone: 'accent', msg: 'Initiative is cast. The cycle begins.' });
  }
  function advanceTurn() {
    if (!t.turn) return;
    const last = t.turn.actingIndex >= t.turn.order.length - 1;
    updateTable({ turn: { order: t.turn.order, actingIndex: last ? 0 : t.turn.actingIndex + 1, round: t.turn.round + (last ? 1 : 0) } }).catch(() => {});
  }
  async function persistScene(input: SceneInput) {
    try { if (editing?.id) await saveScene(editing.id, input); else await createScene(input); setEditing(null); setToast({ tone: 'accent', msg: 'The scene is staged.' }); }
    catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'The scene would not hold.' }); }
  }

  const wall = (
    <Wall t={t} gm={gm} height={full ? '100%' : 'min(64vh, 560px)'} onDeactivate={deactivate}
      onEditSlot={(id) => { const s = library.find((x) => x.id === id); if (s) setEditing({ id: s.id, input: { name: s.name, image: s.image, text: s.text, notes: s.notes, npcs: s.npcs } }); }} />
  );

  // Fullscreen — an immersive wall with edge navigation. The right border holds
  // panel labels that unfurl on hover (or pin on click) and resize the wall; the
  // bottom border holds the live roll board. Everything restores on close/leave.
  if (full) {
    const tabs: { key: 'roll' | 'party' | 'lib'; label: string }[] = [
      { key: 'roll', label: 'Cast' }, { key: 'party', label: 'Party' },
      ...(gm ? [{ key: 'lib' as const, label: 'Scenes' }] : []),
    ];
    const openPanel = (k: 'roll' | 'party' | 'lib') => { if (pinned && panel === k) { setPanel(null); setPinned(false); } else { setPanel(k); setPinned(true); } };
    const railBtn = (active: boolean): React.CSSProperties => ({
      writingMode: 'vertical-rl', textOrientation: 'mixed', padding: '12px 6px', cursor: 'pointer',
      fontFamily: 'var(--font-ui)', fontSize: 13, letterSpacing: '0.06em', border: 'none',
      borderLeft: '2px solid', borderColor: active ? 'var(--accent)' : 'transparent',
      background: active ? 'var(--surface-raised)' : 'transparent', color: active ? 'var(--text-1)' : 'var(--text-3)',
    });
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--surface-page)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-1)' }}>
          <div style={{ ...display, fontSize: 20 }}>{activeNames || 'The wall'}</div>
          <span style={{ flex: 1 }} />
          <Button size="sm" variant="secondary" onClick={() => setLogOpen(true)}>Log</Button>
          <Button size="sm" onClick={() => { setFull(false); setPanel(null); setPinned(false); }}>Exit fullscreen ⤡</Button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <div style={{ flex: 1, minWidth: 0, padding: 16 }}>{wall}</div>

          {/* Right border — the panel + its label rail. */}
          <div style={{ display: 'flex', minHeight: 0 }} onMouseLeave={() => { if (!pinned) setPanel(null); }}>
            {panel && (
              <div style={{ width: 360, height: '100%', overflow: 'auto', background: 'var(--surface-sunken)', borderLeft: '1px solid var(--border-1)', padding: 14 }}>
                {panel === 'roll' && <RollPanel mine={mine} moves={moves} sceneName={activeNames} onRolled={(msg, tone) => setToast({ tone: tone === 'dead' ? 'dead' : 'accent', msg })} />}
                {panel === 'party' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {gm && <Button size="sm" variant="ghost" iconStart={<Bolt s={14} />} onClick={rollInitiativeAll}>Roll initiative</Button>}
                    {participants.length === 0 ? <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>No one is in the scene.</div>
                      : participants.map((p) => (
                        <ParticipantCard key={p.key} p={p} roll={lastRolls[p.key]} gm={gm} acting={p.key === actingKey}
                          onConditions={(c) => patchParticipant(p.key, { conditions: c })} onNeutralize={(v) => patchParticipant(p.key, { neutralized: v })}
                          onRemove={() => setParticipants(participants.filter((x) => x.key !== p.key))} />
                      ))}
                  </div>
                )}
                {panel === 'lib' && gm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button size="sm" variant="ghost" iconStart={<Plus s={14} />} onClick={() => setEditing({ id: null, input: blankScene() })}>New scene</Button>
                    {library.map((s) => {
                      const onWall = t.full?.sceneId === s.id || t.slots.some((sl) => sl?.sceneId === s.id);
                      return (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: `1px solid ${onWall ? 'var(--accent)' : 'var(--border-1)'}`, background: onWall ? 'var(--accent-soft)' : 'var(--surface-inset)' }}>
                          <span style={{ flex: 1, ...serif, fontSize: 14 }}>{s.name || 'Untitled'}</span>
                          <Button size="sm" onClick={() => setRaising(s)}>Raise</Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-sunken)', borderLeft: '1px solid var(--border-1)' }}>
              {tabs.map((tb) => (
                <button key={tb.key} type="button" onMouseEnter={() => { if (!pinned) setPanel(tb.key); }} onClick={() => openPanel(tb.key)} style={railBtn(panel === tb.key)}>{tb.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom border — the live roll board. */}
        {participants.some((p) => lastRolls[p.key]) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--border-1)', background: 'var(--surface-sunken)' }}>
            {participants.map((p) => lastRolls[p.key] && <div key={p.key} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-card)', border: '1px solid var(--border-1)' }}><span style={{ ...mono, fontSize: 9, marginRight: 8 }}>{p.name}</span><ResultChip roll={lastRolls[p.key]} compact /></div>)}
          </div>
        )}

        {editing && <SceneEditor initial={editing.input} onSave={persistScene} onClose={() => setEditing(null)} />}
        {raising && <RaiseDialog scene={raising} slots={t.slots} onRaise={(target) => raise(raising, target)} onClose={() => setRaising(null)} />}
        {logOpen && <LogDialog onClose={() => setLogOpen(false)} />}
        {toast && <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}><Toast tone={toast.tone} title="The scene" onDismiss={() => setToast(null)}>{toast.msg}</Toast></div>}
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={mono}>The living scene · live</div>
          <h1 style={{ margin: '4px 0 0', ...display, fontSize: 34 }}>{activeNames || 'The wall is bare'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => setLogOpen(true)}>Open the log</Button>
          <Button variant="secondary" size="sm" onClick={() => setFull(true)}>Fullscreen ⤢</Button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>{wall}</div>

      {gm && t.npcs.length === 0 && visibleNpcs.length === 0 ? null : visibleNpcs.length > 0 && (
        <Card title="On the wall" eyebrow="NPCs" padding="14px" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {visibleNpcs.map((n) => (
              <span key={n.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...serif, fontSize: 14 }}>{n.name}{!n.shown && gm && <Badge tone="wounded" outline>hidden</Badge>}{n.note && <span style={{ ...mono, fontSize: 9 }}>{n.note}</span>}</span>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {t.turn && (
            <Card title="The cycle" eyebrow={`Round ${t.turn.round} · initiative`} padding="14px" actions={gm ? <Button size="sm" variant="secondary" onClick={advanceTurn}>Next turn →</Button> : null}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {t.turn.order.map((k, i) => { const p = participants.find((x) => x.key === k); if (!p) return null; return <Badge key={k} tone={i === t.turn!.actingIndex ? 'accent' : 'neutral'} dot={i === t.turn!.actingIndex}>{p.name}</Badge>; })}
              </div>
            </Card>
          )}
          <Card title="At the scene" eyebrow={`${participants.length} present`} padding="14px"
            actions={gm ? <div style={{ display: 'flex', gap: 6 }}><Button size="sm" variant="ghost" iconStart={<Bolt s={14} />} onClick={rollInitiativeAll}>Initiative</Button><Button size="sm" variant="ghost" iconStart={<Plus s={14} />} onClick={addNpc}>NPC</Button></div> : null}>
            {participants.length === 0 ? <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>No one stands in the scene yet.</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {participants.map((p) => (
                  <ParticipantCard key={p.key} p={p} roll={lastRolls[p.key]} gm={gm} acting={p.key === actingKey}
                    onConditions={(c) => patchParticipant(p.key, { conditions: c })} onNeutralize={(v) => patchParticipant(p.key, { neutralized: v })}
                    onRemove={() => setParticipants(participants.filter((x) => x.key !== p.key))} />
                ))}
              </div>
            )}
            {gm && seatable.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-1)' }}>
                <div style={{ ...mono, fontSize: 9, marginBottom: 8 }}>Seat a character</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {seatable.map((c) => <Button key={c.id} size="sm" variant="secondary" iconStart={<Plus s={13} />} onClick={() => addPc(c)}>{c.name || 'Unnamed'}</Button>)}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <RollPanel mine={mine} moves={moves} sceneName={activeNames} onRolled={(msg, tone) => setToast({ tone: tone === 'dead' ? 'dead' : 'accent', msg })} />
          {gm && (
            <Card title="Scene library" eyebrow="Stage · raise · lower" padding="14px"
              actions={<Button size="sm" variant="ghost" iconStart={<Plus s={14} />} onClick={() => setEditing({ id: null, input: blankScene() })}>New</Button>}>
              {library.length === 0 ? <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>No scenes staged yet.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {library.map((s) => {
                    const onWall = t.full?.sceneId === s.id || t.slots.some((sl) => sl?.sceneId === s.id);
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: `1px solid ${onWall ? 'var(--accent)' : 'var(--border-1)'}`, background: onWall ? 'var(--accent-soft)' : 'var(--surface-inset)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ ...serif, fontSize: 14 }}>{s.name || 'Untitled'}</div>
                          <div style={{ ...mono, fontSize: 9 }}>{s.image ? 'image' : 'text'}{s.npcs.length ? ` · ${s.npcs.length} NPC` : ''}{onWall ? ' · on the wall' : ''}</div>
                        </div>
                        <Button size="sm" variant="ghost" iconStart={<Edit s={13} />} onClick={() => setEditing({ id: s.id, input: { name: s.name, image: s.image, text: s.text, notes: s.notes, npcs: s.npcs } })}>Edit</Button>
                        <Button size="sm" onClick={() => setRaising(s)}>Raise</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {editing && (
        <SceneEditor initial={editing.input} onSave={persistScene} onClose={() => setEditing(null)}
          onDelete={editing.id ? async () => {
            const id = editing.id!;
            try {
              await deleteScene(id);
              if (t.full?.sceneId === id) deactivate('full');
              else { const i = t.slots.findIndex((sl) => sl?.sceneId === id); if (i >= 0) deactivate(i as SlotTarget); }
              setEditing(null);
            } catch { /* noop */ }
          } : undefined} />
      )}
      {raising && <RaiseDialog scene={raising} slots={t.slots} onRaise={(target) => raise(raising, target)} onClose={() => setRaising(null)} />}
      {logOpen && <LogDialog onClose={() => setLogOpen(false)} />}
      {toast && <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}><Toast tone={toast.tone} title="The scene" onDismiss={() => setToast(null)}>{toast.msg}</Toast></div>}
    </div>
  );
}
