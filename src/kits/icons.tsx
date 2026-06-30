import React from 'react';

/* Thin-stroke, Lucide-like line icons drawn inline so the kits carry no
   external icon dependency. Stroke width 1.6 to match the design system. */
interface IcoProps extends React.SVGProps<SVGSVGElement> {
  s?: number;
  children?: React.ReactNode;
}

export const Ico = (p: IcoProps) =>
  React.createElement(
    'svg',
    {
      width: p.s || 18,
      height: p.s || 18,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: p.style,
    },
    p.children
  );

type IconProps = Omit<IcoProps, 'children'>;

export const Anchor = (p: IconProps) => <Ico {...p}><circle cx="12" cy="5" r="2.5" /><path d="M12 22V8M5 12H2a10 10 0 0020 0h-3" /></Ico>;
export const Scroll = (p: IconProps) => <Ico {...p}><path d="M8 3h9a2 2 0 012 2v12M8 3a2 2 0 00-2 2v12a2 2 0 01-2 2h12a2 2 0 002-2M8 3v0" /><path d="M9 8h7M9 12h7" /></Ico>;
export const Compass = (p: IconProps) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z" /></Ico>;
export const Shield = (p: IconProps) => <Ico {...p}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></Ico>;
export const Users = (p: IconProps) => <Ico {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 6a3 3 0 010 6M21 20c0-2.4-1.4-4-3.5-4.6" /></Ico>;
export const Edit = (p: IconProps) => <Ico {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></Ico>;
export const Plus = (p: IconProps) => <Ico {...p}><path d="M12 5v14M5 12h14" /></Ico>;
export const Dice = (p: IconProps) => <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.2" fill="currentColor" /><circle cx="16" cy="16" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></Ico>;
export const Chart = (p: IconProps) => <Ico {...p}><path d="M3 3v18h18" /><path d="M7 14l3-3 3 2 4-6" /></Ico>;
export const Grid = (p: IconProps) => <Ico {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Ico>;
export const Clock = (p: IconProps) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ico>;
export const CardGlyph = (p: IconProps) => <Ico {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h6" /></Ico>;
export const Masks = (p: IconProps) => <Ico {...p}><path d="M3 5c0-1 1-1.5 4-1.5S11 4 11 5v4a4 4 0 01-8 0z" /><path d="M5.5 7h.01M8.5 7h.01M5.5 9.5c.6.6 1.9.6 2.5 0" /><path d="M13 9c0-1 1-1.5 4-1.5S21 8 21 9v4a4 4 0 01-8 0z" /><path d="M15.5 11h.01M18.5 11h.01M15.5 14c.6-.6 1.9-.6 2.5 0" /></Ico>;
export const Bolt = (p: IconProps) => <Ico {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></Ico>;
