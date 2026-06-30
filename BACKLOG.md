# TriWizard — Implementation Backlog

> Single source of truth for build planning. One **Tier** = one implementation chat session.
> Each Tier contains **Batches** = independently shippable features.
> At the **start of every Tier session**, write a detailed station plan (data model, components, rules) before coding.

_Last updated: 2026-06-29 (planning)._

---

## 1. Product Overview

A community site for a LARP + TTRPG group, with three surfaces:

1. **Open Site** — public pages (main, rules, lore, org info, character list, Telegram link, cabinet entry).
2. **LARP Cabinet** — 3 permission tiers (Player / Master / Admin).
3. **TTRPG Cabinet** — 3 permission tiers (Player / GM / Admin).

A single user account can hold **different roles in LARP vs TTRPG**. Admin can **switch roles without re-login**.

**Interaction model:** everything is **save → publish** (no live editing) **except the Scene module**, which is live.

---

## 2. Architecture & Free-Tier Constraints

| Layer | Choice | Free-tier note |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript SPA | — |
| Styling | Tailwind CSS | — |
| Routing | `HashRouter` (GitHub Pages friendly) | avoids 404 on deep links |
| State | Zustand stores per domain | — |
| Data | **Firebase Firestore** | Spark: 50K reads/day, 20K writes/day, 1 GB stored |
| Auth | **Firebase Auth** — Google + Email/Password | Spark: free (NO phone auth — needs Blaze) |
| Images | **Imgur API** (anonymous Client-ID) | ~1,250 uploads/day, 12,500 req/day |
| Hosting | **GitHub Pages** via GitHub Actions | static, 100 GB/mo soft bandwidth |

### Hard constraints to stay free
- **NO Cloud Functions / Admin SDK.** They require the paid Blaze plan. All authorization is enforced by **Firestore Security Rules + client-side guards**.
- **Roles live in Firestore documents, not Auth custom claims** (custom claims need Admin SDK).
- **Minimize reads/writes:** save→publish flow, pagination, cache published docs, only the Scene module uses realtime `onSnapshot`.
- **One Firebase project** for both cabinets. Split into two projects later only if quotas bite (cross-links already use shared accounts, so a split stays compatible).

### Permission model (rules-based, free)
- `users/{uid}` — profile + global flags (`isAdmin`).
- `roles/{roleId}` — `{ app: 'larp'|'ttrpg', type: 'player'|'master'|'admin', uid, email, status, ...context }`. Master/GM creates these and links them to existing player accounts.
- Security Rules read `roles` + ownership to gate every collection.
- **Admin role-switch** = client-side "view as": admin's rules already permit everything, so the UI simulates any role with no re-auth.

---

## 3. Required Inputs / Secrets (gather before the relevant Tier)

| Input | Needed by | Status |
|---|---|---|
| **Design doc** (Claude Design — visuals, components, data fields) | T0.5 onward | ⏳ user will paste |
| Firebase project config (apiKey, projectId, …) | T0 (B0.2) | ⏳ |
| Imgur Client-ID | T0 (B0.3) | ⏳ |
| **Notion PBtA content** (public) — character/move/playbook schema | T2 | ⏳ user to provide URL |
| Telegram chat URL | T8 | ⏳ |
| Org info content | T8 | ⏳ |

> Secrets go in `.env` (gitignored) + GitHub Actions secrets. `.env.example` documents the shape. Firebase web config is public by design — security comes from Rules, not key secrecy.

---

## 4. Tier / Batch Breakdown

Build order: **Foundation → TTRPG → LARP → Site → Hardening.**

