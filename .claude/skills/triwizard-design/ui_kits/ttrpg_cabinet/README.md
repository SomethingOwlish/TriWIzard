# UI Kit — TTRPG Cabinet (player + master)

The table-top surface: folklore horror × dark academia. Carries the extra TTRPG skins — `ttrpg-blue`, `ttrpg-violet`, `ttrpg-light` — switched live from the top bar.

**Screen** (`window.TtrpgCabinet.Table`): app shell with
- **PlayerCard** — portrait, `StatBlock` attributes, vitals bars (incl. Dread), known spells.
- **DiceView** — `DiceRoller` wired to a live roll log.
- **Graphs** — bespoke inline `BarChart` + `LineChart` (theme-aware SVG) for dread, rolls, standing.
- **Tables** — reference `DataTable`s (wild magic, party roster).
- **Chronicle** — player chronology via `Timeline`.
- **MasterScreen** (master mode) — initiative tracker + master's dice.

Theme defaults to `ttrpg-violet`; the switcher writes `data-theme` on `<html>`. Composes DS primitives from `window.TriWizardDesignSystem_a98f10`. Renders after `_ds_bundle.js` compiles.
