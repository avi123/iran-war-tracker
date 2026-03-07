#!/usr/bin/env bash
set -euo pipefail

# Iran War Goals Tracker — Build Script
# Transforms src/iran-war-goals.jsx → docs/index.html
# The JSX uses import/export for Claude.ai artifact compatibility.
# This script converts those to browser globals for standalone HTML.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/src/iran-war-goals.jsx"
OUT="$SCRIPT_DIR/docs/index.html"

if [ ! -f "$SRC" ]; then
    echo "ERROR: Source file not found: $SRC"
    exit 1
fi

echo "Building docs/index.html from src/iran-war-goals.jsx..."

# Read JSX source
JSX_CONTENT=$(cat "$SRC")

# Transform for browser:
# 1. import { useState } from "react" → const { useState } = React;
# 2. export default function App() → function IranWarGoalsTracker()
BROWSER_JSX=$(echo "$JSX_CONTENT" \
    | sed 's/^import { useState } from "react";/const { useState } = React;/' \
    | sed 's/^export default function App() {/function IranWarGoalsTracker() {/')

# Get current timestamp for the title
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')

# Write the HTML wrapper
cat > "$OUT" << 'HTMLHEADER'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iran War Goals Tracker — 2026 US-Israel-Iran Conflict Analysis</title>
<meta name="description" content="Analytical framework tracking 106 goals across the 2026 US-Israel-Iran war. Military operations, regime stability, regional escalation, diplomatic dynamics, and economic impacts. Updated multiple times daily.">
<meta property="og:title" content="Iran War Goals Tracker — 2026">
<meta property="og:description" content="106 goals tracked across the 2026 US-Israel-Iran war. Military, diplomatic, economic, and humanitarian analysis updated multiple times daily.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://2026iranwartracker.com">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Iran War Goals Tracker — 2026">
<meta name="twitter:description" content="106 goals tracked across the 2026 US-Israel-Iran war. Updated multiple times daily.">
<link rel="canonical" href="https://2026iranwartracker.com">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Iran War Goals Tracker",
  "url": "https://2026iranwartracker.com",
  "description": "Analytical framework tracking 106 goals across the 2026 US-Israel-Iran war. Updated multiple times daily.",
  "applicationCategory": "News & Analysis",
  "operatingSystem": "Web",
  "author": { "@type": "Person", "name": "avi123" },
  "dateModified": "__BUILD_ISO_DATE__"
}
</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=__GA_MEASUREMENT_ID__"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '__GA_MEASUREMENT_ID__');
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"></script>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F172A; color: #E2E8F0; }
#build-timestamp { position:fixed; top:0; left:0; right:0; background:#1E293B; color:#94A3B8; font-size:11px; font-family:monospace; padding:3px 12px; text-align:right; z-index:9999; border-bottom:1px solid #334155; }
#root { padding-top: 24px; }
</style>
</head>
<body>
<div id="build-timestamp">Generated: __BUILD_TIMESTAMP__</div>

<article id="static-intro" style="max-width:900px;margin:0 auto;padding:32px 24px 0;color:#94A3B8;font-size:13px;line-height:1.7;">
  <h2 style="color:#E2E8F0;font-size:18px;margin-bottom:12px;">What is this?</h2>
  <p style="margin-bottom:10px;">
    The Iran War Goals Tracker is an independent analytical framework tracking <strong style="color:#E2E8F0;">106 strategic goals</strong> across the 2026 US-Israel-Iran conflict. Each goal is assessed for importance, achievability, and current status based on open-source intelligence from verified reporting.
  </p>
  <p style="margin-bottom:10px;">
    Goals span <strong style="color:#E2E8F0;">military operations</strong> (nuclear, missile, naval, air superiority), <strong style="color:#E2E8F0;">regime dynamics</strong> (leadership decapitation, IRGC cohesion, succession), <strong style="color:#E2E8F0;">regional escalation</strong> (Hezbollah, Houthis, Iraqi militias, Strait of Hormuz), <strong style="color:#E2E8F0;">diplomatic dimensions</strong> (domestic politics, alliance cohesion, great power intervention), and <strong style="color:#E2E8F0;">economic impacts</strong> (oil prices, energy disruption, Gulf infrastructure).
  </p>
  <p style="margin-bottom:10px;">
    Every claim is sourced to at least one verifiable report from outlets including the IAEA, CENTCOM, PBS, CNN, Al Jazeera, Washington Post, FDD, Alma Center, and others. The tracker is updated multiple times daily as the conflict evolves.
  </p>
  <details style="margin-bottom:16px;">
    <summary style="cursor:pointer;color:#4888CC;font-weight:600;">Methodology &amp; limitations</summary>
    <p style="margin-top:8px;">
      This tracker uses a "Two Generals Framework" — assessing goals from the perspectives of US CENTCOM and the IDF, while also tracking goals of opposing parties. Assessments are based exclusively on publicly available information: official government statements, verified journalist reporting, OSINT analysis, and institutional reports (IAEA, UNICEF, etc.). Fog of war applies. Battle damage assessments (BDA) are often unverifiable. Casualty figures are sourced to specific organizations (Red Crescent, UNICEF, Alma Center) and may lag reality. The tracker aims for analytical rigor and source transparency, not advocacy.
    </p>
  </details>
