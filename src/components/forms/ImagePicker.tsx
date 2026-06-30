import React from 'react';
import { Button } from '../core/Button';
import { Input } from './Input';
import { uploadImage, deleteImage, imgurConfigured, ImgurError } from '../../lib/imgur';

/**
 * ImagePicker — choose an image either by uploading to Imgur or by pasting a
 * URL (the two paths the table agreed on). It reads the existing `src/lib/imgur`
 * adapter, stores `{ url, deletehash }` (the deletehash lets an uploaded image
 * be revoked later), and shows a small preview. Theme-aware, token-styled.
 */
export interface ImagePickerValue {
  url: string;
  deletehash: string;
}

export interface ImagePickerProps {
  value: ImagePickerValue;
  onChange: (v: ImagePickerValue) => void;
  /** Preview box height in px. */
  height?: number;
  style?: React.CSSProperties;
}

const note: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
  letterSpacing: '0.14em', color: 'var(--text-3)',
};

export function ImagePicker({ value, onChange, height = 132, style = {} }: ImagePickerProps) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const canUpload = imgurConfigured();

  async function pick(file: File) {
    setBusy(true); setErr(null);
    try {
      const up = await uploadImage(file);
      onChange({ url: up.url, deletehash: up.deletehash });
    } catch (e) {
      setErr(e instanceof ImgurError ? e.message : 'The likeness would not take.');
    } finally { setBusy(false); }
  }

  async function clear() {
    if (value.deletehash) { try { await deleteImage(value.deletehash); } catch { /* best effort */ } }
    onChange({ url: '', deletehash: '' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      <div
        style={{
          height, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-1)',
          background: value.url ? `center / cover no-repeat url(${value.url})` : 'var(--surface-inset)',
          boxShadow: 'var(--shadow-well)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {!value.url && <span style={note}>No likeness</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={fileRef} type="file" accept="image/*" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ''; }}
        />
        <Button
          type="button" size="sm" variant="secondary" loading={busy}
          disabled={!canUpload} onClick={() => fileRef.current?.click()}
        >
          Upload
        </Button>
        {value.url && <Button type="button" size="sm" variant="ghost" onClick={clear}>Remove</Button>}
        <Input
          size="sm" placeholder="…or paste an image URL" value={value.url}
          onChange={(e) => onChange({ url: e.target.value, deletehash: '' })}
          style={{ flex: 1, minWidth: 160 }}
        />
      </div>
      {!canUpload && <span style={note}>Imgur unset — paste a URL.</span>}
      {err && <span style={{ ...note, color: 'var(--status-dead)' }}>{err}</span>}
    </div>
  );
}
