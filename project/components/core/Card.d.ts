import * as React from 'react';

/**
 * @startingPoint section="Core" subtitle="Content surface with header & accent edge" viewport="700x440"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Bold display title in the header. */
  title?: React.ReactNode;
  /** Rune-spaced kicker above the title. */
  eyebrow?: React.ReactNode;
  /** Right-aligned header controls (e.g. IconButtons). */
  actions?: React.ReactNode;
  /** Blood accent bar down the left edge. */
  accentEdge?: boolean;
  /** Lift + shadow on hover; cursor pointer. */
  interactive?: boolean;
  /** Body padding (CSS length). */
  padding?: string;
}

/**
 * Core content surface — TriWizard stores characters, lore and ledger
 * entries as cards.
 * @startingPoint section="Core" subtitle="Content surface with header & accent edge" viewport="700x260"
 */
export function Card(props: CardProps): JSX.Element;
