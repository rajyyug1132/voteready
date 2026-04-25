# Prompt Log — VoteReady

This file logs every significant prompt sent to Antigravity during the build.

---

## Day 1 — First Gemini round-trip test

**Prompt:** Create test.html with a text input, button, and Gemini API integration. No frameworks.

**Result:** Worked first try. Gemini returned "Hello" to test input. Dark-mode UI generated automatically.

**Notes:** 45 minutes of GCP setup friction before API key worked. Once the key was ready, code generation took 41 seconds.

---

## Day 1 — Research lesson

I tried to shortcut ECI research by prompting another AI and having it verify sources. Got called out when I tried the same trick twice. Opened the real URLs in Firefox — PIB page confirmed, voters.eci.gov.in confirmed, but electoralsearch tab order was wrong in AI research (it said Details/EPIC/Mobile but real page shows EPIC/Details/Mobile).

**Lesson learned:** AI research is fine for exploring. Verification must be manual — I can't outsource judgment to another AI.

---

## Day 1 — Checklist UI

**Prompt:** Build checklist.html loading data/checklist.json, rendering as collapsible cards with Done toggle and progress bar.

**Result:** Worked on second try. First run failed with CORS error (file:// blocks fetch). Fixed with `python -m http.server 8000`.

**Notes:** Code was correct — runtime environment was wrong. Need to document local server setup in README.

---

## Day 1 → Day 3 — Lost commits

Built landing page (index.html) and added "Back to home" navigation on day 1 afternoon. Never committed. Two days of life stuff happened. Came back on day 3 to find:
- index.html untracked
- checklist.html and test.html with uncommitted changes
- README.md never updated with real content
- PROMPTS.md accidentally overwritten with README content (wrong Ctrl+S tab)

**Lesson learned:** Always commit before closing, even if unfinished. Two-day gap meant re-deriving what I'd done from git diff and Antigravity history.

---

## Day 3 — Recovery commit

Recovered landing page and "Back to home" links from git status. Rebuilt this prompt log from scratch. Recreated README.md properly.