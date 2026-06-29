---
name: triwizard-design
description: Use this skill to generate well-branded interfaces and assets for TriWizard (Durmstrang LARP & TTRPG), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, themes, assets, and UI kit components for prototyping a Nordic dark-horror / folklore-academy product.
user-invocable: true
---

Read `readme.md` in this skill for the full design guide (content voice, visual foundations, iconography, theme model), then explore the other files.

**Foundations**
- `styles.css` — single entry point; link this one file.
- `tokens/` — `colors.css` (five themes: `dark`, `light`, `ttrpg-blue`, `ttrpg-violet`, `ttrpg-light`), `typography.css`, `spacing.css`, `effects.css`, `fonts.css`.
- Apply a theme by setting `data-theme="…"` on a wrapper / `<html>`. Components read semantic tokens (`--surface-card`, `--text-1`, `--accent`, `--border-2`, …) that each theme re-points.

**Components** — React, in `components/**`. Named exports (`Button`, `Card`, `CharacterCard`, `DiceRoller`, `DataTable`, `Timeline`, `ThemeSwitcher`, …). Each has a `.d.ts` and a `@dsCard` demo HTML.

**UI kits** — `ui_kits/{larp_site,larp_cabinet,ttrpg_cabinet}/` are full-screen recreations; read each `README.md`.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy the assets/tokens out and produce static HTML files for the user to view. If working on production code, copy assets and read the rules here to design as an expert in this brand.

If the user invokes this skill without other guidance, ask what they want to build, ask a few questions, then act as an expert designer who outputs HTML artifacts **or** production code, depending on the need.

**Voice reminder:** solemn, second-person, folkloric. Oath / ledger / chronicle / cohort / master / fallen. No emoji, no confetti. Cold stone, bone, and blood.

> Note: fonts (Cinzel / Spectral / JetBrains Mono) and the Lucide icon set are Google-Fonts / CDN substitutes — no brand assets were supplied. Replace if licensed brand faces or a logo exist.
