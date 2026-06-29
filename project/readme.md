# TriWizard — Design System

> Durmstrang LARP & TTRPG. A Nordic dark-horror world where enrolment is survived, oaths are sworn at the threshold, and a ledger keeps every deed. This system dresses a three-part product: a public **Site**, a **LARP** cabinet (player + master), and a **TTRPG** cabinet (player + master).

**No brand assets, codebase, or Figma were supplied** — this system was authored from the written style brief. All fonts are Google Fonts substitutions (see *Visual Foundations → Type*) and the wordmark is a typographic lockup, not a supplied logo. Both are flagged for replacement. If you have real fonts / a logo / reference screens, attach them and I'll swap them in.

---

## The three surfaces

| Surface | Who | Feel | Themes available |
|---|---|---|---|
| **Site** (open) | Everyone, no login | Dark Scandinavian academy with folklore | `dark`, `light` (blood accent) |
| **LARP cabinet** | Registered players & masters | Same as site — folklore academy, stored as cards, comments everywhere | `dark`, `light` |
| **TTRPG cabinet** | Players & masters | Folklore horror × dark academia — dice, graphs, tables, chronologies | `ttrpg-blue`, `ttrpg-violet`, `ttrpg-light` |

A player's profile carries a **theme switcher** and a button to cross from the LARP side to the TTRPG side. Both LARP and TTRPG have a **master** view that exposes extra elements (player manager, text manager, graphs, tables, modals).

---

## CONTENT FUNDAMENTALS — how TriWizard speaks

The voice is **solemn, second-person, and folkloric**, as though the institution itself is addressing you. It treats play with gravity — this is a keep that keeps records, not an app that sends confetti.

- **Person.** Address the reader as *you*; the institution is *the keep / the school / the chronicle / we*. "You arrive by sea, alone."
- **Register.** Archaic-leaning but readable. Prefer *oath, ledger, chronicle, cohort, rite, hall, master, fallen* over *account, log, feed, group, level, admin, deleted*.
- **Casing.** Display headings in Cinzel small/all-caps for the carved-stone register. UI labels and meta in **uppercase mono with wide tracking** (rune-spacing). Body in sentence case.
- **Tone in system messages.** Even errors and confirmations stay in-world and grave: "An oath is required." / "The chronicle remembers them." Never "Oops!", never exclamation-confetti.
- **No emoji.** Ever. The closest the brand comes to an icon-glyph is a rune (ᛏ ᛁ ᛜ) or a thin-line symbol.
- **Numbers & data** are spoken plainly and precisely — Roman numerals for years/cohorts where it suits the chronicle ("Year IV", "Cohort MMXXVI-B"), tabular figures elsewhere.

Examples — see the **Brand → Voice** specimen card for an in/out-of-voice side-by-side.

---

## VISUAL FOUNDATIONS

The world is **cold cut stone, old vellum, and blood**. Everything reads as carved and recorded rather than soft and animated.

### Color
- **Two anchors everywhere:** cold near-black **stone** (dark theme) and warm **bone/parchment** (light theme). The site and LARP use *only* these two skins.
- **Blood is the one accent** for site + LARP — a deep oxblood (`--blood-500 #9B1C1C`), brightening to `--blood-300` for text-legible accents on dark. Used sparingly: primary buttons, active states, accent edges, focus rings.
- **Ember** (aged brass / candlelight, `--ember-400`) is a quiet secondary — rune highlights, master/faction outlines.
- **TTRPG adds two more skins:** `ttrpg-blue` (drowned cold blue) and `ttrpg-violet` (folklore violet), plus a full `ttrpg-light`. The accent swaps with the skin; structure stays identical.
- **Status** is a small triad: moss (alive), rust (wounded), crow (dead).
- **Large display text may go colourful/bright**; running UI stays restrained (per brief: "only large text part must be colourful").
- See `tokens/colors.css`. Semantic tokens (`--surface-card`, `--text-1`, `--accent`, `--border-2`…) are what components read; themes only re-point those.

