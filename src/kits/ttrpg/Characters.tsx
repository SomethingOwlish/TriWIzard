/* TriWizard — TTRPG character cards (Tier 2: B2.2 player view/edit/save,
   B2.3 advancement/assessment, B2.4 master roster). Built entirely on the
   design-system primitives and the PBtA schema in src/lib/pbta.ts; the sheet is
   descriptor-driven so the player and the master share one renderer and the
   per-field edit authority (canEditField) decides who may touch what. */
import React from 'react';
import { Button, Card, Badge, Avatar, Field, Input, Textarea, Select, Switch, Toast } from '../../components';
import { Plus, Edit } from '../icons';
import {
  STAT_KEYS, STATS, CONDITIONS, CONDITION_PENALTY, isCritical, HOUSE_BY_ID, HOUSES,
  FIELD_META, canEditField, isGmRole, statRaiseCost, MOVE_COST, BASIC_MOVES, GENERAL_MOVES,
  type Character, type StatKey, type ConditionLevel, type KnownMove, type Bond,
  type CardRole, type FieldMeta, type HouseId,
} from '../../lib/pbta';
import {
  createCharacter, saveCharacterDraft, publishCharacter, revertCharacter, deleteCharacter,
  watchMyCharacters, watchAllCharacters, watchCharacter, type CharacterRecord,
} from '../../lib/characters';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-3)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-1)' };
const uid = () => Math.random().toString(36).slice(2, 9);
const initialsOf = (name: string) => (name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '—');

// ---------------------------------------------------------------------------
// Small editors
// ---------------------------------------------------------------------------

/** Editable chip-list for string[] fields (lists, tags, oaths, charms, …). */
function ListEditor({ value, onChange, placeholder = 'Add…', disabled }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string; disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState('');
  const add = () => { const t = draft.trim(); if (!t) return; onChange([...value, t]); setDraft(''); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {value.length === 0 && <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-3)', fontSize: 14 }}>Nothing recorded.</span>}
        {value.map((v, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 6px 3px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-raised)', border: '1px solid var(--border-2)', fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-1)' }}>
            {v}
            {!disabled && (
              <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 2 }}>
                <svg width="11" height="11" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Input size="sm" value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
          <Button size="sm" variant="secondary" iconStart={<Plus s={14} />} onClick={add}>Add</Button>
        </div>
      )}
    </div>
  );
}

