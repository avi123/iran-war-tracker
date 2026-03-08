Build the site locally by running `./build.sh` from the iran-war-tracker project root.

This transforms `src/iran-war-goals.jsx` into `docs/index.html` with:
- **JSX pre-compilation** via esbuild (no Babel in production)
- React browser globals (replacing ES module imports)
- UTC build timestamp in the header
- ISO date in JSON-LD structured data (`WebPage` schema)
- Google Analytics (GA4) measurement ID injection
- Static intro section with mission statement and methodology
- SEO meta tags (Open Graph with image, Twitter large image card, canonical URL)
- **Full static content** in noscript block (all 106 goals with status/outcomeNotes) for crawler indexing
- **OG image** generated from `src/og-image-template.svg` (1200x630 PNG)
- **Sitemap** regenerated with `<lastmod>` timestamp
- Resource hints (preconnect, dns-prefetch)
- Copyright in the footer

### Dependencies
- `esbuild` (`/opt/homebrew/bin/esbuild`) — JSX → JS compilation
- `rsvg-convert` (`/opt/homebrew/bin/rsvg-convert`) — SVG → PNG for OG image
- `python3` — runs `src/extract-static.py` for crawler content
- Falls back gracefully if esbuild/rsvg missing (uses Babel, skips OG image)

Report the build output to the user.