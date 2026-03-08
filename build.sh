#!/usr/bin/env bash
set -euo pipefail

# Iran War Goals Tracker — Build Script
# Transforms src/iran-war-goals.jsx → docs/index.html
# The JSX uses import/export for Claude.ai artifact compatibility.
# This script converts those to browser globals for standalone HTML.
#
# Dependencies:
#   - esbuild (brew install esbuild) — JSX pre-compilation
#   - rsvg-convert (brew install librsvg) — OG image generation
#   - python3 — static content extraction for crawlers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/src/iran-war-goals.jsx"
OUT="$SCRIPT_DIR/docs/index.html"
OG_SVG="$SCRIPT_DIR/src/og-image-template.svg"
OG_PNG="$SCRIPT_DIR/docs/og-image.png"
EXTRACT_PY="$SCRIPT_DIR/src/extract-static.py"

if [ ! -f "$SRC" ]; then
    echo "ERROR: Source file not found: $SRC"
    exit 1
fi

echo "Building docs/index.html from src/iran-war-goals.jsx..."

# Get timestamps
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
ISO_DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
BUILD_YEAR=$(date -u '+%Y')
GA_ID="${GA_MEASUREMENT_ID:-G-WDDF5XHR4Q}"

# ── Step 1: Pre-compile JSX → JS via esbuild ──
ESBUILD="/opt/homebrew/bin/esbuild"
TMPJSX=$(mktemp /tmp/iran-tracker-XXXXXX.jsx)
trap "rm -f $TMPJSX" EXIT

# Transform imports for browser
sed 's/^import { useState } from "react";/const { useState } = React;/' "$SRC" \
    | sed 's/^export default function App() {/function IranWarGoalsTracker() {/' \
    > "$TMPJSX"

# Compile JSX → JS (eliminates need for Babel in browser)
if [ -x "$ESBUILD" ]; then
    COMPILED_JS=$("$ESBUILD" "$TMPJSX" --bundle=false --jsx=transform 2>&1)
    echo "  JSX pre-compiled via esbuild"
else
    echo "WARNING: esbuild not found at $ESBUILD — falling back to Babel in browser"
    COMPILED_JS=$(cat "$TMPJSX")
fi

# ── Step 2: Generate OG image ──
RSVG="/opt/homebrew/bin/rsvg-convert"
if [ -x "$RSVG" ] && [ -f "$OG_SVG" ]; then
    "$RSVG" -w 1200 -h 630 "$OG_SVG" -o "$OG_PNG" 2>/dev/null
    echo "  OG image generated (1200x630)"
else
    echo "  Skipping OG image (rsvg-convert or template not found)"
fi

# ── Step 3: Extract static content for crawlers ──
NOSCRIPT_CONTENT=""
if [ -f "$EXTRACT_PY" ]; then
    NOSCRIPT_CONTENT=$(python3 "$EXTRACT_PY" "$SRC" 2>/dev/null || echo "")
    if [ -n "$NOSCRIPT_CONTENT" ]; then
        echo "  Static content extracted for crawlers"
    fi
fi

# ── Step 4: Determine script tag type ──
if [ -x "$ESBUILD" ]; then
    SCRIPT_OPEN='<script>'
else
    SCRIPT_OPEN='<script type="text/babel">'
fi

# ── Step 5: Assemble HTML ──

