# VoteReady

A guided walkthrough for first-time Indian voters (18–22) preparing to cast their first vote in a general election. 
Built with Google Antigravity for PromptWars Virtual 2026.

## What it does

VoteReady answers the question "I just turned 18 — now what?" through three features:

- **Am I Ready?**:-
 An 8-step checklist covering eligibility, registration via Form 6, polling booth lookup, accepted documents, and what to do if your name is missing from the electoral roll.

- **Ask a Question**:—
 A Gemini-powered Q&A for natural questions about voting in India.

- **Polling Day Walkthrough**:—
 (Coming soon) A step-by-step simulation of what happens inside a polling booth.

All checklist content is verified against official sources from the Election Commission of India (eci.gov.in), the Voter Services Portal (voters.eci.gov.in), and the Press Information Bureau (pib.gov.in). Each item links to its source.

## Running locally

Requires Python 3.x.

```bash
git clone https://github.com/rajyyug1132/voteready.git
cd voteready
python -m http.server 8000
```

Open http://localhost:8000 in your browser.

The Q&A feature requires a Google AI Studio API key. Create `config.js` in the project root:

```javascript
const GEMINI_API_KEY = "your_key_here";
```

Get a key at https://aistudio.google.com/apikey.

## Tech stack

- Vanilla HTML, CSS, and JavaScript — no build step, no frameworks
- Gemini 2.5 Flash via Google AI Studio for the Q&A feature
- localStorage for checklist state persistence
- Static JSON for verified ECI content
- Built with Google Antigravity (Gemini 3.1 Pro for code generation)

## Why this exists

In India, ~1.8 crore citizens turn 18 every year and become eligible to vote. Many don't register, miss deadlines, or skip polling day because the process feels opaque. VoteReady reduces that friction by walking new voters through the actual steps in plain English, with links to the official ECI tools that handle each step.

## Project status

Built during PromptWars Virtual 2026 (April 23 – May 3, 2026). Active development. See `PROMPTS.md` for the build log and `BLOG_DRAFT.md` for the narrative.
 