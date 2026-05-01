# I Built a Voter Guide for First-Time Indians. I Am a First-Time Voter. Here's What Went Wrong.

*Built for PromptWars Virtual 2026 on Hack2Skill. Solo project, 10 days, vanilla HTML/CSS/JS + Gemini 2.5 Flash.*

**Live app:** [voteready-pi.vercel.app](https://voteready-pi.vercel.app/) · **Repo:** [github.com/rajyyug1132/voteready](https://github.com/rajyyug1132/voteready)

---

## The idea

I turned 18 last year. I'm eligible to vote in the next general election. And until I started building VoteReady, I didn't actually know the steps involved.

Not in a vague way — in a specific, embarrassing way. I didn't know that you need to submit Form 6 to register. I didn't know there are exactly 12 accepted photo IDs at the polling booth, not "any government ID." I didn't know the VVPAT slip is visible for about 7 seconds before it drops into the sealed box.

I only found all of this out because I tried to explain it to someone else through an app, and the app kept getting it wrong.

VoteReady is a guided walkthrough for first-time Indian voters aged 18–22. It has three parts: a checklist that walks you from "am I eligible?" to "what do I carry on polling day," an AI-powered Q&A for natural questions about voting, and a map showing polling schedules. Everything runs on vanilla HTML, CSS, and JavaScript — no React, no build step, no frameworks.

The interesting part of this project isn't the tech. It's what happened when I tried to make the content correct.

## The hallucinated handbook

On day 1, I used AI to help me research ECI (Election Commission of India) voter guidelines. It gave me a URL for the "ECI Voter Handbook 2024 Edition" — a clean, official-looking link on eci.gov.in. I built my entire Q&A knowledge base around content from that handbook.

On day 9, I finally clicked the URL myself.

404. Page not found.

The URL had never existed. It was hallucinated by the AI in an earlier session. The ECI had restructured their entire website to a JavaScript SPA, and the old file-based URL structure was gone. I'd been building on a source that was never real.

This kicked off a full-day verification sprint. I found the actual current ECI content: the Manual on Electronic Voting Machine (Edition 8, August 2023, 182 pages), the ECI FAQs on EVM page (129 FAQs, last updated July 2025), and a PIB press release from October 2025 listing the 12 accepted voter photo IDs.

I read the manual. Not skimmed — read. And what I found didn't match what my app was telling people.

## The circular verification trap

Here's the subtler mistake. While checking my Q&A system's claims, I asked: "Does the EVM beep when you cast your vote?" My app's knowledge base said yes. I checked it against... my app's knowledge base. It matched. Verification complete, right?

No. I'd verified the claim against itself. The "source" I was checking was text I had written into the app, not an external ECI document.

When I went to the actual ECI Manual, the beep was mentioned only in a troubleshooting checklist for polling officers — not as a voter-facing instruction. The ECI FAQ document turned out to describe it more explicitly as voter confirmation, but the point stands: I almost shipped a claim that was verified circularly. The only reason I caught it was because someone pushed me to check against the primary source, not against my own output.

I deleted the beep claim from the app and replaced it with hedged language: "The machine will confirm that your vote has been recorded." Later, after reading the ECI FAQ more carefully, I confirmed the beep is real. But I'd rather ship something cautious and correct than confident and wrong.

## The ID list that was "close enough"

My Q&A was telling users: "You can bring your Aadhaar, PAN card, Driving Licence, or Passport" to the polling booth, followed by "or any other official government-issued photo ID."

Both of those are wrong.

The real answer is that there are 12 specific alternative photo IDs notified by the Election Commission. Not "any" government ID — a specific list. And the list includes documents most people wouldn't guess, like MNREGA Job Cards and health insurance smart cards. Telling a first-time voter "any government photo ID" could mean they show up with something that isn't on the list and get turned away.

I found the correct list in a PIB press release (PRID 2177191, October 2025) and rewrote the knowledge base to say "12 specific alternative photo IDs" with examples, plus a redirect to voters.eci.gov.in for the full list. Less confident, more correct.

## What I cut (and why that matters)

By day 9, I had a choice: keep polishing the landing page redesign I'd been working on, or go back and verify every factual claim in the app against real ECI sources.

I shelved the redesign. It's still sitting in a `landing-redesign` branch, unfinished. The app looks rougher than it could. But every fact in it is now traceable to a specific ECI document, PIB press release, or government portal.

Here's what I removed rather than ship unverified:

- Specific polling officer duty descriptions ("First Officer checks your ID, Second Officer marks your finger") — I couldn't find the exact officer-to-duty mapping in the Manual
- The "beep" claim in its original confident form
- Fake section numbers in the knowledge base header that made AI-written content look like it came from an official handbook
- A "Voter Journey Timeline" with specific dates that were already past

Every deletion made the app smaller and less impressive-looking. Every deletion also made it more honest. For a tool that's supposed to help real people navigate a real civic process, I think that's the right trade.

## The tech (kept simple on purpose)

The entire app is static HTML served by Vercel. The only server-side code is a single file: `api/gemini.js`, a Vercel serverless function that proxies requests to Gemini 2.5 Flash. The API key lives in a Vercel environment variable and never touches the browser.

This was a deliberate choice. A framework would have given me routing, state management, and component reuse. It also would have given me a build step, node_modules, and complexity I'd have to debug at 11 PM on a deadline night. Vanilla HTML meant I could edit a file, save, and refresh. When things broke — and they broke often — the error was always in my code, not in a bundler config.

The Q&A works by injecting a `handbook_context` string into the Gemini system prompt. That string contains verified ECI information, rewritten in plain language. The system prompt tells the model to answer conversationally, never cite section numbers, and say "I don't know" for anything not covered. It's retrieval-augmented generation in its most basic form: a curated context window, not a vector database.

Checklist state persists in localStorage. The JSON data files are under 10KB combined. The whole repo is well under 10MB.

## What I learned

**AI is great at generating plausible content and terrible at generating correct content.** The hallucinated URL looked perfect. The ID list was almost right. The beep was probably true. "Almost" and "probably" are fine for a blog post. They're not fine for a tool that tells a first-time voter what to bring to a polling booth.

**Verification cannot be outsourced.** Not to another AI, not to your own app's output, not to a URL you haven't clicked yourself. The only verification that counts is reading the source document with your own eyes and comparing it to what your app says.

**Smaller and verified beats bigger and hallucinated.** I could have shipped more features. I shipped fewer, correct ones. The judges will see a simple app. But they won't find a single voter-facing claim that isn't traceable to an ECI source. I'll take that trade every time.

**Commit before you context-switch.** I lost two days of work early on because I didn't commit before closing my laptop. I almost committed a corrupted README because Antigravity garbled the markdown with escape characters. Both were caught by `git diff`. Now I diff before every stage, every time.

---

*VoteReady was built solo over 10 days for PromptWars Virtual 2026 using Google Antigravity (Gemini 3.1 Pro for code generation) and Gemini 2.5 Flash for the Q&A feature. All voter-facing content is verified against the ECI Manual on EVM (Ed. 8, 2023), ECI FAQs on EVM, PIB Press Release PRID 2177191, and the Voters' Service Portal at voters.eci.gov.in.*