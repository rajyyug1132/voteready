# VoteReady — design constraints

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
