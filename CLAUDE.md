# Iran War Goals Tracker — Claude Code Project

## What This Is

An analytical framework tracking 106 goals (19 parent + 87 sub-goals) across the 2026 US-Israel-Iran war. Built as a React component (JSX) that renders as a standalone HTML page via GitHub Pages.

The tracker is maintained by Avi (the project owner) with Claude providing intelligence analysis, source integration, and framework updates. Avi challenges analytical assumptions and provides editorial direction. Claude executes research, integrates sources, updates the tracker, and deploys.

## File Structure

```
iran-war-tracker/
├── CLAUDE.md              ← You are here. Read this first every session.
├── protocol.md            ← Research protocol v2.5 (source tiers, bias checks, Twitter sweep)
├── src/
│   └── iran-war-goals.jsx ← THE SOURCE OF TRUTH. Edit this file.
├── docs/
│   └── index.html         ← Built from src/. GitHub Pages serves this. Never edit directly.
├── data/                  ← Optional: raw data snapshots, tweet archives
├── build.sh               ← Transforms JSX → browser-compatible HTML
└── README.md              ← Public-facing project description
```

## Critical Rules

1. **src/iran-war-goals.jsx is the source of truth.** All edits happen here.
2. **docs/index.html is generated.** Run `./build.sh` after every edit. Never edit directly.
3. **The JSX uses `import`/`export default`** for Claude.ai artifact compatibility. The build script transforms these to browser globals.
4. **Read protocol.md before every update cycle.** It contains source tiers, bias checks, and the Twitter sweep procedure.
5. **Two-source rule:** Never change a goal's status based on a single source.
6. **Unachievable is strict:** "Nobody is doing it" ≠ "nobody CAN do it." Only 4 goals qualify (nuke-knowledge, cas-zero, dom-midterm, dom-predict).
7. **Git commit after every update cycle** with message format: `Day X [morning/evening]: [key changes]`

## How To Run An Update Cycle

### Step 0: Read Protocol
```
cat protocol.md
```
Review current data series, fault lines, bias checks.

### Step 1: Twitter Sweep (~15 min)
The sweep uses web search to find tweet URLs, then TweetSave MCP to fetch content.

1. **CTP-ISW Footnote Harvest:**
   - Search: `criticalthreats.org Iran update [latest date]`
   - Fetch the report, extract x.com URLs from footnotes
   - Batch-fetch top 10 via TweetSave

2. **Targeted Account Searches (4-5 searches):**
   - `sentdefender Iran strike [today]`
   - `BarakRavid Iran [today]`
   - `ELINTNews Iran [today]`
   - `CENTCOM Iran x.com [today]`
   - `UK_MTO UKMTO x.com [today]`

3. **Batch Fetch:** Collect x.com URLs → TweetSave batch (10 per call)

4. **Standing Pulls:** @UK_MTO daily summary, @modgovae UAE interception data, @netblocks blackout status

### Step 2: Tier 1 + Tier 2 Sources
Search for latest developments across:
- **Tier 1:** CENTCOM, IDF, Alma Center, FDD, ISW/CTP
- **Tier 2:** CNN, CNBC, CBS, AJZ, NPR, Reuters, IranIntl, ToI, Haaretz, Euronews, WaPo, Al Monitor

### Step 3: Update Goals
Edit `src/iran-war-goals.jsx`:
- Update `outcomeNote` fields with new intelligence
- Add source links: `sources:[{t:"Name",u:"URL"}]`
- Change `status` only with 2+ sources
- Assign/change `trend` (failing/expanding/no tag) for at-risk goals

### Step 4: Run 7 Bias Checks
1. Iraq 2003 prior check — am I over-applying it?
2. Source diet balance — hawkish + skeptical both represented?
3. Asymmetric skepticism — equal standards for all sides?
4. Timeframe — Kosovo = 78 days, don't judge Day 7 by Week 8 standards
5. Narrative gravity — resist coherent story when data is mixed
6. Expanding ≠ failing — scope growth is analytically ambiguous
7. Unachievable strict test — could ANY realistic course correction make this possible?

### Step 5: Update Three Verdicts
The tracker has three simultaneous readings at the bottom:
- **Succeeding** (green) — what's working
- **Expanding** (amber) — scope growing, analytically ambiguous
- **Failing** (red) — only the 19 failing-trend goals

### Step 6: Build + Deploy
```bash
./build.sh
git add -A
git commit -m "Day X evening: [summary]"
git push
```

## Build Script

Run `./build.sh` to transform `src/iran-war-goals.jsx` → `docs/index.html`.

The transformation:
- `import { useState } from "react"` → `const { useState } = React;`
- `export default function App()` → `function IranWarGoalsTracker()`
- Wraps in HTML boilerplate with React/Babel CDN scripts

## Key Analytical Framework

### Status Values
- **achieved** (green) — confirmed done
- **in progress** (blue) — active, on track
- **at risk** (amber) — threatened, may fail
- **unachievable** (red) — structurally impossible (strict test: 4 goals only)
- **tbd** (gray) — insufficient data

### Trend Tags (at-risk goals only)
- **failing** — current approach demonstrably not working (19 goals)
- **expanding** — scope growing, ambiguous signal (30 goals)
- **no tag** — insufficient signal (7 goals, mostly behind Iran's internet blackout)

### Historical Analogues
8 priors tracked with fit scores. Kosovo 1999 (HIGH) is the best fit. Iraq 2003 (MEDIUM) is the most over-applied.

## Source Reliability Notes
- **sentdefender**: HIGH volume, MEDIUM reliability. Retracted F-15E claim Mar 5. Verify against CENTCOM.
- **Barak Ravid**: HIGH reliability. Hebrew tweets 2-6hr ahead of English Axios articles.
- **UAE MOD (@modgovae)**: Official interception data by weapon type. Most precise Gulf figures.
- **UKMTO (@UK_MTO)**: Authoritative maritime incident tracker. Pull daily for Hormuz data.
- **CTP-ISW**: Gold standard analysis. Footnotes = curated tweet URL database.

## Current State (update this section each cycle)

**Last updated:** Day 7 / Hour 180 / March 6, 2026 afternoon
**Distribution:** 14 achieved / 29 in progress / 56 at risk (19F 30E 7 untagged) / 4 unachievable / 3 tbd
**Key figures:** 1,332+ dead (Red Crescent), 181 children (UNICEF), BMs ↓90%, drones ↓83% but surging at UAE (1,072 cumulative), $891M/day, CENTCOM planning 100 days
**Active fault lines:** MIGA/unconditional surrender, 100-day planning vs 4-5wk public timeline, drone surge, DFC insurance fiction, backchannel dismissed ("bull****"), Italy calling strikes illegal while sending destroyer

## Avi's Preferences
- Concise, direct prompts. Appreciates detailed, well-structured responses.
- Values prediction accuracy assessment — not just tracking events but evaluating prior reasoning.
- Distinguishes confirmed facts from speculation. Make this distinction explicit.
- Challenges analytical bias. Expects pushback to be honest, not defensive.
- When technical issues arise, prefers extracting a prompt spec and restarting clean.
