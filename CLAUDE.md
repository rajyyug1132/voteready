# VoteReady — project rules

- Commits and PRs: do NOT add Claude as a contributor. No `Co-Authored-By: Claude …` line in commit messages, no "Generated with Claude Code" line in PR bodies. Commit as the repo's git user only.
- MERN rebuild lives in `server/` (Express + Mongoose, port 3001) and `client/` (Vite + React). The static site at the repo root stays live on `main` until the client does full CRUD against the deployed API.
- Lab route names are fixed by the FSD handout: `GET /plans`, `GET /getplan/:id`, `POST /createplan`, `PUT /updateplan/:id`, `DELETE /deleteplan/:id`. Don't rename them.
- Don't copy the handout's bugs (list in `docs/FSD-CHECKLIST.md` §B).
- Source of truth for status: `docs/FSD-CHECKLIST.md`.
- Windows machine: use `python`, not `python3`. No local `mongod`; use `cd server && npm run dev:memory` or `npm test` (in-memory MongoDB).
- Deploy: Vercel projects `voteready-api` (root `server`) and `voteready-mern` (root `client`), deployed from the repo root with `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` set (Git Bash needs `MSYS_NO_PATHCONV=1` for `vercel api`). `voteready` (voteready-pi.vercel.app) is the old static site from `main`; don't deploy over it.
- Smoke test after deploy: `/health` 200, `/states` 36, `/checklist?lang=hi` 8, a create → get → update → delete round trip on `/createplan` etc., and client `/plans` 200.