### Type
- **Cinzel** — monumental carved-stone display. Hero + section heads + card titles. *(Google Fonts substitute.)*
- **Spectral** — screen-optimised serif for all running text and most UI. Dark-academia warmth, legible on stone. *(Substitute.)*
- **JetBrains Mono** — ledgers, dice results, codes, and **rune-spaced uppercase labels/eyebrows** (tracking up to 0.28em). *(Substitute.)*
- Scale is a 1.250 major third, base 16px. Tokens in `tokens/typography.css`.

### Space, shape, depth
- **8px rhythm** with a couple of fractional steps for dense ledger UI (`tokens/spacing.css`).
- **Corners are cut, not moulded** — radii stay tight (2–8px; 12px max). Stone doesn't have soft material rounding.
- **Borders are hairlines** (1px) in a stone-grey ramp; 2px only for emphasis (active dice, primary outlines).
- **Shadows are deep, cold and downward** — recesses, not floating Material elevation. Inputs and ledger wells use an **inset "well" shadow** (`--shadow-well`); cards use a low ambient `--shadow-md`, lifting to `--shadow-lg` on hover.

### Backgrounds & texture
- Page shells use a faint **stone-grain wash** + a low radial bloom of accent at the top (`.tw-stone-wash`). No photographic hero imagery is bundled (none supplied) — use `image-slot` / placeholders for real photography.
- **No gradients as decoration** beyond the subtle accent bloom. No glassmorphism except a faint 2px blur behind the modal scrim.

### Motion
- **Slow, weighty, no bounce.** `--ease-out` / `--ease-in-out` are heavy curves; durations 120/220/420ms. Fades and short rises (10px) for overlays; a brief tumble for dice. Decorative infinite loops are avoided.

### States
- **Hover:** primary → brighter blood; surfaces → one step lighter + stronger border; cards lift 2px.
- **Press:** translateY(1px) + darker accent. No scale-down.
- **Focus:** 3px soft accent ring (`--focus-ring`) on an accent border.
- **Disabled:** ~45% opacity, not-allowed.

---

## ICONOGRAPHY

No icon assets were supplied. The system uses **[Lucide](https://lucide.dev)** (thin 1.5–1.6px stroke, rounded caps) as the substitute set — its quiet, engraved-line quality suits the folklore-academy feel. *Flagged substitution; swap for a brand set if one exists.*

- **In components:** icons are passed in as `ReactNode` (e.g. `Button iconStart`, `IconButton` children) so the library stays icon-agnostic — load Lucide from CDN in screens/cards.
- **Inline glyphs** (chevrons, ticks, ×, close, dice pips) are drawn as tiny inline SVG inside the relevant component so primitives have no external dependency.
- **Runes** (Elder Futhark, e.g. ᛏ ᛁ ᛜ ᛟ ᚦ) are used decoratively in the wordmark and as section sigils — typographic, not images.
- **No emoji**, ever.
- Lucide CDN: `https://unpkg.com/lucide-static` (SVGs) or `lucide@latest` ESM. Stroke width 1.5–1.6 to match components.

---

## INDEX — what's in this folder

**Foundations**
- `styles.css` — the single entry point consumers link (just `@import`s).
- `tokens/` — `fonts.css`, `colors.css` (5 themes), `typography.css`, `spacing.css`, `effects.css`.
- `guidelines/*.card.html` — 18 foundation specimen cards (Type, Colors, Spacing, Brand).

**Components** (`window.TriWizardDesignSystem_a98f10.*`)
- `components/core/` — Button, IconButton, Card, Badge, Tag, Avatar, ThemeSwitcher
- `components/forms/` — Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch
- `components/feedback/` — Dialog, Toast, Tooltip
- `components/navigation/` — Tabs
- `components/domain/` — CharacterCard, StatBlock, DiceRoller, DataTable, CommentThread, Timeline

**UI kits** (full-screen recreations)
- `ui_kits/larp_site/` — public site
- `ui_kits/larp_cabinet/` — player & master cabinet
- `ui_kits/ttrpg_cabinet/` — player card, dice, graphs, tables, master view

**Other**
- `SKILL.md` — Agent-Skill front matter for download/use in Claude Code.

> The compiler generates `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — never edit those by hand. Cards/kits that load the bundle render only after the first compile (end of turn).
