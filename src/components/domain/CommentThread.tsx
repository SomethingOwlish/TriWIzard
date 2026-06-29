import React from 'react';
import { Avatar } from '../core/Avatar';

export interface Comment {
  id?: string | number;
  author: string;
  role?: string;
  time?: string;
  body: React.ReactNode;
  avatar?: string;
  initials?: string;
}

export interface CommentThreadProps {
  comments: Comment[];
  /** Show a composer; called with the text on submit (⌘/Ctrl+Enter). */
  onSubmit?: (text: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

/** CommentThread — chronological notes on a card/character. Optional composer. */
export function CommentThread({ comments = [], onSubmit, placeholder = 'Leave a remark…', style = {} }: CommentThreadProps) {
  const [draft, setDraft] = React.useState('');
  function submit() {
    const v = draft.trim();
    if (!v) return;
    onSubmit && onSubmit(v);
    setDraft('');
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {comments.map((c, i) => (
          <div key={c.id ?? i} style={{ display: 'flex', gap: 12 }}>
            <Avatar src={c.avatar} initials={c.initials || (c.author || '?').slice(0, 2).toUpperCase()} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-1)' }}>{c.author}</span>
                {c.role && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--accent-text)' }}>{c.role}</span>}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginLeft: 'auto' }}>{c.time}</span>
              </div>
              <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--text-2)' }}>{c.body}</p>
            </div>
          </div>
        ))}
      </div>
      {onSubmit && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} rows={2}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
            style={{
              flex: 1, fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', color: 'var(--text-1)',
              background: 'var(--surface-inset)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-well)', padding: '10px 12px', outline: 'none', resize: 'vertical',
            }} />
          <button type="button" onClick={submit}
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-sm)', cursor: 'pointer', padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'var(--accent-contrast)', border: '1px solid var(--accent)', whiteSpace: 'nowrap' }}>
            Post
          </button>
        </div>
      )}
    </div>
  );
}
