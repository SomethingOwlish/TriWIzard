/**
 * Lore library data layer (B4.1) — the `lore` collection.
 *
 * The GM keeps a wiki-style tree of lore: each entry is a node with a
 * `parentId`, so the reader navigates folders and sub-pages. An entry's content
 * is markdown-bearing (headings, emphasis, lists), may carry a cover image, and
 * may reference other entries via `[[Title]]` cross-links resolved at render.
 *
 * Authored content follows save → publish (see `authored.ts`): the GM edits a
 * draft and *provides* it to the table by publishing. Players read only
 * published entries; the tree position (`parentId`) is structural, not part of
 * the published payload.
 */
import {
  type AuthoredDoc,
  createAuthored,
  deleteAuthored,
  fetchAuthored,
  patchAuthored,
  publishAuthored,
  saveAuthoredDraft,
  unpublishAuthored,
} from './authored';

const COLL = 'lore';

export interface LoreContent {
  title: string;
  /** Markdown body — headings, emphasis, lists, links, and [[cross-links]]. */
  body: string;
  /** Cover image URL (Imgur or pasted). Empty when none. */
  image: string;
  /** Imgur delete token, when the image was uploaded here. */
  imageDeletehash: string;
  tags: string[];
}

export interface LoreEntry extends AuthoredDoc<LoreContent> {
  /** Parent node id, or null for a root entry. */
  parentId: string | null;
}

export function blankLore(): LoreContent {
  return { title: '', body: '', image: '', imageDeletehash: '', tags: [] };
}

export async function fetchLore(gm: boolean): Promise<LoreEntry[]> {
  return (await fetchAuthored<LoreContent>(COLL, gm)) as LoreEntry[];
}

export function createLore(
  content: LoreContent,
  parentId: string | null,
  uid?: string | null,
): Promise<string> {
  return createAuthored<LoreContent>(COLL, content, { parentId }, uid);
}

export function saveLoreDraft(
  id: string,
  content: LoreContent,
  parentId: string | null,
  uid?: string | null,
): Promise<void> {
  return saveAuthoredDraft<LoreContent>(COLL, id, content, { parentId }, uid);
}

export const publishLore = (id: string) => publishAuthored<LoreContent>(COLL, id);
export const unpublishLore = (id: string) => unpublishAuthored(COLL, id);
export const deleteLore = (id: string) => deleteAuthored(COLL, id);
/** Re-parent / reorder a node without touching its content. */
export const moveLore = (id: string, parentId: string | null, order: number) =>
  patchAuthored(COLL, id, { parentId, order });

/** The display title for an entry — the published title for players, draft for the GM. */
export function loreTitle(e: LoreEntry, gm: boolean): string {
  const c = gm ? e.draft : e.published;
  return (c?.title || '').trim() || 'Untitled';
}
