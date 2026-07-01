/* TriWizard — TTRPG Chronology (Tier 4: B4.2). The GM authors a shared campaign
   timeline AND a private timeline per character; players read the world timeline
   and their own characters' (save → publish). Renders through the Timeline
   primitive. Built on src/lib/chronology.ts. */
import React from 'react';
import { Button, Card, Badge, Field, Input, Textarea, Select, Switch, Toast, Timeline } from '../../components';
import { Plus, Clock } from '../icons';
import { isGmRole, type CardRole } from '../../lib/pbta';
import { watchMyCharacters, watchAllCharacters, type CharacterRecord } from '../../lib/characters';
import {
  WORLD_ID, blankChronicle, fetchChronicle, fetchPlayerChronicles, saveChronicleDraft,
  publishChronicle, unpublishChronicle, type ChronEvent, type ChronContent, type Chronicle,
} from '../../lib/chronology';
import { mergeWorldChronology } from '../../lib/notionSeed';

const uid = () => Math.random().toString(36).slice(2, 9);
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-3)' };
const display: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-1)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-1)' };
const TONES: ChronEvent['tone'][] = ['neutral', 'accent', 'alive', 'dead'];

function toTimeline(events: ChronEvent[]) {
  return events.map((e) => ({ id: e.id, time: e.time || '—', title: e.title || 'Untitled', body: e.body, tone: e.tone }));
}

