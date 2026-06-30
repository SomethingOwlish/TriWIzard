import React from 'react';

const DICE = [4, 6, 8, 10, 12, 20, 100];

function rollOnce(sides: number) { return Math.floor(Math.random() * sides) + 1; }

export interface RollResult {
  raw: number;
  total: number;
  sides: number;
}

export interface DiceRollerProps {
  defaultSides?: number;
  /** Flat modifier added to the raw roll. */
  modifier?: number;
  /** Die sizes to offer. */
  dice?: number[];
  onRoll?: (result: RollResult) => void;
  style?: React.CSSProperties;
}

/** DiceRoller — pick a die, roll, see the result with a brief tumble. */
export function DiceRoller({ defaultSides = 20, modifier = 0, dice = DICE, onRoll, style = {} }: DiceRollerProps) {
  const [sides, setSides] = React.useState(defaultSides);
  const [result, setResult] = React.useState<RollResult | null>(null);
  const [rolling, setRolling] = React.useState(false);
  const [face, setFace] = React.useState(defaultSides);

  function roll() {
    setRolling(true);
    let ticks = 0;
    const iv = setInterval(() => {
      setFace(rollOnce(sides));
      if (++ticks > 10) {
        clearInterval(iv);
        const r = rollOnce(sides);
        setFace(r);
        setResult({ raw: r, total: r + modifier, sides });
        setRolling(false);
        onRoll && onRoll({ raw: r, total: r + modifier, sides });
      }
    }, 55);
  }

  const crit = result && !rolling && (result.raw === sides ? 'high' : result.raw === 1 ? 'low' : null);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      background: 'var(--surface-card)', border: '1px solid var(--border-1)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-md)',
      ...style,
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {dice.map((d) => (
          <button key={d} type="button" onClick={() => setSides(d)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', cursor: 'pointer',
              padding: '5px 11px', borderRadius: 'var(--radius-sm)',
              border: '1px solid', borderColor: sides === d ? 'var(--accent)' : 'var(--border-2)',
              background: sides === d ? 'var(--accent-soft)' : 'var(--surface-raised)',
              color: sides === d ? 'var(--accent-text)' : 'var(--text-2)',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}>d{d}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 92, height: 92, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-inset)',
          border: `2px solid ${crit === 'high' ? 'var(--status-alive)' : crit === 'low' ? 'var(--status-dead)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: rolling ? 'none' : 'var(--shadow-well)',
          transform: rolling ? 'rotate(-4deg)' : 'none',
          transition: 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-black)', fontSize: 'var(--text-4xl)', color: crit === 'high' ? 'var(--status-alive)' : crit === 'low' ? 'var(--status-dead)' : 'var(--text-1)', lineHeight: 1 }}>
            {face}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="tw-eyebrow">{rolling ? 'Casting the bones…' : result ? `d${result.sides}${modifier ? (modifier > 0 ? ` + ${modifier}` : ` − ${Math.abs(modifier)}`) : ''}` : 'Awaiting the throw'}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-2xl)', color: 'var(--text-1)', lineHeight: 1.2 }}>
            {result && !rolling ? result.total : '—'}
          </div>
          {crit && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: crit === 'high' ? 'var(--status-alive)' : 'var(--status-dead)' }}>{crit === 'high' ? 'Critical' : 'Fumble'}</div>}
        </div>
      </div>

      <button type="button" onClick={roll} disabled={rolling}
        style={{
          fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-base)',
          letterSpacing: 'var(--tracking-wide)', cursor: rolling ? 'wait' : 'pointer',
          padding: '11px', borderRadius: 'var(--radius-sm)',
          background: 'var(--accent)', color: 'var(--accent-contrast)', border: '1px solid var(--accent)',
          opacity: rolling ? 0.7 : 1, transition: 'opacity var(--dur-fast)',
        }}>
        Roll d{sides}
      </button>
    </div>
  );
}