# Write header
cat > "$OUT" << HTMLHEADER
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iran War Goals Tracker — 2026 US-Israel-Iran Conflict Analysis</title>
<meta name="description" content="Track the 2026 US-Israel-Iran war: 106 sourced goals across military, regime, diplomatic, and economic dimensions. Updated multiple times daily.">
<meta property="og:title" content="Iran War Goals Tracker — 2026 US-Israel-Iran Conflict Analysis">
<meta property="og:description" content="106 goals tracked across the 2026 US-Israel-Iran war. Military, diplomatic, economic, and humanitarian analysis updated multiple times daily.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://2026iranwartracker.com">
<meta property="og:image" content="https://2026iranwartracker.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Iran War Goals Tracker — 2026">
<meta name="twitter:description" content="106 goals tracked across the 2026 US-Israel-Iran war. Updated multiple times daily.">
<meta name="twitter:image" content="https://2026iranwartracker.com/og-image.png">
<link rel="canonical" href="https://2026iranwartracker.com">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#127919;</text></svg>">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Iran War Goals Tracker",
  "headline": "Iran War Goals Tracker — 2026 US-Israel-Iran Conflict Analysis",
  "url": "https://2026iranwartracker.com",
  "description": "Analytical framework tracking 106 goals across the 2026 US-Israel-Iran war. Updated multiple times daily.",
  "specialty": "Conflict Analysis",
  "datePublished": "2026-03-01T00:00:00Z",
  "dateModified": "$ISO_DATE",
  "publisher": { "@type": "Person", "name": "Avi Berkowitz" },
  "author": { "@type": "Person", "name": "Avi Berkowitz" }
}
</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=$GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '$GA_ID');
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
HTMLHEADER

# Add Babel CDN only if esbuild not available
if [ ! -x "$ESBUILD" ]; then
    echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"></script>' >> "$OUT"
fi

cat >> "$OUT" << 'HTMLSTATIC'
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F172A; color: #E2E8F0; }
#build-timestamp { position:fixed; top:0; left:0; right:0; background:#1E293B; color:#94A3B8; font-size:11px; font-family:monospace; padding:3px 12px; text-align:right; z-index:9999; border-bottom:1px solid #334155; }
#root { padding-top: 24px; }
</style>
</head>
<body>
HTMLSTATIC

echo "<div id=\"build-timestamp\">Generated: $TIMESTAMP</div>" >> "$OUT"

cat >> "$OUT" << 'HTMLINTRO'

<h1 style="max-width:900px;margin:0 auto;padding:28px 24px 0;color:#E2E8F0;font-size:22px;font-weight:700;">Iran War Goals Tracker — 2026 US-Israel-Iran Conflict</h1>
<div id="intro-toggle" style="max-width:900px;margin:0 auto;padding:12px 24px 0;">
  <button onclick="var el=document.getElementById('static-intro');var show=el.style.display==='none';el.style.display=show?'block':'none';this.textContent=show?'Hide: About This Tracker':'About This Tracker';try{localStorage.setItem('intro-dismissed',show?'0':'1')}catch(e){}" style="background:none;border:1px solid #475569;color:#4888CC;font-size:13px;cursor:pointer;padding:5px 14px;border-radius:4px;font-family:inherit;" onmouseenter="this.style.borderColor='#64748B';this.style.color='#60A5FA'" onmouseleave="this.style.borderColor='#475569';this.style.color='#4888CC'">Hide: About This Tracker</button>