### TIER 0 — Project Foundation & Deploy
- [x] **B0.1** Scaffold: Vite + React + **TS** (full migration of design system to `.tsx`), folder structure, `HashRouter` shell. _Styling stays CSS-variable/inline per CLAUDE.md — no Tailwind. Lint/format deferred._
- [x] **B0.2** Firebase init: Firestore + Auth clients (`src/lib/firebase.ts`), env config via Vite vars, `.env` + `.env.example`. _Live config provided._
- [x] **B0.3** Imgur adapter (`src/lib/imgur.ts`): anonymous upload (URL + deletehash), delete, rate-limit/error handling. _Awaiting real `VITE_IMGUR_CLIENT_ID`; placeholder until set._
- [x] **B0.4** Deploy: GitHub Actions → Pages (`.github/workflows/deploy.yml`), Vite `base = /TriWizard/`, SPA `404.html` fallback. _Not yet run; needs Pages enabled + Actions secrets._
- [x] **B0.5** Design-system primitives: already delivered in the design handoff (24 primitives, tokens, 3-surface shell). Re-verified, now TypeScript.

### TIER 1 — Identity, Roles & Permissions Core
- [x] **B1.1** Auth UI: login/register (Google + Email/Password), logout, `users/{uid}` bootstrap. _`src/lib/auth.ts` + `src/lib/users.ts`; `AuthGate` (enter/enrol/recover) + `VerifyNotice`. Extras: password reset, email-verification gate, display-name on enrol, in-world error voice._
- [x] **B1.2** Role model + data layer (`roles` collection: app/type/status/links). _`src/lib/roles.ts` + `src/lib/types.ts`. Deterministic ids `${app}__${uid}` (one grant per hall per account) so Security Rules can `get` standing directly._
- [x] **B1.3** Firestore Security Rules v1 (per-app role gating, ownership checks). _`firestore.rules` + `firebase.json` + `firestore.indexes.json`. Self-profile w/ no self-admin; role reads by owner/master/admin; master may not mint admins; default-deny on all other collections._
- [x] **B1.4** Cabinet selector screen + per-app/per-role route guards. _`App.tsx` → HashRouter routes; `kits/auth/guards.tsx` (`RequireAuth`/`RequireVerified`/`RequireRole` + `Denied`/`HallLoading`); `kits/CabinetSelector.tsx`._
- [x] **B1.5** Admin role-switch ("view as", no re-login) infrastructure. _`viewAs` in `sessionStore`; `effectiveRole`/`canEnter` selectors honour it; `kits/auth/RoleSwitcher.tsx` overlay on cabinet routes._
- [x] **B1.6** Save/publish primitive (draft vs published doc states) shared util. _`src/lib/publish.ts`: `saveDraft`/`publishDoc`/`revertDraft`/`readPublishable`, `state` ∈ draft|published|dirty._

> **T1 notes (2026-06-30).** State via **zustand** (`src/stores/sessionStore.ts`, wired by `useSessionInit`). No live Firebase secrets in this clone (`.env` is gitignored) — every lib guards on `isFirebaseConfigured`, so build/render works credential-less and shows an in-world "hall is sealed" notice; fill `.env` to go live. Theme is now remembered per surface (localStorage + profile mirror). Build + typecheck green.

### TIER 2 — TTRPG Player Core: Character Card (PBtA)
> Schema sourced from the public Notion PBtA content → `docs/pbta-schema.md` (custom
> Durmstrang PBtA derivative: 6 stats, 5 rune-Houses, conditions-as-harm, non-standard
> dice ladder, Hope/XP/galleon economy).
- [x] **B2.1** PBtA card data model — `src/lib/pbta.ts` (stats, Houses, conditions, moves, advancement costs, per-field `editableBy` descriptors) + `src/lib/characters.ts` (Firestore `characters/{autoId}` data layer over the Tier-1 save→publish primitive; multiple cards per player keyed by `ownerUid`).
- [x] **B2.2** Player card view + allowed-field editing + save→publish — descriptor-driven `CharacterSheet`, player roster with enrol, in `src/kits/ttrpg/Characters.tsx`.
- [x] **B2.3** Advancement/assessment flow — GM grants XP + toggles "Open assessment"; player assessment mode unlocks `advancementLocked` fields (stats/moves) and spends XP by the cost tables.
- [x] **B2.4** GM roster — master/admin sees all table characters, opens/edits any, edits GM-only fields; driven by `effectiveRole('ttrpg')`. Security Rules + composite index added for `characters`.

