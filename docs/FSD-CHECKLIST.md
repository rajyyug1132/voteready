# VoteReady → MERN (FSD lab) — checklist

Every row gets ticked only with proof: a commit hash, a Postman screenshot, or a page screenshot.
Status: `[ ]` open · `[x]` done (proof linked) · `[ASK]` blocked on Yyug.

| Item | Value |
|---|---|
| Deadline | `[ASK]` |
| Rubric beyond the handout | `[ASK]` |
| Lab handout (`MERN_stack.md`) | `[ASK]` not in the repo or the Claude project yet — attach it so the spec rows below can be checked against the original |
| Freeze tag | `v1-promptwars` → `1070d1e` (2026-05-02, last commit before the PromptWars deadline; `main` adds only `voteready_fsd_workflow.png` after it) |
| Baseline screenshots | `docs/baseline/v1-promptwars/` — 4 pages × 390/1440 px × en/hi, captured from the live site 2026-10-08 (`manifest.json` lists URLs, HTTP errors, page errors) |
| Re-capture | `python scripts/capture_baseline.py --base-url <url> --out docs/baseline/<name>` |

## A. Lab spec (from the handout, as summarised in the build prompt)

| ID | Requirement | Phase | Proof | Status |
|---|---|---|---|---|
| L1 | `client/` created with `npm init vite` → React + JavaScript | 5 | | [ ] |
| L2 | `client/`: `npm install bootstrap axios react-router-dom` | 5 | | [ ] |
| L3 | `BrowserRouter` routes: list `/plans`, create `/plans/create`, update `/plans/update/:id` | 5 | | [ ] |
| L4 | `server/` created with `npm init -y`; `npm install express mongoose cors nodemon` | 4 | | [ ] |
| L5 | `server/package.json`: `"start": "nodemon index.js"` | 4 | | [ ] |
| L6 | `server/index.js` + `server/models/` folder | 4 | | [ ] |
| L7 | `app.use(cors())` and `app.use(express.json())` in `index.js` | 4 | | [ ] |
| L8 | `GET /plans` — list | 4 | | [ ] |
| L9 | `GET /getplan/:id` — one by id | 4 | | [ ] |
| L10 | `POST /createplan` — create | 4 | | [ ] |
| L11 | `PUT /updateplan/:id` — update by id | 4 | | [ ] |
| L12 | `DELETE /deleteplan/:id` — delete by id | 4 | | [ ] |
| L13 | All five CRUD calls made from React with axios | 5 | | [ ] |
| L14 | MongoDB: Atlas for deploy, `mongodb://localhost:27017` for dev, via `MONGODB_URI` | 4 / 6 | | [ ] |
| L15 | Every API route tested in Postman; collection exported to `server/postman/` | 4 | | [ ] |
| R1 | One public Kaggle dataset used in the app (slug, columns, license verified) | 3 / 5 | | [ ] |
| R2 | Rubric rows beyond the handout | — | | [ASK] |

## B. Handout bugs we must not copy

| ID | Handout bug | Correct version | Status |
|---|---|---|---|
| H1 | `<lable>` | `<label htmlFor>` | [ ] |
| H2 | `.catcg` | `.catch` | [ ] |
| H3 | `.then(res => res.json(res))` shadowing in delete | send a status + body; client doesn't reuse `res` | [ ] |
| H4 | `navigate('/')` fires before the request finishes | `await` the request, then navigate | [ ] |
| H5 | Port 3000 vs 3001 mismatch | one `PORT` env on the server, `VITE_API_URL` on the client | [ ] |
| H6 | Missing `key` in `.map` | `key={plan._id}` | [ ] |
| H7 | Uncontrolled inputs on update | controlled inputs filled from `GET /getplan/:id` | [ ] |
| H8 | No validation | schema validation + 400/404/201 codes, no stack traces in responses | [ ] |

## C. Phase gates