</article>

<div id="root"></div>

<noscript>
  <div style="max-width:900px;margin:0 auto;padding:24px;color:#E2E8F0;">
    <h1>Iran War Goals Tracker — 2026</h1>
    <p>This interactive tracker requires JavaScript to display 106 goals across the 2026 US-Israel-Iran conflict.</p>
    <h2>Goal Categories</h2>
    <ul>
      <li><strong>Nuclear</strong>: Eliminate Iran's nuclear weapons capability (Natanz, Fordow, Isfahan, SPND)</li>
      <li><strong>Missiles &amp; Drones</strong>: Destroy missile launch sites, production, mobile launchers, drone factories</li>
      <li><strong>Regime</strong>: Leadership decapitation, IRGC cohesion, succession, internal repression</li>
      <li><strong>Navy</strong>: Destroy Iranian naval forces, submarine threat, anti-ship missiles</li>
      <li><strong>Strait of Hormuz</strong>: Keep shipping lanes open, escort operations, insurance, energy crisis</li>
      <li><strong>Air Superiority</strong>: Air defense destruction, stealth operations, electronic warfare</li>
      <li><strong>Hezbollah</strong>: Deterrence, leadership strikes, Lebanon operations</li>
      <li><strong>Proxy Network</strong>: Houthis, Iraqi militias, Kurdish opposition</li>
      <li><strong>Casualties</strong>: US, Israeli, and Iranian civilian casualties tracked separately</li>
      <li><strong>Political</strong>: Domestic support, war powers, alliance cohesion, great power intervention</li>
      <li><strong>Information War</strong>: Justification narrative, school strikes, Araghchi messaging</li>
      <li><strong>Scope &amp; Duration</strong>: Timeline, theater expansion, exit criteria</li>
      <li><strong>Energy Markets</strong>: Oil prices, European gas, Iraqi oil, US gas prices</li>
      <li><strong>Gulf Protection</strong>: Air defense, energy infrastructure, civilian safety</li>
      <li><strong>Terrorism</strong>: Homeland threats, global retaliation, cyberattacks</li>
    </ul>
    <p>Enable JavaScript for the full interactive experience with sourced claims, filtering, and real-time status tracking.</p>
  </div>
</noscript>

<script type="text/babel">
HTMLHEADER

# Append the transformed JSX
echo "$BROWSER_JSX" >> "$OUT"

# Append the React render call and closing tags
cat >> "$OUT" << 'HTMLFOOTER'
ReactDOM.render(React.createElement(IranWarGoalsTracker), document.getElementById('root'));
</script>
<footer style="text-align:center;padding:16px;font-size:11px;color:#475569;font-family:monospace;border-top:1px solid #1E293B;">&copy; __BUILD_YEAR__ avi123</footer>
</body>
</html>
HTMLFOOTER

# Inject timestamp and year
sed -i '' "s/__BUILD_TIMESTAMP__/$TIMESTAMP/g" "$OUT"
sed -i '' "s/__BUILD_YEAR__/$(date -u '+%Y')/g" "$OUT"

# Inject ISO date for structured data
ISO_DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
sed -i '' "s/__BUILD_ISO_DATE__/$ISO_DATE/g" "$OUT"

# Inject GA measurement ID (set via environment or default placeholder)
GA_ID="${GA_MEASUREMENT_ID:-G-WDDF5XHR4Q}"
sed -i '' "s/__GA_MEASUREMENT_ID__/$GA_ID/g" "$OUT"

# Report
SRC_SIZE=$(wc -c < "$SRC")
OUT_SIZE=$(wc -c < "$OUT")
echo "Done: src ($SRC_SIZE bytes) → docs/index.html ($OUT_SIZE bytes)"
echo "Built at: $TIMESTAMP"
