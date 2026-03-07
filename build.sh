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
<div id="root"></div>
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

# Inject GA measurement ID (set via environment or default placeholder)
GA_ID="${GA_MEASUREMENT_ID:-G-WDDF5XHR4Q}"
sed -i '' "s/__GA_MEASUREMENT_ID__/$GA_ID/g" "$OUT"

# Report
SRC_SIZE=$(wc -c < "$SRC")
OUT_SIZE=$(wc -c < "$OUT")
echo "Done: src ($SRC_SIZE bytes) → docs/index.html ($OUT_SIZE bytes)"
echo "Built at: $TIMESTAMP"
