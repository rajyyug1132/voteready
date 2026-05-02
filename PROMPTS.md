I Built a Voter Guide for First-Time Indians. I Am a First-Time Voter. Here's What Went Wrong.

Built for PromptWars Virtual 2026. Solo project, 10 days, vanilla HTML/CSS/JS + Gemini 2.5 Flash.

Live app: voteready-pi.vercel.app · Repo: github.com/rajyyug1132/voteready
The Problem

I turned 18 last year. I am eligible to vote in the next general election. And until I started building VoteReady, I didn't actually know the steps involved.

Not in a vague way — in a specific, embarrassing way. I didn't know that you need to submit Form 6 to register. I didn't know the VVPAT slip is visible for about 7 seconds before it drops into the sealed box. I didn't know there are exactly 12 accepted alternative photo IDs at the polling booth. I assumed "any government ID" would work. (It doesn't).

VoteReady is a guided walkthrough for the 1.8 crore Indian voters aged 18–22 who enter the electorate every year. It features an 8-step verified checklist, a localized interactive map, and an AI-powered Q&A.

But the interesting part of this project isn't the UI. It is what happened when I tried to make an LLM tell the truth about a civic process.
The Hallucination Trap

On day 1, I used AI to help me research ECI (Election Commission of India) guidelines. It confidently gave me a URL for the "ECI Voter Handbook 2024." I built my entire Q&A knowledge base around it.

On day 9, I actually clicked the URL. 404: Page not found.

The URL had never existed. The AI hallucinated a perfectly formatted ECI domain structure. This kicked off a massive verification sprint. I threw out the AI data and went straight to the source: the 182-page Manual on Electronic Voting Machine (August 2023) and a specific PIB press release from October 2025.

Every claim in the app had to be manually verified against these primary documents. If a "fun fact" couldn't be backed up by a government source, I deleted it. I chose to ship an app that was cautious and correct, rather than confident and wrong.
The Architecture: Why Vanilla JS?

The entire app is static HTML/JS served by Vercel. No React, no build step, no npm modules.

This was a deliberate choice. A framework would have given me state management and component reuse, but it would have introduced bundler complexity on a tight deadline. Vanilla HTML meant zero-friction development. Checklist state persists instantly in localStorage. The entire repository is well under 10MB.

To make the app accessible to non-English speakers, I wrote a custom lexical router in vanilla JS that dynamically localizes the entire UI to Hindi with a single click, without relying on external translation APIs.
Securing the LLM against Misinformation

The core feature is the Gemini 2.5 Flash Q&A. Initially, my frontend constructed the system prompt and sent it to the backend.

Then I realized the vulnerability: Never trust the client.

If the client handles the system prompt, a bad actor could bypass my UI, curl my endpoint, and prompt-inject the AI to generate political misinformation using my API key.

To fix this, I completely locked down the backend. The only server-side code is a single Vercel serverless function (api/gemini.js). The client is only allowed to send the user's raw question. The Vercel proxy strictly enforces the ECI handbook context server-side, drops the temperature to 0.1 for maximum determinism, and hard-caps output tokens.

You cannot prompt-inject your way around it. If the answer isn't in the official ECI handbook, the AI is hard-coded to refuse to guess.
What I Learned

    AI is great at generating plausible content and terrible at generating correct content. "Almost right" is fine for a side project. It's not fine for a tool telling a first-time voter what ID to bring to a polling booth.

    Verification cannot be outsourced. Not to another AI, not to your own app's output. The only verification that counts is reading the primary source document with your own eyes.

    Smaller and verified beats bigger and hallucinated. I shelved a massive landing page redesign so I could spend 24 hours reading ECI manuals. The app is smaller because of it, but every single fact is traceable. I'll take that trade every time.

VoteReady was built solo for PromptWars Virtual 2026. Code generated with Google Antigravity. Q&A powered by Gemini 2.5 Flash. All facts verified against official ECI sources.