| Phase | Gate | Status |
|---|---|---|
| 0 Freeze | rows written · deadline known | rows [x] · tag pushed [ ] · deadline [ASK] |
| 1 Truth fixes (main) | every voter-facing fact has `{source, verified_on}` · en/hi parity script passes · no broken images live | [ ] |
| 2 De-slop (main) | every slop item closed · Lighthouse a11y ≥ 95 · feature parity with the Phase 0 screenshots | [ ] |
| 3 Kaggle data | row counts match source · 0 unmatched state names | [ ] |
| 4 Server (fsd-mern) | all 5 CRUD routes pass in Postman · seed runs clean on an empty DB | [ ] |
| 5 Client (fsd-mern) | create → list → update → delete works in the browser · every Phase 0 feature works in en + hi · no slop item returns | [ ] |
| 6 Deploy + merge | live client does full CRUD against the live API · `/health` green | [ ] |
| 7 Verify | every row in A and B ticked with proof · mobile + Hindi + keyboard pass | [ ] |

## D. Found while freezing (not in the Phase 1/2 lists yet)

Each item below was checked against the repo history or the live site on 2026-10-08 unless marked "verify".

| ID | Finding | Evidence | Goes to |
|---|---|---|---|
| D1 | All 3 home-page feature images 404 live. `assets/screenshots/{checklist,qa,map}.png` never existed in git history. | `manifest.json` http_errors; `git log -- assets` | 1 (Phase 2 removes the browser-frame mockups anyway) |
| D2 | README's 4 screenshots (`assets/Screenshots/…`) were added in `605a5f1` and deleted in `f025b73`, a commit titled "Update qa.html fetch call…". The README table is broken on GitHub too. The casing fix is really "restore or replace". | `git log --name-status -- assets/Screenshots` | 1 |
| D3 | "Find Nearest CEO Office" is broken live: Google Maps throws `BillingNotEnabledMapError` on the production domain. It also isn't "nearest" — it routes to a text search for the CEO office in the state capital. `DirectionsService` shows a deprecation warning (Feb 2026). | console on `/map.html` | 1 (copy) · decide: fix billing or drop the feature |
| D4 | Hindi mode leaves English on every page. Visible English-only strings in `hi`: home 52, map 58 (36 of each are state names in the dropdown), checklist 6, qa 1. Cause: the dictionary matches whole trimmed text nodes, so multi-line or punctuated nodes miss. | headless count, 1440 px | 1 (parity script) · 5 (JSON i18n) |
| D5 | Hindi for "Sources verified against the Election Commission of India" reads "sources verified **by** the ECI" — it claims ECI endorsement. | `translate.js` line 43 | 1 |
| D6 | `checklist.html` listens for `languageChanged`, but nothing dispatches it, so toggling language doesn't reload `checklist_hi.json` until refresh. | `grep -rn languageChanged` → 1 hit | 1 |
| D7 | BLOG says the shelved redesign is in a `landing-redesign` branch; the remote has only `main`. BLOG says the Voter Journey Timeline was removed; `index.html` still has one, with hardcoded "Completed" tags. | `git ls-remote --heads` | 2 (copy) |
| D8 | BLOG repeats the README claim that the map shows polling schedules. | `BLOG.md` line 17 | 1 |
| D9 | README says the reference context is a "JSON (~425 tokens)". It's an inline string in `api/gemini.js`, about 2,200 chars (≈550 tokens by the chars/4 rule of thumb). Measure properly or drop the number. | `api/gemini.js` | 2 |
| D10 | `api/gemini.js` forwards Gemini's raw error JSON to the browser. Don't carry that into `POST /ask`. | `api/gemini.js` `!response.ok` branch | 4 |
| D11 | `checklist.json` sources use `eci.gov.in/files/file/…` and `/gallery/image/…` paths; the BLOG says ECI moved off that URL scheme. Not link-checked yet. | verify | 1 |
| D12 | Ladakh's CEO link points to `ceojammukashmir.nic.in`; the map footer and card link to `nvsp.in`. | verify | 1 |
| D13 | Results-day card: "VVPAT slips of 5 randomly selected booths per constituency" — needs a primary source and the exact unit. | verify | 1 |
| D14 | Dead dictionary entries describe things the app doesn't have ("2026 general elections", "Find your local election dates & rules", "Data fetched from ECI records."). | `translate.js` | 2 |
| D15 | `voteready_fsd_workflow.png` uses the old phase numbering (no de-slop phase). The build prompt is the source of truth. | repo root | 7 (regenerate or delete) |

Capture notes: the white strip under the map page in full-page shots is a screenshot artifact (fixed background covers one viewport). The "vector map failed, falling back to raster" console error is headless-only; the billing error in D3 is not.
