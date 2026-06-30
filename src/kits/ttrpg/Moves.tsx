/* TriWizard — TTRPG move library (Tier 3: B3.4). The GM curates one shared
   catalogue with the full schema taxonomy (kind / house / tier / XP / stat /
   trigger / outcome-by-band) and *provides* moves to players by publishing them;
   players read the provided moves as their rule reference. Built on the design
   primitives and the move data layer in src/lib/moves.ts. */
import React from 'react';
import { Button, Card, Badge, Field, Input, Textarea, Select, Switch, Dialog, Toast } from '../../components';
import { Plus, Edit, Bolt } from '../icons';
import {
  STAT_KEYS, STATS, HOUSES, HOUSE_BY_ID, TIERS, isGmRole,
  type CardRole, type HouseId, type MoveKind, type StatKey, type Tier,
} from '../../lib/pbta';
import { BAND_ORDER, BANDS, type MoveOutcomes } from '../../lib/pbtaDice';
import {
  blankMove, createMove, saveMove, setMovePublished, deleteMove, seedCanon,
  watchMoves, watchPublishedMoves, type MoveEntry, type MoveInput,
} from '../../lib/moves';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-3)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-1)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' };

const KINDS: { value: MoveKind; label: string }[] = [
  { value: 'basic', label: 'Basic (базовый)' },
  { value: 'general', label: 'General (общий)' },
  { value: 'house', label: 'House (ход дома)' },
  { value: 'personal', label: 'Personal (личный)' },
];
const KIND_GROUPS: MoveKind[] = ['basic', 'general', 'house', 'personal'];
const KIND_LABEL: Record<MoveKind, string> = { basic: 'Basic moves', general: 'General moves', house: 'House moves', personal: 'Personal moves' };

/** Read-only display of a move's body — shared by the player reference and the GM list. */
function MoveBody({ m }: { m: MoveEntry }) {
  const house = m.house ? HOUSE_BY_ID[m.house] : null;
  const bands = BAND_ORDER.filter((b) => (m.outcomes[BANDS[b].outcomeKey] ?? '').trim());
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Badge tone="neutral">{m.kind}</Badge>
        {house && <Badge tone="accent">{house.rune} {house.en}</Badge>}
        {m.tier && <Badge tone="ember" outline>{TIERS.find((t) => t.value === m.tier)?.label ?? m.tier}</Badge>}
        {m.stat && <Badge tone="accent" outline>roll {STATS[m.stat].en}</Badge>}
        {m.xp != null && <Badge tone="neutral" outline>{m.xp} XP</Badge>}
      </div>
      {m.trigger && <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-2)' }}>{m.trigger}</div>}
      {bands.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
          {bands.map((b) => (
            <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span style={{ ...mono, fontSize: 9, color: `var(--status-${BANDS[b].tone === 'ember' || BANDS[b].tone === 'accent' ? 'wounded' : BANDS[b].tone})`, minWidth: 64 }}>{BANDS[b].range}</span>
              <span style={{ ...serif, fontSize: 14 }}>{m.outcomes[BANDS[b].outcomeKey]}</span>
            </div>
          ))}
        </div>
      )}
      {m.crossHouseNote.trim() && <div style={{ ...mono, fontSize: 10, color: 'var(--text-3)' }}>{m.crossHouseNote}</div>}
    </div>
  );
}

