# UI Kit — LARP Cabinet (player + master)

The registered-player surface. Same folklore-academy skin as the site (`dark` / `light`). Data is stored and shown as **cards**; remarks (comments) live on the character sheet. A **Master mode** switch reveals extra tools.

**Screen** (`window.LarpCabinet.Cabinet`): a full app shell with
- **NavRail** — sidebar; gains *Player Manager* + *Text Manager* when master mode is on.
- **TopBar** — master-mode switch, theme switcher, and a "To the Table →" button (the LARP→TTRPG crossing).
- **Roster** — filterable grid of `CharacterCard`s.
- **Sheet** — character header, tabbed **Assessment** (many fields, stored as cards), **Remarks** (`CommentThread`), **Inventory** (`DataTable`).
- **PlayerManager** (master) — roster `DataTable`.
- **TextManager** (master) — lore clauses with an author `Dialog`.

Composes DS primitives from `window.TriWizardDesignSystem_a98f10`. Renders after `_ds_bundle.js` compiles.
