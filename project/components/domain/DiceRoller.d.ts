import * as React from 'react';

export interface RollResult {
  raw: number;
  total: number;
  sides: number;
}

/**
 * @startingPoint section="TTRPG" subtitle="Interactive die roller" viewport="700x520"
 */
export interface DiceRollerProps {
  defaultSides?: number;
  /** Flat modifier added to the raw roll. */
  modifier?: number;
  /** Die sizes to offer. */
  dice?: number[];
  onRoll?: (result: RollResult) => void;
  style?: React.CSSProperties;
}

/**
 * Interactive die roller with tumble animation and crit/fumble colouring.
 * @startingPoint section="TTRPG" subtitle="Interactive die roller" viewport="700x340"
 */
export function DiceRoller(props: DiceRollerProps): JSX.Element;
