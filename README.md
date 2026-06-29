# TriWizard

A community web app for a tabletop group, combining a **public site**, a **LARP cabinet**, and a **TTRPG cabinet** — built to run entirely on **free tiers** (GitHub Pages + Firebase + Imgur).

> 📋 Full build plan and feature breakdown: **[BACKLOG.md](BACKLOG.md)**

## What it is

Three surfaces behind one account:

- **Open Site** — public main / rules / lore / org-info / character-list pages, a Telegram link, and the cabinet login entry.
- **LARP Cabinet** — Player / Master / Admin roles. Character pages, plot, per-player threads, graphs, rules, change logs, a page CMS, and a role-acceptance dashboard.
- **TTRPG Cabinet** — Player / GM / Admin roles. PBtA-based character cards, a **live** scene module with dice roller, lore, chronology, rule helper, moves, and NPC storage.

A user can hold **different roles in LARP vs TTRPG**. Admins can **switch roles without re-logging-in**.
Everything is **save → publish** — except the **Scene module**, which updates live.

## Tech stack

| Concern | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Routing | HashRouter (GitHub Pages friendly) |
| State | Zustand |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google + Email/Password) |
| Images | Imgur API (anonymous Client-ID) |
| Hosting | GitHub Pages (GitHub Actions deploy) |

### Staying free — key design rules
- **No Cloud Functions / Admin SDK** (those need the paid Blaze plan). All authorization is enforced by **Firestore Security Rules + client-side guards**.
- **Roles are Firestore documents**, not Auth custom claims.
- Reads/writes are minimized via the save→publish flow, caching, and pagination; only the Scene module uses realtime listeners.
- One Firebase project serves both cabinets; cross-links use shared accounts.

## Project status

🚧 **Planning complete — implementation not started.** The repo currently contains the plan only. Work proceeds tier-by-tier (one chat session per tier) per [BACKLOG.md](BACKLOG.md), in order: **Foundation → TTRPG → LARP → Open Site → Hardening.**

## Getting started (once Tier 0 lands)

```bash
npm install
cp .env.example .env   # fill Firebase config + Imgur Client-ID
npm run dev
```

Environment variables (documented in `.env.example`):
- `VITE_FIREBASE_*` — Firebase web config (public by design; security is in the Rules).
- `VITE_IMGUR_CLIENT_ID` — Imgur anonymous upload client ID.

## Deployment

Pushing to the default branch triggers the GitHub Actions workflow that builds the Vite app and publishes it to GitHub Pages. Vite `base` is set to the repo name; the SPA uses hash routing so deep links resolve without a server.

## Required inputs

Before the relevant tier, the following are needed (see [BACKLOG.md §3](BACKLOG.md)):
the Claude **design doc**, the Firebase project config, an Imgur Client-ID, the public **Notion** PBtA content, the Telegram chat URL, and the org-info content.
