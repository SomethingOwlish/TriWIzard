/**
 * NPC dossier + connections data layer (B4.4) — the `npcs` collection and the
 * GM-only `npcGraph/edges` singleton.
 *
 * Each NPC is a SINGLE document (the user's choice — soft-hide): its published
 * `card` is the player-facing face (portrait, name, epithet, house, status,
 * description, tags), while `secret`, `stats`, and graph `pos` ride alongside as
 * GM-only operational fields. Firestore rules are doc-scoped on the free plan,
 * so a player who reads a published NPC *could* read the raw secret fields too —
 * the same trade-off accepted for hidden Scene NPC tokens in Tier 3. Players
 * never see the connections graph at all; it is a GM tool.
 *
 * Connections live in one GM-only document (`npcGraph/edges`) as a flat edge
 * list — cheap to read whole, and never exposed to players by the rules.
 */
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
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
import type { CharStatus, HouseId, StatKey } from './pbta';

const COLL = 'npcs';
const GRAPH_PATH = ['npcGraph', 'edges'] as const;
const SEALED = 'The bestiary is sealed — no firebase config is set.';

/** The player-facing NPC card (the published face). */
export interface NpcCard {
  name: string;
  ru: string;
  /** Epithet / title beneath the name (e.g. "the Drowned", "Headmistress"). */
  epithet: string;
  house: HouseId | '';
  faction: string;
  status: CharStatus;
  /** Public description shown to players (markdown). */
  description: string;
  tags: string[];
  portrait: string;
  portraitDeletehash: string;
}

export interface NpcEntry extends AuthoredDoc<NpcCard> {
  /** Behind the screen — GM notes never meant for players (soft-hidden). */
  secret: string;
  /** GM stat line, when the NPC is a roller; null when purely narrative. */
  stats: Record<StatKey, number> | null;
  /** Saved node position on the GM connections graph. */
  pos: { x: number; y: number };
}

export type NpcExtras = Pick<NpcEntry, 'secret' | 'stats' | 'pos'>;

export type EdgeTone = 'ally' | 'enemy' | 'neutral';

export interface NpcEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  tone: EdgeTone;
}

export function blankNpcCard(): NpcCard {
  return {
    name: '',
    ru: '',
    epithet: '',
    house: '',
    faction: '',
    status: 'alive',
    description: '',
    tags: [],
    portrait: '',
    portraitDeletehash: '',
  };
}

export function blankNpcExtras(): NpcExtras {
  return { secret: '', stats: null, pos: { x: 120, y: 120 } };
}

export async function fetchNpcs(gm: boolean): Promise<NpcEntry[]> {
  return (await fetchAuthored<NpcCard>(COLL, gm)) as NpcEntry[];
}

export function createNpc(
  card: NpcCard,
  extras: NpcExtras,
  uid?: string | null,
): Promise<string> {
  return createAuthored<NpcCard>(COLL, card, { ...extras }, uid);
}

export function saveNpcDraft(
  id: string,
  card: NpcCard,
  extras: NpcExtras,
  uid?: string | null,
): Promise<void> {
  return saveAuthoredDraft<NpcCard>(COLL, id, card, { ...extras }, uid);
}

export const publishNpc = (id: string) => publishAuthored<NpcCard>(COLL, id);
export const unpublishNpc = (id: string) => unpublishAuthored(COLL, id);
export const deleteNpc = (id: string) => deleteAuthored(COLL, id);
/** Persist a dragged node position (GM-only graph layout). */
export const setNpcPos = (id: string, pos: { x: number; y: number }) =>
  patchAuthored(COLL, id, { pos });

// ---- connections graph (GM-only singleton) ---------------------------------

export async function fetchEdges(): Promise<NpcEdge[]> {
  if (!isFirebaseConfigured) return [];
  const snap = await getDoc(doc(db, ...GRAPH_PATH));
  return snap.exists() ? ((snap.data().edges as NpcEdge[]) ?? []) : [];
}

export async function saveEdges(edges: NpcEdge[]): Promise<void> {
  if (!isFirebaseConfigured) throw new Error(SEALED);
  await setDoc(doc(db, ...GRAPH_PATH), { app: 'ttrpg', edges, updatedAt: serverTimestamp() });
}
