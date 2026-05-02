# VoteReady

**Live:** [voteready-pi.vercel.app](https://voteready-pi.vercel.app/)

A guided walkthrough for first-time Indian voters (18–22) preparing to cast their first vote in a general election. Built for [PromptWars Virtual 2026](https://hack2skill.com) with Google Antigravity.

## What it does

VoteReady answers the question "I just turned 18 — now what?" through three features:

- **Am I Ready?** — An 8-step checklist covering eligibility, registration via Form 6, polling booth lookup, accepted documents, and what to do if your name is missing from the electoral roll.

- **Ask a Question** — A Gemini-powered Q&A that answers natural questions about voting in India, grounded in verified ECI reference data.

- **Polling Day Map** — An interactive map showing your state's polling schedule and booth locations.

## Screenshots

| Checklist | Q&A | Map | Landing |
|-----------|-----|-----|---------|
| ![Checklist](assets/Screenshots/Screenshot%202026-04-29%20205827.png) | ![Q&A](assets/Screenshots/Screenshot%202026-04-29%20205859.png) | ![Map](assets/Screenshots/Screenshot%202026-04-29%20205931.png) | ![Landing](assets/Screenshots/Screenshot%202026-04-29%20205957.png) |

## How content is verified

Every factual claim in VoteReady is checked against primary ECI sources — not against the app's own output, and not against AI-generated text. The verification sources are:

1. **ECI Manual on EVM, Edition 8, August 2023** — voting process, VVPAT slip duration, button details
2. **ECI FAQs on EVM** ([eci.gov.in/evm-faqs](https://eci.gov.in/evm-faqs), last updated July 15, 2025) — 129 FAQs covering procedures, safeguards, and common misconceptions
3. **PIB Press Release PRID 2177191** (Oct 7, 2025) — the specific list of 12 alternative voter photo IDs
4. **Voters' Service Portal** ([voters.eci.gov.in](https://voters.eci.gov.in)) — Form 6, electoral roll search, qualifying dates

Claims that could not be verified against these sources were removed rather than kept as plausible guesses. The Q&A system prompt explicitly instructs the model to say "I don't know" rather than fabricate answers.

## Tech stack

- Vanilla HTML, CSS, and JavaScript — no build step, no frameworks
- Gemini 2.5 Flash for the Q&A feature
- Vercel serverless function (`api/gemini.js`) as a proxy — the API key lives in Vercel environment variables and is never exposed to the browser
- localStorage for checklist state persistence
- Static JSON for verified ECI content

## Running locally

```bash
git clone https://github.com/rajyyug1132/voteready.git
cd voteready
python -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). The checklist and map work without any setup.

For the Q&A feature, deploy to Vercel and set the `GEMINI_API_KEY` environment variable in your Vercel project settings. The serverless proxy at `api/gemini.js` handles the API call server-side. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Why this exists

In India, roughly 1.8 crore citizens turn 18 every year and become eligible to vote. Many don't register, miss deadlines, or skip polling day because the process feels opaque. VoteReady reduces that friction by walking new voters through the actual steps in plain language, with links to the official ECI tools that handle each step.

# Engineering Tradeoffs & Future Scaling

Current Architecture: Due to the concise, high-signal nature of our ECI reference JSON (~425 tokens), we inject the full context into the Gemini 2.5 Flash system prompt. This guarantees 100% factual grounding with zero retrieval latency.
"Scaling Plan: As we expand to state-specific rules (36 states & UTs), we have mapped out a zero-dependency lexical router (getRelevantContext) to chunk the prompt dynamically without bloating the 10MB repository limit.

## Project status

Built solo during PromptWars Virtual 2026 (April 23 – May 3, 2026). See `PROMPTS.md` for the build log.