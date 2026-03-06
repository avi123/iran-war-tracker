# Iran War Goals Tracker

An analytical framework tracking 106 goals across the 2026 US-Israel-Iran war, organized by military operations, regime stability, regional escalation, diplomatic dynamics, civilian impact, and economic effects.

## What This Tracks

The tracker monitors stated and implied objectives from all parties — the US, Israel, Iran, and regional actors — and assesses progress against each using a structured methodology:

- **106 goals** (19 parent categories, 87 sub-goals) across both sides of the conflict
- **5 status levels**: achieved, in progress, at risk, unachievable, TBD
- **Trend analysis** for at-risk goals: failing, expanding, or insufficient data
- **Three simultaneous verdicts**: what's succeeding, what's expanding, what's failing
- **8 historical analogues** with fit scores (Kosovo 1999, Iraq 2003, etc.)
- **Source links** on 50+ goals to primary reporting

## Methodology

Every update cycle follows a structured research protocol:

1. **Twitter/X sweep** via TweetSave — CTP-ISW footnote harvesting, targeted account monitoring
2. **Tiered source checking** — Tier 1 (CENTCOM, IDF, FDD, ISW), Tier 2 (major outlets), Tier 3 (specialized)
3. **Two-source rule** — no status change on a single source
4. **7 bias checks** applied every cycle (Iraq 2003 prior, source diet balance, asymmetric skepticism, timeframe, narrative gravity, expanding ≠ failing, unachievable strict test)
5. **Hebrew source integration** — Israeli outlets checked before English translations (2-6hr lead time)

Full methodology documented in [protocol.md](protocol.md).

## Analytical Stance

This tracker attempts to present the war as it is, not as any party wants it to be. The three-verdict structure exists because the data genuinely supports contradictory readings: the military campaign is succeeding by most operational metrics while the political-strategic framework is failing by most governance metrics. Both are true simultaneously.

The framework has been iteratively corrected for identified biases, including over-application of the Iraq 2003 analogue and asymmetric skepticism toward coalition claims.

## Technical

Single-page React application, no backend, no database. All data lives in the JSX source file. Built to standalone HTML with React/Babel loaded via CDN.

```bash
# Build
chmod +x build.sh
./build.sh

# Deploys via GitHub Pages from /docs
```

## Live Site

[Link will be added when deployed]

## Disclaimer

This is an independent analytical project. It is not affiliated with any government, military, or intelligence organization. All sources are open-source. Assessments represent analytical judgment, not insider knowledge. The tracker distinguishes between confirmed facts and speculation — look for explicit language marking this distinction in goal notes.
