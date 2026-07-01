/**
 * Notion archive importer (Tier 4).
 *
 * One-shot GM action per knowledge module: pour the content lifted from the
 * public TriWizard Notion workspace into the live collections as **unpublished
 * drafts**, so the GM reviews and *provides* each entry deliberately (nothing is
 * shown to players by importing). The seed itself lives in `src/data/notion/*`
 * and is loaded lazily (dynamic `import`) so its ~250 KB never touches the
 * initial bundle — it is fetched only when a GM presses "Import the archive".
 *
 * Idempotency: each importer is handed the titles/names already present and
 * skips anything that matches, so a second press tops up rather than duplicates.
 *
 * PLAYERS ARE NEVER IMPORTED HERE. The Notion character table mixes players and
 * NPCs in one database; the crawler split them by the `Игрок` (player) field and
 * this importer only ever touches the 51 NPCs. The 20 player rows live in
 * `src/data/notion/players.ts` for the Tier-2 Characters module and are kept out
 * of the bestiary by construction.
 */
import { createLore, moveLore } from './lore';
import { createRule, blankRule } from './rulebook';
import { createNpc, blankNpcCard, blankNpcExtras } from './npcs';
import { type ChronEvent } from './chronology';
import { HOUSE_BY_ID } from './pbta';

export interface ImportResult {
  created: number;
  skipped: number;
}

const rid = () => Math.random().toString(36).slice(2, 9);
const norm = (s: string) => s.trim().toLowerCase();

/** Compose a short, player-safe identity line for an NPC card. */
function npcDescription(n: {
  house: string;
  nationality: string;
  blood: string;
  age: string;
  occupation: string;
}): string {
  const houseName = n.house && HOUSE_BY_ID[n.house as keyof typeof HOUSE_BY_ID]?.en;
  const age = n.age ? `${n.age}` : '';
  return [n.occupation, houseName, n.nationality, n.blood, age]
    .map((p) => (p || '').trim())
    .filter(Boolean)
    .join(' · ');
}

/** Lore — create the wiki tree, resolving `parentKey` → real ids in a second pass. */
export async function importLoreArchive(
  existingTitles: string[],
  uid?: string | null,
): Promise<ImportResult> {
  const { NOTION_LORE } = await import('../data/notion/lore');
  const have = new Set(existingTitles.map(norm));
  const keyToId = new Map<string, string>();
  let created = 0;
  let skipped = 0;

  // Pass 1: create every fresh node at the root (parent set in pass 2).
  for (const e of NOTION_LORE) {
    if (have.has(norm(e.title))) {
      skipped++;
      continue;
    }
    const id = await createLore(
      { title: e.title, body: e.body, image: e.image, imageDeletehash: '', tags: e.tags },
      null,
      uid,
    );
    keyToId.set(e.key, id);
    created++;
  }
  // Pass 2: re-parent nodes whose parent was also imported this run.
  let order = 0;
  for (const e of NOTION_LORE) {
    const id = keyToId.get(e.key);
    if (!id || !e.parentKey) continue;
    const parentId = keyToId.get(e.parentKey);
    if (parentId) await moveLore(id, parentId, order++);
  }
  return { created, skipped };
}

/** Rule helper — each Notion rules page becomes a markdown article. */
export async function importRulebookArchive(
  existingTitles: string[],
  uid?: string | null,
): Promise<ImportResult> {
  const { NOTION_RULES } = await import('../data/notion/rulebook');
  const have = new Set(existingTitles.map(norm));
  let created = 0;
  let skipped = 0;
  for (const r of NOTION_RULES) {
    if (have.has(norm(r.title))) {
      skipped++;
      continue;
    }
    const content = { ...blankRule('article'), title: r.title, section: r.section, body: r.body };
    await createRule(content, uid);
    created++;
  }
  return { created, skipped };
}

/**
 * World chronology — build a merged event list WITHOUT writing anything, so the
 * Chronicle editor can drop the Notion events into its working list and let the
 * GM review before saving/providing. Deduplicates by event title.
 */
export async function mergeWorldChronology(
  existingEvents: ChronEvent[],
): Promise<{ events: ChronEvent[]; created: number; skipped: number }> {
  const { NOTION_WORLD_EVENTS } = await import('../data/notion/chronology');
  const have = new Set(existingEvents.map((e) => norm(e.title)));
  const merged = [...existingEvents];
  let created = 0;
  let skipped = 0;
  for (const e of NOTION_WORLD_EVENTS) {
    if (have.has(norm(e.title))) {
      skipped++;
      continue;
    }
    merged.push({ id: rid(), time: e.time, title: e.title, body: e.body, tone: e.tone });
    created++;
  }
  merged.sort((a, b) => (a.time || '~').localeCompare(b.time || '~'));
  return { events: merged, created, skipped };
}

/**
 * Bestiary — create the 51 NPC dossiers (NEVER the players). The full Notion
 * page body goes into the GM-only `secret`; a short identity line becomes the
 * public card description.
 */
export async function importBestiaryArchive(
  existingNames: string[],
  uid?: string | null,
): Promise<ImportResult> {
  const { NOTION_NPCS } = await import('../data/notion/npcs');
  const have = new Set(existingNames.map(norm));
  let created = 0;
  let skipped = 0;
  for (const n of NOTION_NPCS) {
    if (have.has(norm(n.name))) {
      skipped++;
      continue;
    }
    const card = {
      ...blankNpcCard(),
      name: n.name,
      house: n.house,
      status: n.status,
      faction: n.occupation,
      description: npcDescription(n),
      tags: n.tags,
      portrait: n.portrait,
    };
    const extras = { ...blankNpcExtras(), secret: n.dossier };
    await createNpc(card, extras, uid);
    created++;
  }
  return { created, skipped };
}
