# TriWizard — guide for AI-assisted development

Vite + React app implementing the **TriWizard design system** (Nordic dark-horror,
folklore-academy). Durmstrang LARP & TTRPG. Always build new modules *with* this
system — never re-implement primitives or hardcode styling.

## Where things live
- `src/styles/tokens/` — design tokens (colors, typography, spacing, effects, fonts).
  5 themes: `dark`, `light`, `ttrpg-blue`, `ttrpg-violet`, `ttrpg-light`.
- `src/components/` — reusable primitives. Import from the barrel: `../components`.
- `src/kits/` — full screens (LarpSite, LarpCabinet, TtrpgTable). New screens go here.
- `src/kits/icons.jsx` — thin-stroke line icons + the `Ico` factory. Reuse these.
- `src/App.jsx` — three-surface shell + theme ownership.

## Hard rules
1. **Reuse primitives.** Compose `Button, IconButton, Card, Badge, Tag, Avatar,
   Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Tabs, Dialog,
   Toast, Tooltip, CharacterCard, StatBlock, DiceRoller, DataTable, CommentThread,
   Timeline, ThemeSwitcher`. Never rebuild a Button/Card by hand.
2. **Style only via CSS custom properties** — `var(--surface-card)`, `var(--text-1)`,
   `var(--accent)`, etc. NO hardcoded hex colors, NO CSS-in-JS libraries, NO new
   styling npm deps. Inline styles + the `.tw-*` utility classes only.
3. **Theme-aware always.** Use semantic tokens so all 5 skins work; never assume
   "dark". The active theme is `data-theme` on `<html>`. Verify in `dark` + `light`.
4. **Visual language:** tight radii (`--radius-xs..lg`, 2–8px), hairline borders
   (`--border-1/2`), deep cold shadows (`--shadow-md/lg/well`), slow weighty motion
   (`--dur-fast/base/slow`, `--ease-out`), NO bounce, NO purple gradients, NO emoji.
5. **Voice:** solemn, second-person, folkloric. Prefer *oath, ledger, chronicle,
   cohort, rite, hall, master, fallen* over *account, log, feed, level, admin*.
   In-world even for errors ("An oath is required."). Never "Oops!", never confetti.

## Adding things
- **New primitive** → `src/components/<group>/<Name>.jsx`, `export function <Name>`,
  `import React from 'react'`, props with sensible defaults, inline styles reading
  tokens. Then add it to `src/components/index.js`. Match the style of existing files.
- **New screen/module** → `src/kits/<Name>.jsx`, compose primitives, theme via props.
- Before finishing: run `npm run build` and confirm it passes.

## Most-used tokens (cheat-sheet)
Surfaces: `--surface-page/sunken/card/raised/inset`
Text: `--text-1` (primary) `--text-2` (secondary) `--text-3` (muted)
Accent: `--accent`, `--accent-text` (legible accent), `--accent-soft`, `--accent-2` (ember)
Lines: `--border-1` (hairline) `--border-2` `--border-strong`
Status: `--status-alive` `--status-wounded` `--status-dead`
Type: `--font-display` (Cinzel) `--font-serif` (Spectral/body+UI) `--font-mono` (data/labels)
Utility classes: `.tw-card .tw-eyebrow .tw-display .tw-body .tw-data .tw-stone-wash`