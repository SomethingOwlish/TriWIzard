# TriWizard

> **Durmstrang LARP & TTRPG** — a Nordic dark-horror world where enrolment is survived, oaths are sworn at the threshold, and a ledger keeps every deed.

This repository is a runnable **React + Vite** application that implements the
TriWizard design system across its three product surfaces. It was built from the
Claude Design handoff bundle in [`project/`](./project) (the original HTML/CSS/JS
prototypes, design tokens, and component sources — kept intact as the canonical
design reference).

## The three surfaces

| Surface | Who | Themes |
|---|---|---|
| **Site** (`src/kits/LarpSite.jsx`) | Everyone, no login — hero, lore, the Rite, the Order | `dark`, `light` |
| **LARP cabinet** (`src/kits/LarpCabinet.jsx`) | Players & masters — roster, character sheet, assessment, comments, master tools | `dark`, `light` |
| **TTRPG table** (`src/kits/TtrpgTable.jsx`) | Players & masters — player card, dice tray, saga graphs, reference tables, chronicle, master screen | `ttrpg-blue`, `ttrpg-violet`, `ttrpg-light` |

Move between surfaces with the in-world buttons: **Enter the Cabinet** / **The
TTRPG table →** on the site, **To the Table →** in the LARP cabinet, **← To the
Field** in the TTRPG table, and the sidebar wordmark to return to the public site.
Each surface carries a **theme switcher**; the Site and LARP cabinet share one
folklore-academy skin, the TTRPG table keeps its own.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the production build
```

## Project layout

```
index.html              Vite entry
src/
  main.jsx              React mount
  App.jsx               three-surface shell + theme ownership
  styles/
    global.css          app reset; @imports the token closure
    tokens.css          design-system entry (@imports tokens/*)
    tokens/             colors, typography, spacing, effects, fonts (5 themes)
  components/            24 design-system primitives (core, forms, feedback,
    index.js            navigation, domain) + a re-export barrel
  kits/
    LarpSite.jsx        public site
    LarpCabinet.jsx     LARP player + master cabinet
    TtrpgTable.jsx      TTRPG player + master table
    icons.jsx           shared thin-stroke line icons
project/                original Claude Design handoff bundle (design reference)
  readme.md             full design guide — voice, visual foundations, iconography
  HANDOFF.md            the original "read this first" handoff note
```

The components are used as authored in the handoff — they read styling from CSS
custom properties only, so re-pointing `data-theme` on `<html>` re-skins the whole
app. See [`project/readme.md`](./project/readme.md) for the design guide (content
voice, color/type/spacing foundations, iconography).

## Notes & caveats

- **Fonts are Google Fonts substitutes** (Cinzel, Spectral, JetBrains Mono),
  loaded from the Google Fonts CDN via `src/styles/tokens/fonts.css`, with serif
  fallbacks (Georgia / Times New Roman) so the app degrades gracefully offline.
  This substitution is carried over from the design handoff — swap in licensed
  brand faces when available.
- **No brand logo or photography** was supplied; the wordmark is a typographic
  lockup and page shells use the stone-grain texture rather than imagery.
- Data on every screen is **illustrative sample content** — there is no backend;
  the cabinets are interactive recreations (roster filtering, master mode, tabs,
  dice rolling, comment posting, modals all work client-side).