### TIER 3 — TTRPG Scene (live) + Dice + Moves
- [ ] **B3.1** Scene data model + GM setup (create scene, participants, elements).
- [ ] **B3.2** Live scene sync via `onSnapshot` — GM shares to players, GM controls.
- [ ] **B3.3** Dice roller: PBtA 2d6+stat, move resolution (miss / 7–9 / 10+), roll log in scene.
- [ ] **B3.4** Move module: GM create/edit/provide moves; player view; rule-helper link.

### TIER 4 — TTRPG Knowledge: Lore / Chronology / Rule Helper / NPCs
- [ ] **B4.1** Lore module (GM CRUD, player read).
- [ ] **B4.2** Chronology/timeline module (GM edit, player read).
- [ ] **B4.3** Rule helper (moves/rules reference, GM-editable).
- [ ] **B4.4** NPC storage: GM create/edit/restructure, save data, build connections between NPCs (graph); player sees cards only.

### TIER 5 — LARP Player Core + Character Pages + Logs
- [ ] **B5.1** LARP character page data model (player-allowed fields vs master-only fields).
- [ ] **B5.2** Player character page: view + edit allowed fields + save.
- [ ] **B5.3** Master: all player cards list, open any, edit master-specific fields.
- [ ] **B5.4** Change-log module: record every player/master change; master views log.

### TIER 6 — LARP Plot / Threads / Graphs / Rules (per-player sharing)
- [ ] **B6.1** Plot module: master authoring (many functions); player sees plot shared to him.
- [ ] **B6.2** Thread module: per-player comment threads; player sees only his.
- [ ] **B6.3** Graph module: master create/edit/options; player sees only accepted graphs.
- [ ] **B6.4** Rules module: master create + accept-to-users; player reads his accepted rules.

### TIER 7 — LARP Master Tooling: Page CMS + Role Acceptance Dashboard
- [ ] **B7.1** Page storage/CMS: master create/restructure pages from designed elements, publish to Open Site.
- [ ] **B7.2** Player-role acceptance dashboard: create role → store → link to existing player, switch statuses, hand-triggered data updates.

### TIER 8 — Open Site (public) + Cross-links
- [ ] **B8.1** Main page.
- [ ] **B8.2** Rule + lore public pages (split), sourced from LARP Page CMS (B7.1).
- [ ] **B8.3** Org info page (layout hardcoded, data from Firestore).
- [ ] **B8.4** Public character list (from LARP master data, B5.3).
- [ ] **B8.5** Telegram button + cabinet selector/login entry + TTRPG↔LARP cross-links.

### TIER 9 — Hardening & Polish
- [ ] **B9.1** Security Rules full audit (every collection, per-permission test cases).
- [ ] **B9.2** Free-tier usage audit (read/write minimization, caching, pagination).
- [ ] **B9.3** Responsive + a11y polish, error/loading/empty states.
- [ ] **B9.4** Final deploy verification + docs refresh.

---

## 5. Per-Station Working Agreement

At the start of each Tier session:
1. Re-read this backlog + the latest design doc section for the station.
2. Write the detailed plan (Firestore collections + fields, components, Security Rules deltas, read/write budget).
3. Implement batches in order; keep each batch independently verifiable.
4. Update checkboxes here + add notes/decisions to project memory.
5. Verify build + deploy preview before closing the session.

## 6. Open Questions (resolve per-station)
- Exact PBtA card fields / moves / playbooks → from Notion (T2).
- Design-doc component inventory → from pasted doc (T0.5).
- Org info page content + Telegram URL (T8).
- Whether LARP "graphs" and TTRPG "NPC connections" share a graph component (evaluate at T4/T6).
