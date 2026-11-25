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
| L1 | `client/` created with `npm init vite` → React + JavaScript | 5 | `client/` (Vite + React, JS) | [x] |
| L2 | `client/`: `npm install bootstrap axios react-router-dom` | 5 | `client/package.json` | [x] |
| L3 | `BrowserRouter` routes: list `/plans`, create `/plans/create`, update `/plans/update/:id` | 5 | `client/src/App.jsx`; live test 2026-11-25 | [x] |
| L4 | `server/` created with `npm init -y`; `npm install express mongoose cors nodemon` | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L5 | `server/package.json`: `"start": "nodemon index.js"` | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L6 | `server/index.js` + `server/models/` folder | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L7 | `app.use(cors())` and `app.use(express.json())` in `index.js` | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L8 | `GET /plans` — list | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L9 | `GET /getplan/:id` — one by id | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L10 | `POST /createplan` — create | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L11 | `PUT /updateplan/:id` — update by id | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L12 | `DELETE /deleteplan/:id` — delete by id | 4 | `npm test` in `server/` (6/6, in-memory MongoDB) | [x] |
| L13 | All five CRUD calls made from React with axios | 5 | `client/src/pages/Plans.jsx` via `src/api.js`; live CRUD 2026-11-25 | [x] |
| L14 | MongoDB: Atlas for deploy, `mongodb://localhost:27017` for dev, via `MONGODB_URI` | 4 / 6 | dev: `mongodb://localhost:27017/voteready`; deploy: Atlas M0 (`atlas-green-cave`) injected as `MONGODB_URI` by the Vercel integration; first request seeds an empty DB | [x] |
| L15 | Every API route tested in Postman; collection exported to `server/postman/` | 4 | `server/postman/voteready.postman_collection.json`, 11 requests, run with newman (Postman's CLI runner) against https://voteready-api.vercel.app on 2026-11-25: 11/11 OK, 0 failed | [x] |
| R1 | One public Kaggle dataset used in the app (slug, columns, license verified) | 3 / 5 | Kaggle `jainaru/lok-sabha-2024-results-and-candidates`, CC0. `candidates_with_phase.csv` (8,441 rows: State, Constituency_No, Constituency, Phase, Polling Date, …) → `server/scripts/clean-kaggle.js` → `data/constituencies.json`, 543 rows, 36/36 states matched, every state's count = its LS seats. One source error fixed in code: Maharashtra Aurangabad carried Bihar Aurangabad's PC no./phase/date (37, 1, 19 Apr) → 19, 4, 13 May 2024. Used by the Voting plan constituency dropdown via `GET /states/:name/constituencies` | [x] |
| R2 | Rubric rows beyond the handout | — | | [ASK] |

## B. Handout bugs we must not copy

| ID | Handout bug | Correct version | Status |
|---|---|---|---|
| H1 | `<lable>` | `<label htmlFor>` | [x] |
| H2 | `.catcg` | `.catch` | [x] |
| H3 | `.then(res => res.json(res))` shadowing in delete | send a status + body; client doesn't reuse `res` | [x] |
| H4 | `navigate('/')` fires before the request finishes | `await` the request, then navigate | [x] |
| H5 | Port 3000 vs 3001 mismatch | one `PORT` env on the server, `VITE_API_URL` on the client | [x] |
| H6 | Missing `key` in `.map` | `key={plan._id}` | [x] |
| H7 | Uncontrolled inputs on update | controlled inputs filled from `GET /getplan/:id` | [x] |
| H8 | No validation | schema validation + 400/404/201 codes, no stack traces in responses | [x] |

## C. Phase gates

| Phase | Gate | Status |
|---|---|---|
| 0 Freeze | rows written · deadline known | rows [x] · tag pushed [ ] · deadline [ASK] |
| 1 Truth fixes (main) | every voter-facing fact has `{source, verified_on}` · en/hi parity script passes · no broken images live | parity [x] · broken images [x] · live checks [x] · **sources: partial — see E** |
| 2 De-slop (main) | every slop item closed · Lighthouse a11y ≥ 95 · feature parity with the Phase 0 screenshots | slop items [x] · Lighthouse a11y 100 (live, 4 pages) [x] · parity [x] — see F |
| 3 Kaggle data | row counts match source · 0 unmatched state names | 543 = ECI total · 0 unmatched · per-state counts = LS seats [x] |
| 4 Server (fsd-mern) | all 5 CRUD routes pass in Postman · seed runs clean on an empty DB | routes + seed pass `npm test` [x] · Postman collection 11/11 live (newman) [x] |
| 5 Client (fsd-mern) | create → list → update → delete works in the browser · every Phase 0 feature works in en + hi · no slop item returns | CRUD in browser, local + live [x] · checklist/EPIC/map/ask in en + hi [x] · Maps directions dropped on purpose (D3) · slop re-check clean (Phase 7) [x] |
| 6 Deploy + merge | live client does full CRUD against the live API · `/health` green | deployed 2026-11-25: client https://voteready-mern.vercel.app, API https://voteready-api.vercel.app (both Vercel), MongoDB Atlas M0 via the Vercel integration. `/health` 200; live create → get → update → delete → 404 pass; 400 on invalid plan; CORS limited to the client origin; `/ask` answers with the Gemini key. Merged to `main` (PR #2, `335d311`); voteready-pi redeployed from `main`, all 4 static pages + `/api/gemini` 200 [x] |
| 7 Verify | every row in A and B ticked with proof · mobile + Hindi + keyboard pass | A: all [x] except R2 (rubric, [ASK]) · B: all [x] · mobile + Hindi + keyboard: `scripts/check_mern.py` 25/25 live [x] — see G |

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

## E. Phase 1 results (commit `af1803e`, live 2026-10-15)

Proof: `python scripts/check_parity.py --base-url https://voteready-pi.vercel.app` → `PARITY OK: 8 items, steps per item [5,5,5,5,5,5,7,5], 12 IDs in both languages`. Browser checks (16) and 0 HTTP errors on all four pages, local and live.

| Item | Result | Status |
|---|---|---|
| EPIC checker: no timer, no random numbers, no hardcoded "Rahul Sharma"; reads `data/voters.json`; "No demo record" otherwise; demo label kept; match saved to `voteready_voter` | live test: unknown EPIC → "No demo record"; `VOTE202601` → data record; saved + restored on reload | [x] |
| `checklist_hi.json` 1:1 with English (ids, 8 items, 5/5/5/5/5/5/7/5 steps, 12 IDs, left forefinger, English category keys + `category_label`) | parity script | [x] |
| `first_time_confidence` step 4: Third Polling Officer presses the Ballot button on the Control Unit | cited to Presiding Officer Handbook §8.1.1–8.1.4, §20.3 (`ceogoa.nic.in` copy, read 2026-10-15) | [x] |
| Journey on `index.html`: steps 1–2 follow checklist progress; voting and results never auto-complete | live test | [x] |
| Results-day wording (D13) | "5 randomly selected polling stations in each Assembly Constituency (each Assembly segment in a Lok Sabha election)" per ECI EVM Manual Ed. 9 §10.7 | [x] |
| Map: Andaman & Nicobar Vidhan Sabha 30 → 0 | LS seats sum to 543 (ECI Atlas 2024 p. 31); VS seats sum to 4,123 after the fix | [x] |
| Map: unsourced "~42M"-style voter numbers removed (also from the home-page copy) | grep + live test | [x] |
| Map: all 36 LS/VS counts verified one by one | **not possible from here** — see below | [ASK] |
| Map: CEO portal links verified | **not possible from here** — see below | [ASK] |
| D3 Maps routing: relabelled "Directions to the state CEO office"; hidden if Google rejects the key | billing decision still open | [ASK] |
| D5/D6: "verified by ECI" wording; `languageChanged` now dispatched | live test (toggle reloads checklist) | [x] |
| README/BLOG polling-schedule claim; D2 screenshots (`assets/screenshots/` is the one name; 4 real images) | grep; 0 broken images | [x] |
| D12: Ladakh no longer links the J&K CEO site; DNHDD and Lakshadweep (not CEO sites) show no link | live test | [x] |

Not verifiable from the build environment:

- **Per-state seat counts.** `results.eci.gov.in` is reachable only page by page and has no Vidhan Sabha counts; `eci.gov.in` returns HTTP 406 to non-browser clients. What is verified: the 543 total and the top-8 Assembly counts (UP 403, WB 294, MH 288, BR 243, TN 234, MP 230, KA 224, RJ 200), all from the ECI Atlas 2024. The page footer says the rest are "being re-verified".
- **Checklist `source` and `officialLink` URLs on `eci.gov.in`, and 33 of 36 CEO domains** (D11). They return 406 or are blocked by the egress allowlist, so "dead" and "blocked" can't be told apart. Open them once in a browser (list: `python scripts/check_parity.py` has no URL check yet).
- Checklist items other than `documents_to_carry` and `first_time_confidence` keep their original `verified_on` of 2026-04-23; I did not re-verify them.

## F. Phase 2 results (commit `e321856`, live 2026-10-15)

Proof: live Lighthouse (headless Chromium) accessibility 100 and best-practices 100 on `/`, `/checklist.html`, `/qa.html`, `/map.html`; 0 HTTP errors and 0 page errors in the 16 live screenshots (`docs/baseline/phase2/manifest.json`); `scripts/check_hi_coverage.py` → 0 English strings left in Hindi mode on all four pages (D4 was 52 / 58 / 6 / 1); the 19 behaviour checks from Phase 1 plus checklist reveal pass live. Screenshots to compare side by side: `docs/baseline/v1-promptwars/` vs `docs/baseline/phase2/`.

| Slop item (from the brief) | Result | Status |
|---|---|---|
| Ambient orbs, noise, glassmorphism on every page | removed; shared `assets/site.css` | [x] |
| Gradient headline text, blue hover on purple chips | removed; single accent, ink-violet | [x] |
| Spline hero, GSAP on every element | removed; one CSS fade (off under `prefers-reduced-motion`) | [x] |
| Fake browser-chrome frames, emoji icons, "AI" stat tile | removed; stats are 36 / 8 / 12 / 1950 | [x] |
| Tailwind CDN | replaced by Bootstrap 5.3.3 + theme tokens | [x] |
| UI direction: light paper + ink, one type pair, real focus states, mobile-first, dark via tokens | Source Serif 4 + Source Sans 3; `:focus-visible` ring; dark tokens (contrast ≥ 6.3 : 1 in both modes); no horizontal overflow at 360 px | [x] |
| Logo + favicon kept | `assets/logo.svg`, `assets/favicon.svg` unchanged | [x] |
| Copy: "100% factual grounding with zero retrieval latency", "lexical router" scaling claim, "cannot prompt-inject", "1.8 crore", hero badge | rewritten (README) / cut; hero badge is "Student project · based on Election Commission of India sources" | [x] |
| Code: dead CSS, stray comment, dictionary entries for removed content, duplicated inline styles, `brand.css` | removed (dictionary 141 → 176 entries after dropping 87 dead ones and adding the new copy, state names, capitals) | [x] |
| README "~425 tokens" (D9) | measured: reference block is 2,982 characters; README now says "about 3,000 characters" | [x] |
| PIB date (README said 7 Oct) | PIB page says 10 Oct 2025 | [x] |
| `PROMPTS.md` → real build log | date / commit / change / prompt table. Prompts from Apr–May 2026 were never saved, so that column says "not recorded" | [x] |
| D7: BLOG says a `landing-redesign` branch exists and that the timeline was removed | corrected in Phase 7 (see G) | [x] |
| D14 dead dictionary entries | removed | [x] |

Known gaps: the map still draws the pre-2019 J&K/Ladakh boundary (note shown on Ladakh); BLOG.md still describes the vanilla-JS build until its Phase 7 rewrite; Maps directions are hidden if Google rejects the key (billing decision open, E).

## G. Phase 7 results (live, 2026-11-25)

Proof: `python scripts/check_mern.py --base-url https://voteready-mern.vercel.app --shots docs/baseline/mern` → `0 failure(s)`, 25 checks. Screenshots: `docs/baseline/mern/` (6 pages × 390/1440 px × en/hi).

| Check | Result | Status |
|---|---|---|
| Mobile: no horizontal overflow at 390 px and 1440 px | home, checklist, ask, map, plans list, plan form — en and hi | [x] |
| Hindi: no visible English UI text in `hi` (same ignore rules as `check_hi_coverage.py`) | 0 strings left on all 6 pages | [x] |
| Keyboard: Tab reaches every visible control; each focused control shows a visible focus style | all 6 pages, en and hi (1440 px; at 390 px the nav sits behind the toggler) | [x] |
| Keyboard-only CRUD: create a plan with Tab / type / Enter only, then see it in the list | plan saved with state Goa, constituency North Goa; deleted through the API afterwards | [x] |
| Postman collection against the live API | 11/11 (newman) | [x] |
| Slop re-check on the client | `client/src/site.css` identical to the Phase 2 theme; no gradients, blur/glass, GSAP, Tailwind or emoji icons (only the original "✓ Completed" tag); one fade, off under `prefers-reduced-motion` | [x] |
| D7 BLOG claims (`landing-redesign` branch, timeline removed); D8 polling schedules | corrected; MERN section added | [x] |
| D15 `voteready_fsd_workflow.png` with old phase numbering | deleted; `docs/system-map.html` is the diagram | [x] |

Still open: R2 rubric rows beyond the handout ([ASK]); per-state seat counts and CEO links (§E, need a browser session on eci.gov.in); Lighthouse was not re-run on the MERN client (Phase 2's 100 was on the static pages).

