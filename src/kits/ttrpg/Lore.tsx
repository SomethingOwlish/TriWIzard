/* TriWizard — TTRPG Lore library (Tier 4: B4.1). A wiki-style tree the GM
   authors and *provides* to the table; players read the published entries.
   Entries carry markdown bodies, cover images, and [[cross-links]] between
   pages. Built on the design primitives and src/lib/lore.ts. */
import React from 'react';
import {
  Button, Card, Badge, Field, Input, Textarea, Select, Switch, Dialog, Toast, ImagePicker, Markdown,
} from '../../components';
import { Plus, Edit, Scroll } from '../icons';
import { isGmRole, type CardRole } from '../../lib/pbta';
import {
  blankLore, createLore, saveLoreDraft, publishLore, unpublishLore, deleteLore, fetchLore,
  loreTitle, type LoreContent, type LoreEntry,
} from '../../lib/lore';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-3)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-1)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' };

interface Editing { id: string | null; content: LoreContent; parentId: string | null; }

function LoreEditor({ editing, parents, onSave, onClose, onDelete }: {
  editing: Editing; parents: LoreEntry[]; onSave: (e: Editing) => void; onClose: () => void; onDelete?: () => void;
}) {
  const [e, setE] = React.useState<Editing>(editing);
  const set = (p: Partial<LoreContent>) => setE((c) => ({ ...c, content: { ...c.content, ...p } }));
  return (
    <Dialog open width={640} onClose={onClose} eyebrow="Master · the archive" title={e.content.title || 'A new page'}
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          {onDelete && <Button variant="danger" size="sm" onClick={onDelete}>Burn the page</Button>}
          <span style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!e.content.title.trim()} onClick={() => onSave(e)}>Save page</Button>
        </div>
      }>
      <div style={{ display: 'grid', gap: 14, padding: '4px 0' }}>
        <Field label="Title"><Input value={e.content.title} onChange={(ev) => set({ title: ev.target.value })} placeholder="Of the Drowned Hall…" /></Field>
        <Field label="Parent page" hint="Where this page nests in the tree">
          <Select value={e.parentId ?? ''} onChange={(ev) => setE((c) => ({ ...c, parentId: ev.target.value || null }))}>
            <option value="">— a root page —</option>
            {parents.filter((p) => p.id !== e.id).map((p) => <option key={p.id} value={p.id}>{loreTitle(p, true)}</option>)}
          </Select>
        </Field>
        <Field label="Cover image" hint="Upload to Imgur, or paste a URL">
          <ImagePicker value={{ url: e.content.image, deletehash: e.content.imageDeletehash }} onChange={(v) => set({ image: v.url, imageDeletehash: v.deletehash })} />
        </Field>
        <Field label="Body" hint="Markdown: # heading, **bold**, *italic*, - list, > quote, [[Cross-link]]">
          <Textarea rows={12} value={e.content.body} onChange={(ev) => set({ body: ev.target.value })} placeholder="In the cold years before the gate…" />
        </Field>
        <Field label="Tags" hint="Comma-separated">
          <Input value={e.content.tags.join(', ')} onChange={(ev) => set({ tags: ev.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="houses, history" />
        </Field>
      </div>
    </Dialog>
  );
}

/** A node + its descendants in the tree sidebar. */
function TreeNode({ id, byParent, gm, selected, onSelect, depth }: {
  id: string; byParent: Map<string | null, LoreEntry[]>; gm: boolean; selected: string | null; onSelect: (id: string) => void; depth: number;
}) {
  const node = (byParent.get(null) ?? []).concat(...byParent.values()).find((n) => n.id === id);
  if (!node) return null;
  const kids = byParent.get(id) ?? [];
  return (
    <div>
      <a onClick={() => onSelect(id)} style={{
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '7px 10px',
        paddingLeft: 10 + depth * 16, borderRadius: 'var(--radius-sm)', ...serif, fontSize: 14,
        color: selected === id ? 'var(--text-1)' : 'var(--text-2)',
        background: selected === id ? 'var(--surface-raised)' : 'transparent',
        borderLeft: '2px solid', borderColor: selected === id ? 'var(--accent)' : 'transparent',
      }}>
        <Scroll s={13} style={{ color: selected === id ? 'var(--accent-text)' : 'var(--text-3)', flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loreTitle(node, gm)}</span>
        {gm && !node.isPublished && <Badge tone="wounded" outline>held</Badge>}
        {gm && node.state === 'dirty' && <Badge tone="ember" outline>edited</Badge>}
      </a>
      {kids.map((k) => <TreeNode key={k.id} id={k.id} byParent={byParent} gm={gm} selected={selected} onSelect={onSelect} depth={depth + 1} />)}
    </div>
  );
}

export function LoreModule({ role }: { role: CardRole }) {
  const gm = isGmRole(role);
  const [rows, setRows] = React.useState<LoreEntry[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Editing | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<{ tone: 'accent' | 'alive' | 'dead'; msg: string } | null>(null);

  const reload = React.useCallback(async () => {
    try { setRows(await fetchLore(gm)); } catch { setRows([]); }
  }, [gm]);
  React.useEffect(() => { reload(); }, [reload]);

  const byParent = React.useMemo(() => {
    const known = new Set(rows.map((r) => r.id));
    const m = new Map<string | null, LoreEntry[]>();
    for (const r of rows) {
      // An entry whose parent is missing (unpublished for a player) floats to root.
      const p = r.parentId && known.has(r.parentId) ? r.parentId : null;
      m.set(p, [...(m.get(p) ?? []), r]);
    }
    return m;
  }, [rows]);

  const current = rows.find((r) => r.id === selected) ?? null;
  const content = current ? (gm ? current.draft : current.published) : null;

  function openLink(title: string) {
    const t = title.trim().toLowerCase();
    const hit = rows.find((r) => loreTitle(r, gm).toLowerCase() === t);
    if (hit) setSelected(hit.id);
  }

  async function save(e: Editing) {
    setBusy(true);
    try {
      if (e.id) await saveLoreDraft(e.id, e.content, e.parentId);
      else { const id = await createLore(e.content, e.parentId); setSelected(id); }
      setEditing(null); await reload();
      setToast({ tone: 'accent', msg: 'The page is inscribed.' });
    } catch (err) { setToast({ tone: 'dead', msg: err instanceof Error ? err.message : 'The archive refused it.' }); }
    finally { setBusy(false); }
  }
  async function act(fn: () => Promise<void>, msg: string) {
    setBusy(true);
    try { await fn(); await reload(); setToast({ tone: 'accent', msg }); }
    catch (err) { setToast({ tone: 'dead', msg: err instanceof Error ? err.message : 'The archive refused it.' }); }
    finally { setBusy(false); }
  }

  const roots = byParent.get(null) ?? [];
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <aside style={{ width: 264, flexShrink: 0, borderRight: '1px solid var(--border-1)', background: 'var(--surface-sunken)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div><div style={mono}>The archive</div><div style={{ ...display, fontSize: 19 }}>Lore</div></div>
          {gm && <Button size="sm" variant="ghost" iconStart={<Plus s={14} />} onClick={() => setEditing({ id: null, content: blankLore(), parentId: null })}>New</Button>}
        </div>
        <div style={{ padding: '0 8px 16px' }}>
          {roots.length === 0
            ? <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)', padding: 12 }}>{gm ? 'No pages yet.' : 'No lore has been shared.'}</div>
            : roots.map((r) => <TreeNode key={r.id} id={r.id} byParent={byParent} gm={gm} selected={selected} onSelect={setSelected} depth={0} />)}
        </div>
      </aside>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {!current || !content ? (
          <div style={{ padding: 48, maxWidth: 720, margin: '0 auto', ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>
            <Scroll s={26} style={{ color: 'var(--accent-text)' }} />
            <p>Choose a page from the archive to read it.</p>
          </div>
        ) : (
          <div style={{ padding: 36, maxWidth: 760, margin: '0 auto' }}>
            {content.image && <div style={{ height: 220, borderRadius: 'var(--radius-lg)', background: `center / cover no-repeat url(${content.image})`, boxShadow: 'var(--shadow-md)', marginBottom: 22, border: '1px solid var(--border-1)' }} />}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <h1 style={{ margin: 0, ...display, fontSize: 34 }}>{content.title}</h1>
              {gm && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Switch size="sm" checked={current.isPublished} label="Provide" onChange={(v) => act(() => v ? publishLore(current.id) : unpublishLore(current.id), v ? 'Provided to the table.' : 'Withdrawn.')} />
                  <Button size="sm" variant="ghost" iconStart={<Edit s={14} />} onClick={() => setEditing({ id: current.id, content: current.draft, parentId: current.parentId })}>Edit</Button>
                </div>
              )}
            </div>
            {content.tags.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 4px' }}>{content.tags.map((t) => <Badge key={t} tone="neutral" outline>{t}</Badge>)}</div>}
            <div style={{ marginTop: 18 }}><Markdown source={content.body} onLink={openLink} /></div>
          </div>
        )}
      </div>

      {editing && <LoreEditor editing={editing} parents={rows} onSave={save} onClose={() => setEditing(null)} onDelete={editing.id ? () => act(() => deleteLore(editing.id!).then(() => setSelected(null)), 'Burned from the archive.').then(() => setEditing(null)) : undefined} />}
      {busy && null}
      {toast && <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}><Toast tone={toast.tone} title="The archive" onDismiss={() => setToast(null)}>{toast.msg}</Toast></div>}
    </div>
  );
}
