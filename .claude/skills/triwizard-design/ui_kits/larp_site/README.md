# UI Kit — LARP Public Site

The open, no-login marketing & lore surface. Dark Scandinavian academy with a folklore feel; only the `dark` and `light` skins (blood accent).

**Screens** (`window.LarpSite`):
- `Header` / `Footer` — sticky wordmark nav with theme switcher (writes `data-theme` on `<html>`).
- `Landing` — hero, three pillars, "two sides" split.
- `RulesPage` — long-form rite reading view with sticky clause nav and a 68ch prose column.
- `OrderPage` — masters of the keep grid.

`index.html` mounts an `App` that switches pages from the header nav. Composes DS primitives (`Button`, `Card`, `Badge`, `Tag`, `Avatar`, `ThemeSwitcher`) from `window.TriWizardDesignSystem_a98f10`.

Renders only after the design-system bundle (`_ds_bundle.js`) has compiled.