// ---- GM event editor for one chronicle -------------------------------------
function ChronicleEditor({ target, onToast }: {
  target: { id: string; name: string; kind: 'world' | 'character'; ownerUid?: string | null }; onToast: (t: { tone: 'accent' | 'dead'; msg: string }) => void;
}) {
  const [doc, setDoc] = React.useState<Chronicle | null>(null);
  const [events, setEvents] = React.useState<ChronEvent[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let live = true;
    setLoaded(false);
    fetchChronicle(target.id).then((c) => { if (!live) return; setDoc(c); setEvents(c?.draft?.events ?? []); setLoaded(true); });
    return () => { live = false; };
  }, [target.id]);

  const patch = (id: string, p: Partial<ChronEvent>) => setEvents((es) => es.map((e) => e.id === id ? { ...e, ...p } : e));
  const add = () => setEvents((es) => [...es, { id: uid(), time: '', title: '', body: '', tone: 'neutral' }]);
  const remove = (id: string) => setEvents((es) => es.filter((e) => e.id !== id));
  const move = (i: number, d: -1 | 1) => setEvents((es) => { const n = [...es]; const j = i + d; if (j < 0 || j >= n.length) return es; [n[i], n[j]] = [n[j], n[i]]; return n; });

  async function save(then?: 'publish') {
    try {
      const content: ChronContent = { events };
      await saveChronicleDraft(target.id, content, { kind: target.kind, ownerUid: target.ownerUid ?? null, charName: target.kind === 'character' ? target.name : '' });
      if (then === 'publish') await publishChronicle(target.id);
      const c = await fetchChronicle(target.id); setDoc(c);
      onToast({ tone: 'accent', msg: then === 'publish' ? 'The chronicle is sealed and shown.' : 'The chronicle is saved.' });
    } catch (e) { onToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'The chronicle refused it.' }); }
  }
  async function withdraw() {
    try { await unpublishChronicle(target.id); setDoc(await fetchChronicle(target.id)); onToast({ tone: 'accent', msg: 'Withdrawn from the table.' }); }
    catch (e) { onToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'Refused.' }); }
  }
  async function importArchive() {
    try {
      const { events: merged, created, skipped } = await mergeWorldChronology(events);
      setEvents(merged);
      onToast({ tone: 'accent', msg: created ? `From Notion: ${created} event${created === 1 ? '' : 's'} added${skipped ? `, ${skipped} already here` : ''}. Save to keep them.` : 'The chronicle already holds every Notion event.' });
    } catch (e) { onToast({ tone: 'dead', msg: e instanceof Error ? e.message : 'The chronicle refused it.' }); }
  }

  if (!loaded) return <div style={{ padding: 32, ...serif, color: 'var(--text-3)' }}>Reading the chronicle…</div>;
  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={mono}>{target.kind === 'world' ? 'The world' : 'Character chronicle'}</div>
          <h1 style={{ margin: '4px 0 0', ...display, fontSize: 30 }}>{target.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {doc?.isPublished ? <Badge tone="alive" dot>shown</Badge> : <Badge tone="wounded" outline>held</Badge>}
          {doc?.state === 'dirty' && <Badge tone="ember" outline>unpublished edits</Badge>}
          {target.kind === 'world' && <Button size="sm" variant="ghost" iconStart={<Clock s={14} />} onClick={importArchive}>Import from Notion</Button>}
          <Button size="sm" variant="secondary" onClick={() => save()}>Save</Button>
          <Button size="sm" onClick={() => save('publish')}>Provide</Button>
          {doc?.isPublished && <Button size="sm" variant="ghost" onClick={withdraw}>Withdraw</Button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <Card title="Events" eyebrow="Author the entries" padding="18px"
          actions={<Button size="sm" variant="ghost" iconStart={<Plus s={14} />} onClick={add}>Add</Button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {events.length === 0 && <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>No entries yet.</div>}
            {events.map((e, i) => (
              <div key={e.id} style={{ borderBottom: '1px solid var(--border-1)', paddingBottom: 14, display: 'grid', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="When"><Input size="sm" value={e.time} onChange={(ev) => patch(e.id, { time: ev.target.value })} placeholder="Session IV" /></Field>
                  <Field label="Tone">
                    <Select size="sm" value={e.tone} onChange={(ev) => patch(e.id, { tone: ev.target.value as ChronEvent['tone'] })}>
                      {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </Field>
                </div>
                <Field label="Title"><Input size="sm" value={e.title} onChange={(ev) => patch(e.id, { title: ev.target.value })} placeholder="The Oath of Salt" /></Field>
                <Field label="Body"><Textarea rows={2} value={e.body} onChange={(ev) => patch(e.id, { body: ev.target.value })} /></Field>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>↑</Button>
                  <Button size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === events.length - 1}>↓</Button>
                  <span style={{ flex: 1 }} />
                  <Button size="sm" variant="danger" onClick={() => remove(e.id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Preview" eyebrow="As the table will read it" padding="22px">
          {events.length ? <Timeline events={toTimeline(events)} /> : <div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>Nothing to show.</div>}
        </Card>
      </div>
    </div>
  );
}

// ---- player read view ------------------------------------------------------
function ReaderChronicle({ c }: { c: Chronicle }) {
  const events = c.published?.events ?? [];
  if (!events.length) return null;
  return (
    <Card title={c.kind === 'world' ? 'The World' : c.charName || 'Chronicle'} eyebrow={c.kind === 'world' ? 'Campaign chronology' : 'Your chronicle'} padding="26px">
      <Timeline events={toTimeline(events)} />
    </Card>
  );
}

export function ChronologyModule({ role, userUid }: { role: CardRole; userUid: string | null }) {
  const gm = isGmRole(role);
  const [chars, setChars] = React.useState<CharacterRecord[]>([]);
  const [target, setTarget] = React.useState<{ id: string; name: string; kind: 'world' | 'character'; ownerUid?: string | null }>({ id: WORLD_ID, name: 'The World', kind: 'world' });
  const [reader, setReader] = React.useState<{ world: Chronicle | null; perChar: Chronicle[] }>({ world: null, perChar: [] });
  const [toast, setToast] = React.useState<{ tone: 'accent' | 'dead'; msg: string } | null>(null);

  React.useEffect(() => {
    if (gm) return watchAllCharacters(setChars);
    if (userUid) return watchMyCharacters(userUid, setChars);
    setChars([]); return undefined;
  }, [gm, userUid]);

  React.useEffect(() => {
    if (gm) return;
    let live = true;
    fetchPlayerChronicles(chars.map((c) => c.id)).then((r) => { if (live) setReader(r); });
    return () => { live = false; };
  }, [gm, chars]);

  if (gm) {
    return (
      <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
        <aside style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border-1)', background: 'var(--surface-sunken)', overflow: 'auto', padding: '16px 8px' }}>
          <div style={{ ...mono, padding: '0 8px 8px' }}>Chronicles</div>
          {[{ id: WORLD_ID, name: 'The World', kind: 'world' as const, ownerUid: null }, ...chars.map((c) => ({ id: c.id, name: c.name || 'Unnamed', kind: 'character' as const, ownerUid: c.ownerUid }))].map((t) => (
            <a key={t.id} onClick={() => setTarget(t)} style={{
              display: 'block', cursor: 'pointer', padding: '8px 10px', borderRadius: 'var(--radius-sm)', ...serif, fontSize: 14,
              color: target.id === t.id ? 'var(--text-1)' : 'var(--text-2)', background: target.id === t.id ? 'var(--surface-raised)' : 'transparent',
              borderLeft: '2px solid', borderColor: target.id === t.id ? 'var(--accent)' : 'transparent',
            }}>{t.name}</a>
          ))}
        </aside>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ChronicleEditor key={target.id} target={target} onToast={setToast} />
        </div>
        {toast && <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}><Toast tone={toast.tone === 'dead' ? 'dead' : 'accent'} title="The chronicle" onDismiss={() => setToast(null)}>{toast.msg}</Toast></div>}
      </div>
    );
  }

  const any = reader.world || reader.perChar.length > 0;
  return (
    <div style={{ padding: 32, maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div><div style={mono}>The reckoning of days</div><h1 style={{ margin: '4px 0 0', ...display, fontSize: 34 }}>Chronology</h1></div>
      {!any ? (
        <Card padding="28px"><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Clock s={22} style={{ color: 'var(--accent-text)' }} /><div style={{ ...serif, fontStyle: 'italic', color: 'var(--text-3)' }}>No chronicle has been shared with you yet.</div></div></Card>
      ) : (
        <>
          {reader.world && <ReaderChronicle c={reader.world} />}
          {reader.perChar.map((c) => <ReaderChronicle key={c.id} c={c} />)}
        </>
      )}
    </div>
  );
}