/** One descriptor-driven scalar control (text/textarea/number/select/list). */
function FieldControl({ meta, value, disabled, onChange }: {
  meta: FieldMeta; value: unknown; disabled: boolean; onChange: (v: unknown) => void;
}) {
  if (disabled) {
    const text = Array.isArray(value) ? (value as string[]).join(' · ') : value === null || value === '' ? '—' : String(value);
    const display = meta.type === 'select' ? (meta.options?.find((o) => o.value === value)?.label ?? text) : text;
    return <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)', whiteSpace: 'pre-wrap', minHeight: 20 }}>{display}</div>;
  }
  switch (meta.type) {
    case 'textarea':
      return <Textarea value={(value as string) ?? ''} rows={3} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <Input type="number" value={value === null || value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />;
    case 'select':
      return (
        <Select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">— choose —</option>
          {meta.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      );
    case 'list':
    case 'tags':
      return <ListEditor value={(value as string[]) ?? []} onChange={(v) => onChange(v)} />;
    default:
      return <Input value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

// ---------------------------------------------------------------------------
// Sheet sections
// ---------------------------------------------------------------------------

interface SheetCtx { advancementOpen: boolean; isNew: boolean; }

function StatsSection({ ch, role, ctx, onChange }: {
  ch: Character; role: CardRole; ctx: SheetCtx; onChange: (next: Character) => void;
}) {
  const gm = isGmRole(role);
  const editable = canEditField({ editableBy: 'player', advancementLocked: true }, role, ctx);
  const assessment = !gm && ctx.advancementOpen; // player spends XP per step

  function step(k: StatKey, dir: 1 | -1) {
    const from = ch.stats[k];
    const next = { ...ch, stats: { ...ch.stats } };
    if (assessment) {
      if (dir === 1) {
        const cost = statRaiseCost(from);
        if (ch.xp < cost) return;
        next.xp = ch.xp - cost;
        next.stats[k] = from + 1;
      } else {
        const refund = statRaiseCost(from - 1);
        next.xp = ch.xp + refund;
        next.stats[k] = from - 1;
      }
    } else {
      next.stats[k] = from + dir; // GM / creation: free adjustment
    }
    onChange(next);
  }

  return (
    <Card title="Parameters" eyebrow="The bones of the character" padding="20px">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {STAT_KEYS.map((k) => {
          const base = ch.stats[k];
          const pen = CONDITION_PENALTY[ch.conditions[k] ?? 'none'];
          const eff = base + pen;
          return (
            <div key={k} style={{ background: 'var(--surface-inset)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-sm)', padding: '12px 12px 10px', textAlign: 'center', boxShadow: 'var(--shadow-well)' }}>
              <div style={{ ...mono, fontSize: 10 }} title={STATS[k].ru}>{STATS[k].en}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '4px 0' }}>
                {editable && <button type="button" onClick={() => step(k, -1)} style={stepBtn}>−</button>}
                <span style={{ ...display, fontSize: 26, lineHeight: 1, color: pen ? 'var(--status-wounded)' : 'var(--text-1)' }}>{eff >= 0 ? `+${eff}` : eff}</span>
                {editable && <button type="button" onClick={() => step(k, 1)} disabled={assessment && ch.xp < statRaiseCost(base)} style={stepBtn}>+</button>}
              </div>
              {pen !== 0 && <div style={{ ...mono, fontSize: 9, color: 'var(--status-wounded)' }}>base {base >= 0 ? `+${base}` : base}</div>}
              {assessment && editable && <div style={{ ...mono, fontSize: 9, color: 'var(--accent-text)' }}>raise · {statRaiseCost(base)}xp</div>}
            </div>
          );
        })}
      </div>
      {assessment && <div style={{ ...mono, fontSize: 10, marginTop: 12, color: 'var(--text-3)' }}>Assessment open · {ch.xp} XP remaining</div>}
    </Card>
  );
}
const stepBtn: React.CSSProperties = { width: 24, height: 24, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--surface-raised)', color: 'var(--text-1)', cursor: 'pointer', fontSize: 16, lineHeight: 1, fontFamily: 'var(--font-mono)' };

function ConditionsSection({ ch, role, ctx, onChange }: {
  ch: Character; role: CardRole; ctx: SheetCtx; onChange: (next: Character) => void;
}) {
  // Conditions are play-state — the bearer and the master both keep them.
  const editable = canEditField({ editableBy: 'player' }, role, ctx);
  const critical = isCritical(ch.conditions);
  const cycle: ConditionLevel[] = ['none', 'normal', 'serious'];
  return (
    <Card title="Conditions" eyebrow="Состояния · the harm track" padding="20px"
      actions={critical ? <Badge tone="dead" dot>Critical state</Badge> : ch.neutralized ? <Badge tone="dead">Neutralized</Badge> : <Badge tone="alive" dot>Standing</Badge>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STAT_KEYS.map((k) => {
          const lvl = ch.conditions[k] ?? 'none';
          const tone = lvl === 'serious' ? 'dead' : lvl === 'normal' ? 'wounded' : 'neutral';
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-1)' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: lvl === 'none' ? 'var(--text-3)' : 'var(--text-1)' }} title={CONDITIONS[k].ru}>
                {CONDITIONS[k].en} <span style={{ ...mono, fontSize: 9 }}>· {STATS[k].en}</span>
              </span>
              {editable ? (
                <button type="button" onClick={() => { const i = cycle.indexOf(lvl); onChange({ ...ch, conditions: { ...ch.conditions, [k]: cycle[(i + 1) % 3] } }); }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <Badge tone={tone as 'dead' | 'wounded' | 'neutral'} dot={lvl !== 'none'}>{lvl === 'none' ? 'clear' : lvl === 'normal' ? '−1' : 'serious −6'}</Badge>
                </button>
              ) : (
                <Badge tone={tone as 'dead' | 'wounded' | 'neutral'} dot={lvl !== 'none'}>{lvl === 'none' ? 'clear' : lvl === 'normal' ? '−1' : 'serious −6'}</Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MovesSection({ ch, role, ctx, onChange }: {
  ch: Character; role: CardRole; ctx: SheetCtx; onChange: (next: Character) => void;
}) {
  const gm = isGmRole(role);
  const editable = canEditField({ editableBy: 'player', advancementLocked: true }, role, ctx);
  const assessment = !gm && ctx.advancementOpen;
  const [picking, setPicking] = React.useState(false);
  const takenIds = new Set(ch.moves.map((m) => m.id).filter(Boolean));

  function addMove(m: KnownMove, cost: number) {
    if (assessment) {
      if (ch.xp < cost) return;
      onChange({ ...ch, xp: ch.xp - cost, moves: [...ch.moves, m] });
    } else {
      onChange({ ...ch, moves: [...ch.moves, m] });
    }
    setPicking(false);
  }
  function removeMove(i: number) { onChange({ ...ch, moves: ch.moves.filter((_, j) => j !== i) }); }

  return (
    <Card title="Moves" eyebrow="Ходы" padding="20px"
      actions={editable ? <Button size="sm" variant="ghost" iconStart={<Plus s={14} />} onClick={() => setPicking(true)}>Take a move</Button> : null}>
      {/* Basic moves are always known. */}
      <div style={{ ...mono, fontSize: 10, color: 'var(--accent-text)', marginBottom: 8 }}>Basic · always known</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {BASIC_MOVES.map((m) => (
          <span key={m.id} title={`${m.trigger}${m.stat ? ` (roll ${STATS[m.stat].en})` : ''}`} style={{ padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-inset)', border: '1px solid var(--border-1)', fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--text-2)' }}>{m.en}</span>
        ))}
      </div>
      <div style={{ ...mono, fontSize: 10, color: 'var(--accent-text)', marginBottom: 8 }}>Chosen moves</div>
      {ch.moves.length === 0 && <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-3)', fontSize: 14 }}>No moves taken yet.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ch.moves.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-1)' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' }}>{m.name} <Badge tone="neutral">{m.kind}</Badge></span>
            {editable && <button type="button" aria-label="Forget" onClick={() => removeMove(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>}
          </div>
        ))}
      </div>

      {picking && (
        <div style={{ marginTop: 16, padding: 14, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)' }}>
          <div style={{ ...mono, fontSize: 10, marginBottom: 8 }}>General moves {assessment ? '(spend XP)' : ''}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            {GENERAL_MOVES.filter((m) => !takenIds.has(m.id)).map((m) => {
              const cost = m.xp ?? MOVE_COST.basic;
              const tooDear = assessment && ch.xp < cost;
              return (
                <button key={m.id} type="button" disabled={tooDear} onClick={() => addMove({ id: m.id, name: m.en, kind: 'general' }, cost)}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 8, textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-1)', background: 'var(--surface-card)', cursor: tooDear ? 'not-allowed' : 'pointer', opacity: tooDear ? 0.45 : 1, fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-1)' }}>
                  <span>{m.en} <span style={{ ...mono, fontSize: 9 }}>{m.trigger}</span></span>
                  <span style={{ ...mono, fontSize: 10, color: 'var(--accent-text)' }}>{assessment ? `${cost}xp` : 'take'}</span>
                </button>
              );
            })}
          </div>
          <FreeMoveAdder onAdd={(name, kind) => addMove({ name, kind }, kind === 'house' ? MOVE_COST.houseOwn : MOVE_COST.personal)} assessment={assessment} xp={ch.xp} />
          <div style={{ marginTop: 10, textAlign: 'right' }}><Button size="sm" variant="ghost" onClick={() => setPicking(false)}>Done</Button></div>
        </div>
      )}
    </Card>
  );
}

function FreeMoveAdder({ onAdd, assessment, xp }: { onAdd: (name: string, kind: 'house' | 'personal') => void; assessment: boolean; xp: number }) {
  const [name, setName] = React.useState('');
  const [kind, setKind] = React.useState<'house' | 'personal'>('house');
  const cost = kind === 'house' ? MOVE_COST.houseOwn : MOVE_COST.personal;
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}><Field label="House / personal move"><Input size="sm" value={name} placeholder="Name the move…" onChange={(e) => setName(e.target.value)} /></Field></div>
      <Select size="sm" value={kind} onChange={(e) => setKind(e.target.value as 'house' | 'personal')} style={{ width: 130 }}>
        <option value="house">House</option><option value="personal">Personal</option>
      </Select>
      <Button size="sm" variant="secondary" disabled={!name.trim() || (assessment && xp < cost)} onClick={() => { onAdd(name.trim(), kind); setName(''); }}>
        {assessment ? `${cost}xp` : 'Add'}
      </Button>
    </div>
  );
}

function BondsSection({ ch, role, ctx, onChange }: {
  ch: Character; role: CardRole; ctx: SheetCtx; onChange: (next: Character) => void;
}) {
  const editable = canEditField({ editableBy: 'player' }, role, ctx);
  const [who, setWho] = React.useState('');
  function add() { const t = who.trim(); if (!t) return; const b: Bond = { id: uid(), who: t, hashtags: [] }; onChange({ ...ch, bonds: [...ch.bonds, b] }); setWho(''); }
  function setBond(id: string, patch: Partial<Bond>) { onChange({ ...ch, bonds: ch.bonds.map((b) => (b.id === id ? { ...b, ...patch } : b)) }); }
  return (
    <Card title="Bonds" eyebrow="Связи · how and whom you know" padding="20px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ch.bonds.length === 0 && <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-3)', fontSize: 14 }}>No bonds recorded.</span>}
        {ch.bonds.map((b) => (
          <div key={b.id} style={{ paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' }}>{b.who}</span>
              {editable && <button type="button" onClick={() => onChange({ ...ch, bonds: ch.bonds.filter((x) => x.id !== b.id) })} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>}
            </div>
            <div style={{ marginTop: 6 }}>
              <ListEditor value={b.hashtags} disabled={!editable} placeholder="#hashtag…" onChange={(tags) => setBond(b.id, { hashtags: tags.map((t) => (t.startsWith('#') ? t : `#${t}`)) })} />
            </div>
          </div>
        ))}
      </div>
      {editable && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Input size="sm" value={who} placeholder="Whom do you know?" onChange={(e) => setWho(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
          <Button size="sm" variant="secondary" iconStart={<Plus s={14} />} onClick={add}>Bond</Button>
        </div>
      )}
    </Card>
  );
}

function FieldGroupCard({ title, eyebrow, ch, role, ctx, group, onChange }: {
  title: string; eyebrow?: string; ch: Character; role: CardRole; ctx: SheetCtx;
  group: FieldMeta['group']; onChange: (next: Character) => void;
}) {
  const gm = isGmRole(role);
  const fields = FIELD_META.filter((f) => f.group === group && (gm || !f.gmOnly));
  if (fields.length === 0) return null;
  return (
    <Card title={title} eyebrow={eyebrow} padding="20px">
      <div style={{ display: 'grid', gap: 16 }}>
        {fields.map((meta) => {
          const editable = canEditField(meta, role, ctx);
          return (
            <Field key={String(meta.key)} label={meta.label} hint={editable ? meta.hint : undefined}>
              <FieldControl meta={meta} value={ch[meta.key]} disabled={!editable}
                onChange={(v) => onChange({ ...ch, [meta.key]: v })} />
            </Field>
          );
        })}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// The sheet + the panel (load / edit buffer / save / publish / advancement)
// ---------------------------------------------------------------------------

function GmAdvancementBar({ ch, onChange }: { ch: Character; onChange: (next: Character) => void }) {
  return (
    <Card eyebrow="Master · the turn of the wheel" title="Advancement" padding="18px" accentEdge>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={mono}>Grant XP</span>
          <Button size="sm" variant="secondary" onClick={() => onChange({ ...ch, xp: ch.xp + 1 })}>+1</Button>
          <Button size="sm" variant="secondary" onClick={() => onChange({ ...ch, xp: ch.xp + 2 })}>+2</Button>
          <Button size="sm" variant="secondary" onClick={() => onChange({ ...ch, xp: ch.xp + 15, level: ch.level + 1, hope: Math.max(ch.hope, 1) })}>Turn of the wheel · +15 & level</Button>
        </div>
        <span style={{ flex: 1 }} />
        <Switch checked={ch.advancementOpen} onChange={(v) => onChange({ ...ch, advancementOpen: v })} label="Open assessment" size="sm" />
      </div>
      <div style={{ ...mono, fontSize: 10, marginTop: 10, color: 'var(--text-3)' }}>
        {ch.xp} XP banked · while assessment is open the bearer may spend it on stats and moves.
      </div>
    </Card>
  );
}

function CharacterSheet({ ch, role, ctx, onChange }: {
  ch: Character; role: CardRole; ctx: SheetCtx; onChange: (next: Character) => void;
}) {
  const gm = isGmRole(role);
  const house = ch.house ? HOUSE_BY_ID[ch.house as HouseId] : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <Avatar initials={initialsOf(ch.cardName)} size="xl" square status={ch.status === 'dead' ? 'dead' : ch.status === 'wounded' ? 'wounded' : 'alive'} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, ...display, fontSize: 34 }}>{ch.cardName || 'Unnamed student'}</h1>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text-3)' }}>
            {house ? `${house.rune} ${house.en} · ${house.spec}` : 'No house sworn'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Badge tone="accent" dot>Level {ch.level}</Badge>
            <Badge tone="ember" outline>{ch.xp} XP</Badge>
            <Badge tone="neutral">Hope {ch.hope}</Badge>
            {ch.advancementOpen && <Badge tone="accent">Assessment open</Badge>}
          </div>
        </div>
      </div>

      {gm && <GmAdvancementBar ch={ch} onChange={onChange} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <StatsSection ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <MovesSection ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <FieldGroupCard title="Day" eyebrow="Нарративный пласт · день" group="day" ch={ch} role={role} ctx={ctx} onChange={onChange} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ConditionsSection ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <FieldGroupCard title="The mechanical sheet" eyebrow="Механический пласт" group="mechanical" ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <FieldGroupCard title="Resources" eyebrow="Ресурсы" group="resource" ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <BondsSection ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <FieldGroupCard title="Night" eyebrow="Нарративный пласт · ночь" group="night" ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <FieldGroupCard title="Behind the screen" eyebrow="Master only" group="gm" ch={ch} role={role} ctx={ctx} onChange={onChange} />
          <FieldGroupCard title="Identity" group="identity" ch={ch} role={role} ctx={ctx} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

/** Loads one character, holds the edit buffer, and binds save → publish. */
function CharacterPanel({ id, role, onBack }: { id: string; role: CardRole; onBack: () => void }) {
  const [rec, setRec] = React.useState<CharacterRecord | null>(null);
  const [buf, setBuf] = React.useState<Character | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<{ tone: 'accent' | 'alive' | 'dead'; msg: string } | null>(null);

  React.useEffect(() => watchCharacter(id, (r) => {
    setRec(r);
    setBuf((prev) => (prev && dirtyRef.current ? prev : r?.draft ?? r?.published ?? null));
  }), [id]);

  // Keep a ref so the snapshot listener doesn't clobber unsaved edits.
  const dirtyRef = React.useRef(false);
  React.useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  if (!rec || !buf) {
    return <div style={{ padding: 40, ...mono }}>Consulting the ledger…</div>;
  }
  const isNew = rec.published === null;
  const ctx: SheetCtx = { advancementOpen: buf.advancementOpen, isNew };

  function change(next: Character) { setBuf(next); setDirty(true); }
  async function save() {
    setBusy(true);
    try { await saveCharacterDraft(id, buf!, undefined); setDirty(false); setToast({ tone: 'accent', msg: 'Draft saved to the ledger.' }); }
    catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'The ledger refused the entry.' }); }
    finally { setBusy(false); }
  }
  async function publish() {
    setBusy(true);
    try { await saveCharacterDraft(id, buf!, undefined); await publishCharacter(id); setDirty(false); setToast({ tone: 'alive', msg: 'The sheet is sealed and shown to the table.' }); }
    catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'Could not seal the sheet.' }); }
    finally { setBusy(false); }
  }
  async function revert() {
    setBusy(true);
    try { await revertCharacter(id); setDirty(false); setToast({ tone: 'accent', msg: 'Draft reverted to the sealed copy.' }); }
    catch { /* noop */ } finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button variant="ghost" size="sm" onClick={onBack}>← The roster</Button>
        <span style={{ flex: 1 }} />
        <Badge tone={rec.state === 'published' ? 'alive' : rec.state === 'dirty' ? 'wounded' : 'neutral'} dot>
          {rec.state === 'published' ? 'Published' : rec.state === 'dirty' ? 'Unpublished changes' : 'Draft'}
        </Badge>
        {dirty && <Button variant="ghost" size="sm" onClick={revert} disabled={busy}>Revert</Button>}
        <Button variant="secondary" size="sm" onClick={save} loading={busy} disabled={!dirty && rec.state !== 'dirty'}>Save draft</Button>
        <Button size="sm" onClick={publish} loading={busy}>Publish</Button>
      </div>

      <CharacterSheet ch={buf} role={role} ctx={ctx} onChange={change} />

      {toast && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}>
          <Toast tone={toast.tone} title="The ledger" onDismiss={() => setToast(null)}>{toast.msg}</Toast>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rosters
// ---------------------------------------------------------------------------

function RosterGrid({ rows, onOpen, emptyNote }: { rows: CharacterRecord[]; onOpen: (id: string) => void; emptyNote: string }) {
  if (rows.length === 0) return <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-3)', fontSize: 16 }}>{emptyNote}</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {rows.map((r) => {
        const house = r.house ? HOUSE_BY_ID[r.house as HouseId] : null;
        return (
          <Card key={r.id} interactive accentEdge padding="16px" onClick={() => onOpen(r.id)}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar initials={initialsOf(r.name)} size="lg" square status={r.status === 'dead' ? 'dead' : r.status === 'wounded' ? 'wounded' : 'alive'} />
              <div style={{ minWidth: 0 }}>
                <div style={{ ...display, fontSize: 18 }}>{r.name || 'Unnamed'}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--text-3)' }}>{house ? `${house.rune} ${house.en}` : 'No house'}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <Badge tone={r.state === 'published' ? 'alive' : r.state === 'dirty' ? 'wounded' : 'neutral'} dot>{r.state === 'dirty' ? 'unpublished' : r.state}</Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/** Player view (B2.2): the bearer's own characters, with the power to enrol new ones. */
export function PlayerCharacters({ uid: ownerUid, email, role }: { uid: string; email: string | null; role: CardRole }) {
  const [rows, setRows] = React.useState<CharacterRecord[]>([]);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => watchMyCharacters(ownerUid, setRows), [ownerUid]);

  if (openId) return <CharacterPanel id={openId} role={role} onBack={() => setOpenId(null)} />;

  async function enrol() {
    setBusy(true);
    try { const id = await createCharacter(ownerUid, email); setOpenId(id); }
    finally { setBusy(false); }
  }
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <div style={mono}>Your characters · Tier</div>
          <h1 style={{ margin: '4px 0 0', ...display, fontSize: 34 }}>The Roster</h1>
        </div>
        <Button iconStart={<Plus s={16} />} onClick={enrol} loading={busy}>Enrol a character</Button>
      </div>
      <RosterGrid rows={rows} onOpen={setOpenId} emptyNote="You hold no characters yet. Enrol one to begin." />
    </div>
  );
}

/** Master view (B2.4): every character at the table; open and tend any sheet. */
export function GmRoster({ role }: { role: CardRole }) {
  const [rows, setRows] = React.useState<CharacterRecord[]>([]);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  React.useEffect(() => watchAllCharacters(setRows), []);

  if (openId) return <CharacterPanel id={openId} role={role} onBack={() => setOpenId(null)} />;
  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ ...mono, color: 'var(--accent-text)', marginBottom: 8 }}>Master · behind the screen</div>
      <h1 style={{ margin: '0 0 24px', ...display, fontSize: 34 }}>The Table's Roster</h1>
      <RosterGrid rows={rows} onOpen={setOpenId} emptyNote="No characters have been entered into the ledger." />
      {confirmDel && (
        <Button variant="danger" size="sm" onClick={async () => { await deleteCharacter(confirmDel); setConfirmDel(null); }}>Confirm strike from ledger</Button>
      )}
    </div>
  );
}
