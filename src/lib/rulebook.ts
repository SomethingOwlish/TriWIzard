/**
 * Rule Helper data layer (B4.3) — the `rulebook` collection.
 *
 * A standalone GM-authored rules reference, distinct from the Tier-3 Moves
 * catalogue. Two kinds of entry:
 *   - `article` — a titled markdown rule passage (the dice ladder explained,
 *     how conditions work, the galleon economy…).
 *   - `table`   — an editable reference table (columns + rows) rendered through
 *     the DataTable primitive (wild-magic d20, harm tracks, costs…).
 *
 * Same save → publish model as the other knowledge modules (see `authored.ts`).
 */
import {
  type AuthoredDoc,
  createAuthored,
  deleteAuthored,
  fetchAuthored,
  publishAuthored,
  saveAuthoredDraft,
  unpublishAuthored,
} from './authored';

const COLL = 'rulebook';

export type RuleKind = 'article' | 'table';

export interface RuleColumn {
  /** Stable key used as the row map key. */
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
}

export interface RuleContent {
  kind: RuleKind;
  title: string;
  /** Section heading the entry files under (e.g. "Core", "Magic", "Tables"). */
  section: string;
  /** Article body (markdown). Empty for tables. */
  body: string;
  /** Table columns. Empty for articles. */
  columns: RuleColumn[];
  /** Table rows — each a map of columnKey → cell text. */
  rows: Record<string, string>[];
  /** Optional caption shown under a table. */
  caption: string;
}

export type RuleEntry = AuthoredDoc<RuleContent>;

export function blankRule(kind: RuleKind): RuleContent {
  return kind === 'table'
    ? {
        kind,
        title: '',
        section: 'Tables',
        body: '',
        columns: [
          { key: 'c1', label: 'Roll', mono: true, align: 'right' },
          { key: 'c2', label: 'Effect' },
        ],
        rows: [{ c1: '', c2: '' }],
        caption: '',
      }
    : { kind, title: '', section: 'Core', body: '', columns: [], rows: [], caption: '' };
}

export async function fetchRules(gm: boolean): Promise<RuleEntry[]> {
  return fetchAuthored<RuleContent>(COLL, gm);
}

export function createRule(content: RuleContent, uid?: string | null): Promise<string> {
  return createAuthored<RuleContent>(COLL, content, {}, uid);
}

export function saveRuleDraft(
  id: string,
  content: RuleContent,
  uid?: string | null,
): Promise<void> {
  return saveAuthoredDraft<RuleContent>(COLL, id, content, {}, uid);
}

export const publishRule = (id: string) => publishAuthored<RuleContent>(COLL, id);
export const unpublishRule = (id: string) => unpublishAuthored(COLL, id);
export const deleteRule = (id: string) => deleteAuthored(COLL, id);