</div>
<article id="static-intro" style="max-width:900px;margin:0 auto;padding:16px 24px 0;color:#94A3B8;font-size:13px;line-height:1.7;">
  <h2 style="color:#E2E8F0;font-size:18px;margin-bottom:12px;">About This Tracker</h2>
  <p style="margin-bottom:10px;">
    In an era of constantly shifting headlines and highly partisan coverage, it can be difficult to answer a simple question: <em style="color:#E2E8F0;">how is the war actually going?</em> Cable news picks sides. Social media amplifies noise. The facts get buried under spin.
  </p>
  <p style="margin-bottom:10px;">
    The <strong style="color:#E2E8F0;">Iran War Goals Tracker</strong> cuts through that noise. We define <strong style="color:#E2E8F0;">106 concrete strategic goals</strong> for the United States, Israel, and opposing parties across the 2026 conflict &mdash; then track each one against a diverse set of sources to extract what actually matters. No editorializing. No cheerleading. Just structured analysis of what's working, what's failing, and what's expanding beyond anyone's control.
  </p>
  <p style="margin-bottom:10px;">
    Goals span <strong style="color:#E2E8F0;">military operations</strong> (nuclear, missile, naval, air superiority), <strong style="color:#E2E8F0;">regime dynamics</strong> (leadership decapitation, IRGC cohesion, succession), <strong style="color:#E2E8F0;">regional escalation</strong> (Hezbollah, Houthis, Iraqi militias, Strait of Hormuz), <strong style="color:#E2E8F0;">diplomatic dimensions</strong> (domestic politics, alliance cohesion, great power intervention), and <strong style="color:#E2E8F0;">economic impacts</strong> (oil prices, energy disruption, Gulf infrastructure).
  </p>
  <p style="margin-bottom:10px;">
    Every claim is sourced to at least one verifiable report &mdash; from the IAEA, CENTCOM, PBS, CNN, Al Jazeera, Washington Post, FDD, Alma Center, and dozens of others. The tracker is updated multiple times daily as the conflict evolves.
  </p>
  <details style="margin-bottom:16px;">
    <summary style="cursor:pointer;color:#4888CC;font-weight:600;">Methodology &amp; limitations</summary>
    <p style="margin-top:8px;">
      This tracker uses a &ldquo;Two Generals Framework&rdquo; &mdash; assessing goals from the perspectives of US CENTCOM and the IDF, while also tracking goals of opposing parties. Assessments are based exclusively on publicly available information: official government statements, verified journalist reporting, OSINT analysis, and institutional reports (IAEA, UNICEF, etc.). Fog of war applies. Battle damage assessments (BDA) are often unverifiable. Casualty figures are sourced to specific organizations (Red Crescent, UNICEF, Alma Center) and may lag reality. This tracker aims for analytical rigor and source transparency, not advocacy.
    </p>
  </details>
</article>
<script>try{if(localStorage.getItem('intro-dismissed')==='1'){document.getElementById('static-intro').style.display='none';document.querySelector('#intro-toggle button').textContent='About This Tracker'}}catch(e){}</script>

<div id="root"></div>

<noscript>
HTMLINTRO

# Inject static content for crawlers
if [ -n "$NOSCRIPT_CONTENT" ]; then
    echo "$NOSCRIPT_CONTENT" >> "$OUT"
else
    # Fallback: basic category list
    cat >> "$OUT" << 'NOSCRIPT_FALLBACK'
  <div style="max-width:900px;margin:0 auto;padding:24px;color:#E2E8F0;">
    <h2>Iran War Goals Tracker — 2026</h2>
    <p>This interactive tracker requires JavaScript to display 106 goals across the 2026 US-Israel-Iran conflict. Enable JavaScript for the full interactive experience.</p>
  </div>
NOSCRIPT_FALLBACK
fi

echo "</noscript>" >> "$OUT"

# Write the script tag and compiled JS
echo "" >> "$OUT"
echo "$SCRIPT_OPEN" >> "$OUT"
echo "$COMPILED_JS" >> "$OUT"

# Append the React render call and closing tags
cat >> "$OUT" << HTMLFOOTER
ReactDOM.render(React.createElement(IranWarGoalsTracker), document.getElementById('root'));
</script>
<footer style="text-align:center;padding:16px;font-size:11px;color:#475569;font-family:monospace;border-top:1px solid #1E293B;">&copy; $BUILD_YEAR Avi Berkowitz</footer>
</body>
</html>
HTMLFOOTER

# ── Step 6: Regenerate sitemap with lastmod ──
cat > "$SCRIPT_DIR/docs/sitemap.xml" << SITEMAP
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://2026iranwartracker.com/</loc>
    <lastmod>$ISO_DATE</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
SITEMAP

# Report
SRC_SIZE=$(wc -c < "$SRC")
OUT_SIZE=$(wc -c < "$OUT")
echo "Done: src ($SRC_SIZE bytes) → docs/index.html ($OUT_SIZE bytes)"
echo "Built at: $TIMESTAMP"
