import React from 'react';

/**
 * Markdown — a tiny, dependency-free renderer for the authored knowledge
 * modules (lore, rules, NPC descriptions). It supports the lightweight subset an
 * in-world author needs and nothing that could inject HTML: it builds React
 * nodes directly, never `dangerouslySetInnerHTML`.
 *
 * Blocks:  `#`/`##`/`###` headings · `-`/`*` lists · `1.` ordered lists ·
 *          `>` blockquote · `---` rule · blank line = paragraph.
 * Inline:  **bold** · *italic* · `code` · [text](url) · [[Cross-link]].
 *
 * `[[Title]]` cross-links call `onLink(title)` when provided (used by Lore to
 * jump between entries); otherwise they render as quiet emphasised text.
 */
export interface MarkdownProps {
  source: string;
  /** Resolve a [[Title]] cross-link to a navigation action. */
  onLink?: (title: string) => void;
  style?: React.CSSProperties;
}

const INLINE = /(\[\[[^\]]+\]\])|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;

function renderInline(
  text: string,
  onLink: ((t: string) => void) | undefined,
  keyBase: string,
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  let i = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith('[[')) {
      const title = tok.slice(2, -2).trim();
      out.push(
        onLink ? (
          <a
            key={k}
            onClick={() => onLink(title)}
            style={{ color: 'var(--accent-text)', cursor: 'pointer', borderBottom: '1px dotted var(--accent)' }}
          >
            {title}
          </a>
        ) : (
          <span key={k} style={{ color: 'var(--accent-text)' }}>{title}</span>
        ),
      );
    } else if (tok.startsWith('[')) {
      const mt = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      const label = mt?.[1] ?? tok;
      const href = mt?.[2] ?? '#';
      out.push(
        <a key={k} href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-text)' }}>
          {label}
        </a>,
      );
    } else if (tok.startsWith('**')) {
      out.push(<strong key={k} style={{ color: 'var(--text-1)' }}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('*')) {
      out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith('`')) {
      out.push(
        <code key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9em', background: 'var(--surface-inset)', padding: '1px 5px', borderRadius: 'var(--radius-xs)' }}>
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const head: React.CSSProperties = { fontFamily: 'var(--font-display)', color: 'var(--text-1)', margin: '18px 0 6px', lineHeight: 1.2 };
const para: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)', margin: '0 0 12px' };

export function Markdown({ source, onLink, style = {} }: MarkdownProps) {
  const lines = (source || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let para_buf: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let bq: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para_buf.length) {
      const t = para_buf.join(' ');
      blocks.push(<p key={`p${key++}`} style={para}>{renderInline(t, onLink, `p${key}`)}</p>);
      para_buf = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((it, n) => (
        <li key={n} style={{ ...para, margin: '0 0 4px' }}>{renderInline(it, onLink, `l${key}-${n}`)}</li>
      ));
      blocks.push(
        list.ordered
          ? <ol key={`ol${key++}`} style={{ paddingLeft: 22, margin: '0 0 12px' }}>{items}</ol>
          : <ul key={`ul${key++}`} style={{ paddingLeft: 22, margin: '0 0 12px' }}>{items}</ul>,
      );
      list = null;
    }
  };
  const flushQuote = () => {
    if (bq.length) {
      blocks.push(
        <blockquote key={`bq${key++}`} style={{ ...para, borderLeft: '2px solid var(--accent)', paddingLeft: 14, fontStyle: 'italic', color: 'var(--text-3)', margin: '0 0 12px' }}>
          {renderInline(bq.join(' '), onLink, `bq${key}`)}
        </blockquote>,
      );
      bq = [];
    }
  };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushAll(); continue; }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    const q = /^>\s?(.*)$/.exec(line);
    if (/^---+$/.test(line.trim())) {
      flushAll();
      blocks.push(<hr key={`hr${key++}`} style={{ border: 0, borderTop: '1px solid var(--border-1)', margin: '18px 0' }} />);
    } else if (h) {
      flushAll();
      const size = h[1].length === 1 ? 26 : h[1].length === 2 ? 20 : 16;
      const Tag = (`h${h[1].length + 1}`) as 'h2' | 'h3' | 'h4';
      blocks.push(<Tag key={`h${key++}`} style={{ ...head, fontSize: size }}>{renderInline(h[2], onLink, `h${key}`)}</Tag>);
    } else if (ul) {
      flushPara(); flushQuote();
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] }; }
      list.items.push(ul[1]);
    } else if (ol) {
      flushPara(); flushQuote();
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] }; }
      list.items.push(ol[1]);
    } else if (q) {
      flushPara(); flushList();
      bq.push(q[1]);
    } else {
      flushList(); flushQuote();
      para_buf.push(line.trim());
    }
  }
  flushAll();

  return <div style={style}>{blocks}</div>;
}
