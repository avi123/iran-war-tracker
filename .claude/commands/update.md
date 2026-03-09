# Iran War Tracker — Update Cycle

Run a full update cycle: research latest developments, update goals, rebuild, and deploy.

## Phase 1: Research (read-only)

Search for the latest developments across all goal categories. Use web search and news sources to find updates since the last build timestamp shown in `docs/index.html`.

Focus areas (search in parallel):
1. **Nuclear/Missiles**: IAEA updates, strike BDAs, missile/drone counts, new targets
2. **Navy/Air/Strait**: Naval engagements, Hormuz shipping, air defense, tanker attacks
3. **Regime/Proxies**: Leadership status, IRGC, Hezbollah, Houthis, Iraqi militias
4. **Casualties**: US/Israeli/Iranian military + civilian casualty updates (CENTCOM, IDF, Red Crescent, UNICEF)
5. **Political/Diplomatic**: Domestic politics, alliance reactions, UN, ceasefire talks
6. **Economic**: Oil prices, energy disruption, Gulf infrastructure, gas prices
7. **Terrorism/Info war**: Homeland threats, cyber, narrative shifts

Key sources to check:
- CENTCOM press releases
- IDF official channels
- IAEA updates
- PBS, CNN, Al Jazeera, BBC, NPR, Reuters, AP
- FDD, CSIS, War on the Rocks, Alma Center
- Times of Israel, Jerusalem Post
- OSINT accounts (satellite imagery, BDA)

## Phase 2: Present Findings

Before editing any files, present a summary of findings to the user:
- List each goal that has new information
- Show the proposed status/trend/outcomeNote changes
- Flag any NEW goals that should be added
- Flag any goal count changes (update meta descriptions if total changes)
- Ask the user to confirm before proceeding

## Phase 3: Update Goals

Edit `src/iran-war-goals.jsx` with confirmed changes:
- Update `status` if changed (achieved, in progress, at risk, unachievable, tbd)
- Update `trend` if applicable (failing, expanding)
- Update `outcomeNote` with latest facts
- Add new `sources` entries: `{t:"Label",u:"url"}`
- Add new goals/subgoals if warranted

## Phase 4: Build & Deploy

1. Run `./build.sh` from project root
2. Stage: `git add docs/ src/`
3. Commit with message describing what changed (e.g., "Update: Day 8 — missile counts, casualty updates, Hormuz shipping data")
4. Push: `GIT_CONFIG_GLOBAL=/dev/null git push`
5. Switch gh auth back: `/opt/homebrew/bin/gh auth switch --user avi-berkowitz-instacart`

## Important

- Always switch gh auth first: `/opt/homebrew/bin/gh auth switch --user avi123`
- Use `GIT_CONFIG_GLOBAL=/dev/null` for all git commands
- Every claim must have at least one source in the `sources` array
- Keep outcomeNotes factual — no editorializing
- If the total goal count changes, update the meta descriptions in `build.sh` (currently says "106")