/* TriWizard — TTRPG Rule Helper (Tier 4: B4.3). A standalone GM-authored rules
   reference (distinct from the Moves catalogue): markdown rule articles and
   editable reference tables, grouped by section, provided to players via
   save → publish. Built on src/lib/rulebook.ts + the DataTable/Markdown primitives. */
import React from 'react';
import {
  Button, Card, Badge, Field, Input, Textarea, Select, Switch, Dialog, Toast, DataTable, Markdown,
} from '../../components';
import { Plus, Edit, Compass } from '../icons';
import { isGmRole, type CardRole } from '../../lib/pbta';
import {
  blankRule, createRule, saveRuleDraft, publishRule, unpublishRule, deleteRule, fetchRules,
  type RuleContent, type RuleEntry, type RuleKind, type RuleColumn,
} from '../../lib/rulebook';

const uid = () => Math.random().toString(36).slice(2, 7);
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-3)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-1)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' };

function RuleView({ c }: { c: RuleContent }) {
  if (c.kind === 'table') {
    return (
      <div>
        <DataTable dense columns={c.columns.map((col) => ({ key: col.key, label: col.label, align: col.align, mono: col.mono }))} rows={c.rows} />
        {c.caption && <div style={{ ...mono, fontSize: 10, color: 'var(--text-3)', marginTop: 8 }}>{c.caption}</div>}
      </div>
    );
  }
  return <Markdown source={c.body} />;
}

