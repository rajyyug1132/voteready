# Build log

What changed, when, and in which commit. The original build (23 Apr – 2 May 2026) was done with AI coding tools, but the prompts were not saved at the time, so the "Prompt" column says so instead of reconstructing them. From the October 2026 upgrade on, each change is tied to a section of the written brief.

## Original build

| Date | Commit | Change (commit message) | Prompt |
|---|---|---|---|
| 2026-04-23 | `f397f9b` | Initial commit | not recorded |
| 2026-04-23 | `36fdd28` | add gitignore to protect secrets | not recorded |
| 2026-04-23 | `3ee87cc` | day 1: gemini api round-trip works in browser | not recorded |
| 2026-04-23 | `8ab4773` | day 1: add verified ECI checklist data (8 items) | not recorded |
| 2026-04-23 | `ea00772` | day 1: checklist ui with 8 verified eci items and localstorage persistence | not recorded |
| 2026-04-23 | `3ba05e4` | day 1: prompts log with checklist build notes and cors fix | not recorded |
| 2026-04-25 | `6db37c4` | day 3: recover lost work — landing page, readme, prompts log | not recorded |
| 2026-04-28 | `5060337` | day 6: redesign with timeline, EPIC checker, qa, state map, bilingual engine | not recorded |
| 2026-04-28 | `2fc0220` | day 6: remove orphaned test.html | not recorded |
| 2026-04-28 | `dca7e80` | qa: hide section citations in AI responses, friendlier error messages | not recorded |
| 2026-04-29 | `8707b85` | Move Gemini API call to serverless function | not recorded |
| 2026-05-01 | `605a5f1` | assets: add Day 8 screenshots (checklist, qa, map) | not recorded |
| 2026-05-01 | `86953e7` | qa: verify handbook_context against ECI Manual + PIB sources | not recorded |
| 2026-05-01 | `07ace9d` | fix: remove motion.js error, polish README for submission | not recorded |
| 2026-05-01 | `0c7a941` | add blog draft | not recorded |
| 2026-05-02 | `f025b73` | Update qa.html fetch call to only pass userQuestion | not recorded |
| 2026-05-02 | `652ce7a` | fix: complete system prompt data, correct API schema, remove dead config.js | not recorded |
| 2026-05-02 | `41435ee` | i18n: add Hindi translations for redesigned landing page | not recorded |
| 2026-05-02 | `2698a55` | Add missing Hindi translations and update Gemini system prompt in API | not recorded |
| 2026-05-02 | `291730e` | Update dictionary and fix HTML node formatting | not recorded |
| 2026-05-02 | `b8518c7` | Fix case sensitivity and flatten HTML strings in map.html for translation | not recorded |
| 2026-05-02 | `520dc99` | Patch D3 map highlighting for Ladakh using legacy geojson | not recorded |
| 2026-05-02 | `6423bf3` | Update map logic for TopoJSON and modern property keys | not recorded |
| 2026-05-02 | `4d23b40` | Revert to stable GeoJSON and patch Ladakh highlight logic. | not recorded |
| 2026-05-02 | `0cd128e` | Upgrade to stable post-2019 TopoJSON (covid19india) with Ladakh support | not recorded |
| 2026-05-02 | `483590e` | Remove dead menu-btn and divider from map.html header | not recorded |
| 2026-05-02 | `e45c255` | Inject checklist localStorage context into AI prompt | not recorded |
| 2026-05-02 | `4a70870` | Add Google Maps CEO office routing feature | not recorded |
| 2026-05-02 | `9b1964b` | Add CEO office routing UI and async Google Maps script | not recorded |
| 2026-05-02 | `27d1e16` | Polish CEO routing: dark map style, purple route, spinner, zoom, glow | not recorded |
| 2026-05-02 | `6566e87` | Upgrade to async AdvancedMarkerElement with custom purple pin | not recorded |
| 2026-05-02 | `b0c463d` | Add voters.json, real EPIC lookup, and voter AI context injection | not recorded |
| 2026-05-02 | `f104ae8` | Add brand assets: logo.svg, favicon.svg, brand.css — wired to all pages | not recorded |
| 2026-05-02 | `c34e6fb` | Fix api/ structure: move gemini.js to correct location, add maps-config.js | not recorded |
| 2026-05-02 | `3bf4031` | Add vercel.json and .env.example to root | not recorded |
| 2026-05-02 | `ad99cbb` | fix: security, broken context, EPIC disclaimer, GSAP race, consistency | not recorded |
| 2026-05-02 | `a279a61` | Add Hindi map translations, translateDataKeys(), and data-key attributes in showInfo() | not recorded |
| 2026-05-02 | `f20ffeb` | Replace vertical timeline with horizontal grid and add Hindi translations | not recorded |
| 2026-05-02 | `a1e540c` | Remove legacy J&K/Ladakh highlight patch | not recorded |
| 2026-05-02 | `1070d1e` | Add fallback disclaimer for Ladakh map boundary and Hindi translation | not recorded |

## Lab-project upgrade (October 2026)

| Date | Commit | Change | Prompt |
|---|---|---|---|
| 2026-10-08 | `f47af21` | Phase 0: baseline screenshots, lab-spec checklist, screenshot script | Upgrade brief, Phase 0 |
| 2026-10-15 | `af1803e` | Phase 1: truth fixes (EPIC demo lookup, 1:1 Hindi checklist, 12 IDs, journey from checklist progress, map fixes) | Upgrade brief, Phase 1 |
| 2026-10-15 | PHASE2_HASH | Phase 2: plain civic-service UI on Bootstrap, copy and dead-code cleanup | Upgrade brief, Phase 2 |
