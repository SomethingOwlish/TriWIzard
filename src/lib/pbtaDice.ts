/**
 * PBtA dice engine (B3.3) — the Durmstrang ladder.
 *
 * Every roll is **2d6 + stat** (see docs/pbta-schema.md, "Как играть"). The
 * success bands are NOT standard Apocalypse World 6/7–9/10+ — they are the
 * bespoke ladder from the schema:
 *
 *   - Snake eyes (двойная единица): both dice natural 1. Catastrophic critical
 *     failure; modifiers cannot save you.
 *   - ≤ 6  : failure — unpleasant but not shameful.
 *   - 7–10 : success with consequences / a hard choice.
 *   - 11–16: full success, no negative consequences.
 *   - 17+  : brilliant; each 4 over 16 improves the outcome a further step.
 *
 * The schema writes the failure edge as "< 6" and the partial edge as "7–10",
 * leaving 6 unstated; we fold 6 into failure (the gap-free reading) so no total
 * is bandless. This module is pure — no Firestore, no React — so both the live
 * scene roller and the move catalog read the same authority.
 */
import type { StatKey } from './pbta';

export type Band = 'snake' | 'miss' | 'partial' | 'full' | 'brilliant';

export interface BandDef {
  band: Band;
  /** In-world label shown on the result. */
  label: string;
  ru: string;
  /** Badge tone (maps to the status/accent tokens). */
  tone: 'dead' | 'wounded' | 'ember' | 'alive' | 'accent';
  /** The band's reach on the ladder, for the legend. */
  range: string;
  blurb: string;
  /** Key into a move's outcome text. */
  outcomeKey: keyof MoveOutcomes;
}

export interface MoveOutcomes {
  snake?: string;
  miss?: string;
  partial?: string;
  full?: string;
  brilliant?: string;
}

export const BANDS: Record<Band, BandDef> = {
  snake: { band: 'snake', label: 'Snake eyes', ru: 'Глаза змеи', tone: 'dead', range: '⚀⚀', blurb: 'Both dice fall as ones. Catastrophic — no modifier can save you.', outcomeKey: 'snake' },
  miss: { band: 'miss', label: 'Failure', ru: 'Провал', tone: 'wounded', range: '≤ 6', blurb: 'Unpleasant, but not shameful. The trouble lands.', outcomeKey: 'miss' },
  partial: { band: 'partial', label: 'Success at a cost', ru: 'Успех с ценой', tone: 'ember', range: '7–10', blurb: 'It works, but with consequences or a hard choice.', outcomeKey: 'partial' },
  full: { band: 'full', label: 'Full success', ru: 'Полный успех', tone: 'alive', range: '11–16', blurb: 'Clean — no negative consequences.', outcomeKey: 'full' },
  brilliant: { band: 'brilliant', label: 'Brilliant', ru: 'Блистательно', tone: 'accent', range: '17+', blurb: 'Beyond clean. Each 4 over 16 sweetens the outcome again.', outcomeKey: 'brilliant' },
};

/** The bands in ladder order, for legends. */
export const BAND_ORDER: Band[] = ['snake', 'miss', 'partial', 'full', 'brilliant'];

function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Which band a total lands in. Snake eyes is decided by the *dice*, not the
 * total — natural 1+1 is catastrophic even if a modifier would lift the sum.
 */
export function bandOf(total: number, snake: boolean): Band {
  if (snake) return 'snake';
  if (total <= 6) return 'miss';
  if (total <= 10) return 'partial';
  if (total <= 16) return 'full';
  return 'brilliant';
}

export interface PbtaRoll {
  dice: [number, number];
  /** The summed modifier applied (stat + condition penalties + situational). */
  mod: number;
  total: number;
  band: Band;
  snake: boolean;
  /** For 17+ : how many full steps of brilliance (each 4 over 16). */
  steps: number;
}

/** Roll 2d6 + mod and place it on the ladder. */
export function rollPbta(mod: number): PbtaRoll {
  const a = d6();
  const b = d6();
  const snake = a === 1 && b === 1;
  const total = a + b + mod;
  return {
    dice: [a, b],
    mod,
    total,
    band: bandOf(total, snake),
    snake,
    steps: total >= 17 ? Math.floor((total - 16) / 4) : 0,
  };
}

export interface InitiativeRoll {
  dice: [number, number];
  total: number;
}

/** Initiative is a **bare 2d6** (Ход Конфликта) — only moves modify it. */
export function rollInitiative(): InitiativeRoll {
  const a = d6();
  const b = d6();
  return { dice: [a, b], total: a + b };
}

/** Render a signed modifier the way the table writes it. */
export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

/** A compact label like "2d6 +1 (Magic)" for the roll log. */
export function rollLabel(stat: StatKey | null, mod: number, statName?: string): string {
  const base = `2d6 ${signed(mod)}`;
  return stat && statName ? `${base} · ${statName}` : base;
}
