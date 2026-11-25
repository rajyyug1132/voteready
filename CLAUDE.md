# VoteReady — project rules

- Commits and PRs: do NOT add Claude as a contributor. No `Co-Authored-By: Claude …` line in commit messages, no "Generated with Claude Code" line in PR bodies. Commit as the repo's git user only.
- MERN rebuild lives in `server/` (Express + Mongoose, port 3001) and `client/` (Vite + React). The static site at the repo root stays live on `main` until the client does full CRUD against the deployed API.
- Lab route names are fixed by the FSD handout: `GET /plans`, `GET /getplan/:id`, `POST /createplan`, `PUT /updateplan/:id`, `DELETE /deleteplan/:id`. Don't rename them.
- Don't copy the handout's bugs (list in `docs/FSD-CHECKLIST.md` §B).
- Source of truth for status: `docs/FSD-CHECKLIST.md`.
- Windows machine: use `python`, not `python3`. No local `mongod`; use `cd server && npm run dev:memory` or `npm test` (in-memory MongoDB).
- Deploy: Vercel projects `voteready-api` (root `server`) and `voteready-mern` (root `client`), deployed from the repo root with `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` set (Git Bash needs `MSYS_NO_PATHCONV=1` for `vercel api`). `voteready` (voteready-pi.vercel.app) is the old static site from `main`; don't deploy over it.
- Smoke test after deploy: `/health` 200, `/states` 36, `/checklist?lang=hi` 8, a create → get → update → delete round trip on `/createplan` etc., and client `/plans` 200.

## Static site design constraints (repo root)

- Static HTML + Bootstrap 5.3; all theme tokens live in `assets/site.css` (`--vr-*`). No new CSS frameworks.
- Visual direction (chosen 2026-11-25): **EVM ballot unit**. Stone-grey ground `#ecebe6`, ink `#17181a`,
  vote-key blue `#1f4fd1` (action only), lamp red `#e3262b` (= step done only). Dark mode tokens in the same file.
- Type: Hanken Grotesk (800 headings, 400-600 body) + Noto Sans Devanagari for Hindi. No serif.
- The ballot-unit pattern (`.unit` / `.unit-row` / `.lamp` / `.key`) is the brand graphic: hero progress panel and checklist list.
- Logo: one ballot-unit row (red lamp + blue key) on an ink square (`assets/logo.svg`, `favicon.svg`).
- Never: violet/purple, cream/paper bg, gradients or glow, side-stripe borders (`border-left` > 1px), gradient text, saffron/green tricolour by reflex.
- Every new visible string needs a Hindi entry in `translate.js` (`scripts/check_hi_coverage.py`).
- `booth.html` practice EVM: made-up candidates with geometric symbols only (never a real party, name or symbol); keep it labelled "practice only". Station text must stay sourced from the checklist / ECI Handbook.
- Theme: `localStorage.voteready_theme` (light/dark) overrides the OS setting; the inline head script on every page sets it before paint. Shared page behaviour lives in `assets/app.js` (theme toggle, vibration, service-worker registration).
- Offline: `sw.js` caches pages/data (network-first) and assets (cache-first). Bump `VERSION` in `sw.js` whenever you add a page or data file, and add it to `CORE`.
- Myths (`data/myths.json`) and Ask-page sources (`NOTES` in `api/gemini.js`) may only cite facts and URLs already in this repo's data files.
