/* AUTO-GENERATED from the public TriWizard Notion workspace.
   Source: https://flicker-zipper-4ae.notion.site/TriWizard-2c0fc7e24caf81718f0beb0490028f9f
   Portraits/covers are Notion public image links (re-signed by the proxy), not copies.
   Do not hand-edit — regenerate from the crawler if the Notion source changes. */

import type { HouseId, CharStatus } from '../../lib/pbta';

/** A lore page in the wiki tree; `parentKey` references another seed's `key`. */
export interface LoreSeed {
  key: string;
  parentKey: string | null;
  title: string;
  body: string;
  image: string;
  tags: string[];
}

/** A rule-helper article (markdown), grouped by section. */
export interface RuleSeed {
  title: string;
  section: string;
  body: string;
}

/** A world-chronology event. */
export interface ChronSeed {
  time: string;
  title: string;
  body: string;
  tone: 'neutral' | 'accent' | 'alive' | 'dead';
}

/** An NPC dossier. The whole Notion page body rides in `dossier` (GM-only secret);
 *  a short public identity line is composed at import time. */
export interface NpcSeed {
  name: string;
  house: HouseId | '';
  status: CharStatus;
  nationality: string;
  blood: string;
  age: string;
  occupation: string;
  tags: string[];
  portrait: string;
  dossier: string;
}

/** A PLAYER character — deliberately kept OUT of the bestiary. These belong to the
 *  Tier-2 Characters module (owned PBtA cards) and are never seeded as NPCs. */
export interface PlayerSeed {
  name: string;
  player: string;
  house: HouseId | '';
  status: CharStatus;
  nationality: string;
  blood: string;
  age: string;
  mode: string;
  tags: string[];
  portrait: string;
  notes: string;
}
