# Prompt Log — VoteReady

## Day 1 — First Gemini round-trip test

### Prompt 1: Create test.html
**Goal:** Prove the Gemini API works end-to-end in a browser before building the real app.

**Prompt sent:**
> [paste the exact prompt you sent above]

**Result:** [fill in after you see it work — or break]

**Notes:** [what surprised you, what needed fixing]
---

## Day 1 — Checklist UI

**Prompt sent:**
> Build checklist.html in the project root. It loads data/checklist.json 
> via fetch on page load and renders each item as a collapsible card...
> [paste the full prompt you actually used]

**Result:** Worked on second try. First run failed in the browser with 
a CORS NetworkError because file:// protocol blocks fetch() of local 
files. Fixed by running `python -m http.server 8000` and opening via 
http://localhost:8000. The code Antigravity generated was correct — 
my runtime environment was wrong.

**What I learned:** Any app using fetch() for local JSON needs a local 
server during development. Vercel will serve over https:// in production 
so this is only a dev-time issue, but it needs to be documented in the 
README for judges who clone the repo.

**Visual result:** Antigravity nailed the styling on the first try. 
Dark cards, rounded corners, category tags with distinct colors (blue 
for eligibility, purple for registration, orange for polling day), 
progress bar with smooth fill animation. Consistent with test.html 
without me prompting for specific colors.