function RuleEditor({ initial, onSave, onClose, onDelete }: {
  initial: RuleContent; onSave: (c: RuleContent) => void; onClose: () => void; onDelete?: () => void;
}) {
  const [c, setC] = React.useState<RuleContent>(initial);
  const set = (p: Partial<RuleContent>) => setC((cur) => ({ ...cur, ...p }));
  const setCol = (i: number, p: Partial<RuleColumn>) => set({ columns: c.columns.map((col, n) => n === i ? { ...col, ...p } : col) });
  const addCol = () => set({ columns: [...c.columns, { key: `c${uid()}`, label: 'Column' }] });
  const delCol = (i: number) => set({ columns: c.columns.filter((_, n) => n !== i) });
  const addRow = () => set({ rows: [...c.rows, Object.fromEntries(c.columns.map((col) => [col.key, '']))] });
  const delRow = (i: number) => set({ rows: c.rows.filter((_, n) => n !== i) });
  const setCell = (ri: number, key: string, v: string) => set({ rows: c.rows.map((r, n) => n === ri ? { ...r, [key]: v } : r) });

  return (
    <Dialog open width={c.kind === 'table' ? 760 : 620} onClose={onClose} eyebrow="Master · the rulebook" title={c.title || (c.kind === 'table' ? 'A new table' : 'A new article')}
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          {onDelete && <Button variant="danger" size="sm" onClick={onDelete}>Strike out</Button>}
          <span style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!c.title.trim()} onClick={() => onSave(c)}>Save</Button>
        </div>
      }>
      <div style={{ display: 'grid', gap: 14, padding: '4px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Title"><Input value={c.title} onChange={(e) => set({ title: e.target.value })} placeholder="The dice ladder" /></Field>
          <Field label="Section" hint="Groups entries together"><Input value={c.section} onChange={(e) => set({ section: e.target.value })} placeholder="Core" /></Field>
        </div>
        {c.kind === 'article' ? (
          <Field label="Body" hint="Markdown: # heading, **bold**, - list, > quote">
            <Textarea rows={12} value={c.body} onChange={(e) => set({ body: e.target.value })} placeholder="When you roll 2d6 + stat…" />
          </Field>
        ) : (
          <>
            <div>
              <div style={{ ...mono, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>Columns <Button size="sm" variant="ghost" iconStart={<Plus s={13} />} onClick={addCol}>Column</Button></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {c.columns.map((col, i) => (
                  <div key={col.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input size="sm" value={col.label} onChange={(e) => setCol(i, { label: e.target.value })} style={{ flex: 1 }} />
                    <Select size="sm" value={col.align ?? 'left'} onChange={(e) => setCol(i, { align: e.target.value as RuleColumn['align'] })}>
                      <option value="left">left</option><option value="center">center</option><option value="right">right</option>
                    </Select>
                    <Switch size="sm" checked={!!col.mono} label="mono" onChange={(v) => setCol(i, { mono: v })} />
                    <button type="button" aria-label="Remove column" onClick={() => delCol(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...mono, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>Rows <Button size="sm" variant="ghost" iconStart={<Plus s={13} />} onClick={addRow}>Row</Button></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {c.rows.map((r, ri) => (
                  <div key={ri} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {c.columns.map((col) => <Input key={col.key} size="sm" value={r[col.key] ?? ''} onChange={(e) => setCell(ri, col.key, e.target.value)} placeholder={col.label} style={{ flex: 1 }} />)}
                    <button type="button" aria-label="Remove row" onClick={() => delRow(ri)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
            <Field label="Caption" hint="Shown beneath the table"><Input value={c.caption} onChange={(e) => set({ caption: e.target.value })} /></Field>
          </>
        )}
      </div>
    </Dialog>
  );
}

export function RulebookModule({ role }: { role: CardRole }) {
  const gm = isGmRole(role);
  const [rows, setRows] = React.useState<RuleEntry[]>([]);
  const [editing, setEditing] = React.useState<{ id: string | null; content: RuleContent } | null>(null);
  const [toast, setToast] = React.useState<{ tone: 'accent' | 'dead'; msg: string } | null>(null);

  const reload = React.useCallback(async () => { try { setRows(await fetchRules(gm)); } catch { setRows([]); } }, [gm]);
  React.useEffect(() => { reload(); }, [reload]);

  async function save(content: RuleContent) {
    try {
      if (editing?.id) await saveRuleDraft(editing.id, content); else await createRule(content);
      setEditing(null); await reload(); setToast({ tone: 'accent', msg: 'Inscribed in the rulebook.' });
    } catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'The rulebook refused it.' }); }
  }
  async function act(fn: () => Promise<void>, msg: string) {
    try { await fn(); await reload(); setToast({ tone: 'accent', msg }); }
    catch (e) { setToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'Refused.' }); }
  }

  const sections = React.useMemo(() => {
    const m = new Map<string, RuleEntry[]>();
    for (const r of rows) { const c = gm ? r.draft : r.published; const s = (c?.section || 'Misc').trim() || 'Misc'; m.set(s, [...(m.get(s) ?? []), r]); }
    return [...m.entries()];
  }, [rows, gm]);

  return (
    <div style={{ padding: 32, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div><div style={mono}>{gm ? 'Master · the rulebook' : 'Your reference'}</div><h1 style={{ margin: '4px 0 0', ...display, fontSize: 34 }}>Rules</h1></div>
        {gm && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" iconStart={<Plus s={15} />} onClick={() => setEditing({ id: null, content: blankRule('table') })}>Table</Button>
            <Button size="sm" iconStart={<Plus s={15} />} onClick={() => setEditing({ id: null, content: blankRule('article') })}>Article</Button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <Card padding="28px"><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Compass s={22} style={{ color: 'var(--accent-text)' }} /><div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>{gm ? 'The rulebook is empty. Author an article or a reference table.' : 'No rules have been provided to you yet.'}</div></div></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {sections.map(([section, entries]) => (
            <div key={section}>
              <div style={{ ...mono, color: 'var(--accent-text)', marginBottom: 12 }}>{section} · {entries.length}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {entries.map((r) => {
                  const c = gm ? r.draft : r.published; if (!c) return null;
                  return (
                    <Card key={r.id} title={c.title} eyebrow={c.kind === 'table' ? 'Reference table' : 'Rule'} padding="20px" accentEdge={gm && !r.isPublished}
                      actions={gm ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {!r.isPublished && <Badge tone="wounded" outline>held</Badge>}
                          {r.state === 'dirty' && <Badge tone="ember" outline>edited</Badge>}
                          <Switch size="sm" checked={r.isPublished} onChange={(v) => act(() => v ? publishRule(r.id) : unpublishRule(r.id), v ? 'Provided.' : 'Withdrawn.')} />
                          <Button size="sm" variant="ghost" iconStart={<Edit s={14} />} onClick={() => setEditing({ id: r.id, content: r.draft })}>Edit</Button>
                        </div>
                      ) : null}>
                      <RuleView c={c} />
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <RuleEditor initial={editing.content} onSave={save} onClose={() => setEditing(null)} onDelete={editing.id ? () => { const id = editing.id!; setEditing(null); act(() => deleteRule(id), 'Struck from the rulebook.'); } : undefined} />}
      {toast && <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}><Toast tone={toast.tone === 'dead' ? 'dead' : 'accent'} title="The rulebook" onDismiss={() => setToast(null)}>{toast.msg}</Toast></div>}
    </div>
  );
}