function Grouped({ rows, render }: { rows: MoveEntry[]; render: (m: MoveEntry) => React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {KIND_GROUPS.map((kind) => {
        const group = rows.filter((m) => m.kind === kind);
        if (group.length === 0) return null;
        return (
          <div key={kind}>
            <div style={{ ...mono, color: 'var(--accent-text)', marginBottom: 12 }}>{KIND_LABEL[kind]} · {group.length}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {group.map((m) => render(m))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- GM editor -------------------------------------------------------------

function MoveEditor({ initial, onSave, onClose, onDelete }: {
  initial: MoveInput; onSave: (input: MoveInput) => void; onClose: () => void; onDelete?: () => void;
}) {
  const [m, setM] = React.useState<MoveInput>(initial);
  const set = (patch: Partial<MoveInput>) => setM((cur) => ({ ...cur, ...patch }));
  const setOutcome = (k: keyof MoveOutcomes, v: string) => set({ outcomes: { ...m.outcomes, [k]: v } });
  return (
    <Dialog open width={620} onClose={onClose} eyebrow="Master · the grimoire" title={m.name || 'A new move'}
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          {onDelete && <Button variant="danger" size="sm" onClick={onDelete}>Strike out</Button>}
          <span style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!m.name.trim()} onClick={() => onSave(m)}>Save move</Button>
        </div>
      }>
      <div style={{ display: 'grid', gap: 14, padding: '4px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Name (EN)"><Input value={m.name} onChange={(e) => set({ name: e.target.value })} placeholder="Cast magic…" /></Field>
          <Field label="Имя (RU)"><Input value={m.ru} onChange={(e) => set({ ru: e.target.value })} placeholder="Применяю магию…" /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Kind">
            <Select value={m.kind} onChange={(e) => set({ kind: e.target.value as MoveKind })}>
              {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </Select>
          </Field>
          <Field label="House" hint="House moves only">
            <Select value={m.house ?? ''} onChange={(e) => set({ house: (e.target.value || null) as HouseId | null })} disabled={m.kind !== 'house'}>
              <option value="">— none —</option>
              {HOUSES.map((h) => <option key={h.id} value={h.id}>{h.rune} {h.en}</option>)}
            </Select>
          </Field>
          <Field label="Tier" hint="Simpla/Maxima/Ultima">
            <Select value={m.tier ?? ''} onChange={(e) => set({ tier: (e.target.value || null) as Tier | null })}>
              <option value="">— any —</option>
              {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Governing stat" hint="Rolled with 2d6">
            <Select value={m.stat ?? ''} onChange={(e) => set({ stat: (e.target.value || null) as StatKey | null })}>
              <option value="">— none / varies —</option>
              {STAT_KEYS.map((k) => <option key={k} value={k}>{STATS[k].en} ({STATS[k].ru})</option>)}
            </Select>
          </Field>
          <Field label="XP to learn" hint="Cost after creation">
            <Input type="number" value={m.xp == null ? '' : String(m.xp)} onChange={(e) => set({ xp: e.target.value === '' ? null : Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Trigger" hint="When do you make this move?">
          <Textarea rows={2} value={m.trigger} onChange={(e) => set({ trigger: e.target.value })} placeholder="When you…" />
        </Field>
        <div>
          <div style={{ ...mono, marginBottom: 8 }}>Outcomes by the ladder</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BAND_ORDER.map((b) => (
              <Field key={b} label={`${BANDS[b].label} · ${BANDS[b].range}`}>
                <Textarea rows={2} value={m.outcomes[BANDS[b].outcomeKey] ?? ''} onChange={(e) => setOutcome(BANDS[b].outcomeKey, e.target.value)} placeholder="Leave blank to fall back to the generic band." />
              </Field>
            ))}
          </div>
        </div>
        <Field label="Cross-house / notes">
          <Input value={m.crossHouseNote} onChange={(e) => set({ crossHouseNote: e.target.value })} placeholder="e.g. learnable only to Simpla by other houses" />
        </Field>
        <Switch checked={m.published} onChange={(v) => set({ published: v })} label="Provide to players" />
      </div>
    </Dialog>
  );
}

// ---- The module ------------------------------------------------------------

export function MovesModule({ role }: { role: CardRole }) {
  const gm = isGmRole(role);
  const [rows, setRows] = React.useState<MoveEntry[]>([]);
  const [editing, setEditing] = React.useState<{ id: string | null; input: MoveInput } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<{ tone: 'accent' | 'alive' | 'dead'; msg: string } | null>(null);

  React.useEffect(() => (gm ? watchMoves(setRows) : watchPublishedMoves(setRows)), [gm]);

  async function persist(input: MoveInput) {
    setBusy(true);
    try {
      if (editing?.id) await saveMove(editing.id, input);
      else await createMove(input);
      setEditing(null);
      setToast({ tone: 'accent', msg: 'The move is inscribed.' });
    } catch (e) {
      setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'The grimoire refused the entry.' });
    } finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true);
    try { await deleteMove(id); setEditing(null); setToast({ tone: 'accent', msg: 'Struck from the grimoire.' }); }
    catch { /* noop */ } finally { setBusy(false); }
  }
  async function seed() {
    setBusy(true);
    try { const n = await seedCanon(); setToast({ tone: 'alive', msg: n ? `${n} canon moves added.` : 'The canon was already inscribed.' }); }
    catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'Could not seed the canon.' }); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={mono}>{gm ? 'Master · the grimoire' : 'Your reference'}</div>
          <h1 style={{ margin: '4px 0 0', ...display, fontSize: 34 }}>Moves</h1>
        </div>
        {gm && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={seed} loading={busy}>Import the canon</Button>
            <Button iconStart={<Plus s={16} />} onClick={() => setEditing({ id: null, input: blankMove() })}>Inscribe a move</Button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <Card padding="28px">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Bolt s={22} style={{ color: 'var(--accent-text)' }} />
            <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>
              {gm ? 'The grimoire is empty. Import the canon basic & general moves, or inscribe your own.' : 'No moves have been provided to you yet.'}
            </div>
          </div>
        </Card>
      ) : (
        <Grouped rows={rows} render={(m) => (
          <Card key={m.id} padding="18px" accentEdge={!m.published && gm}
            actions={gm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Switch size="sm" checked={m.published} onChange={(v) => setMovePublished(m.id, v)} />
                <Button variant="ghost" size="sm" iconStart={<Edit s={14} />} onClick={() => setEditing({ id: m.id, input: m })}>Edit</Button>
              </div>
            ) : null}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <span style={{ ...display, fontSize: 18 }}>{m.name}</span>
              {m.ru && <span style={{ ...serif, fontStyle: 'italic', fontSize: 13, color: 'var(--text-3)' }}>{m.ru}</span>}
              {gm && !m.published && <Badge tone="wounded" outline>held</Badge>}
            </div>
            <MoveBody m={m} />
          </Card>
        )} />
      )}

      {editing && (
        <MoveEditor
          initial={editing.input}
          onSave={persist}
          onClose={() => setEditing(null)}
          onDelete={editing.id ? () => remove(editing.id!) : undefined}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}>
          <Toast tone={toast.tone} title="The grimoire" onDismiss={() => setToast(null)}>{toast.msg}</Toast>
        </div>
      )}
    </div>
  );
}
