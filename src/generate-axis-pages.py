#!/usr/bin/env python3
"""Generate axis briefing pages for the Iran War Goals Tracker.

Reads AXES + GOALS data from iran-war-goals.jsx and generates standalone
static HTML pages at docs/{axis-id}/index.html.

Each axis page is an analytical briefing — not a data dump. Structure:
  - Question as H1
  - Current assessment (summary paragraph)
  - Key indicators (data points that matter)
  - What we're watching (next signals)
  - Supporting goals (relevant subset, collapsed)
  - Navigation to other axes + back to tracker

Usage:
    python3 generate-axis-pages.py <jsx-path> <docs-dir>
"""
import os
import re
import sys
import html
from datetime import datetime

DOMAIN = "https://2026iranwartracker.com"
WAR_START = datetime(2026, 2, 28)

# ═══ JSX Parsing (shared patterns from extract-static.py / generate-weekly-review.py) ═══

def extract_field(obj_text, field_name):
    pattern = rf'{field_name}\s*:\s*"([^"]*)"'
    m = re.search(pattern, obj_text)
    if m:
        return m.group(1)
    pattern = rf"{field_name}\s*:\s*'([^']*)'"
    m = re.search(pattern, obj_text)
    if m:
        return m.group(1)
    return ""

def parse_goal(goal_text):
    goal_id = extract_field(goal_text, 'id')
    name = extract_field(goal_text, 'name')
    status = extract_field(goal_text, 'status')
    trend = extract_field(goal_text, 'trend')
    party = extract_field(goal_text, 'party')
    on_match = re.search(r'outcomeNote\s*:\s*"', goal_text)
    outcome_note = ""
    if on_match:
        start = on_match.end()
        j = start
        while j < len(goal_text):
            if goal_text[j] == '\\' and j + 1 < len(goal_text):
                j += 2
                continue
            if goal_text[j] == '"':
                break
            j += 1
        outcome_note = goal_text[start:j].replace('\\"', '"').replace("\\'", "'")
    if not goal_id or not name:
        return None
    subgoals = []
    sg_match = re.search(r'subgoals\s*:\s*\[', goal_text)
    if sg_match:
        sg_start = sg_match.end() - 1
        depth = 1
        k = sg_start + 1
        while k < len(goal_text) and depth > 0:
            if goal_text[k] == '[':
                depth += 1
            elif goal_text[k] == ']':
                depth -= 1
            k += 1
        sg_text = goal_text[sg_start+1:k-1]
        depth = 0
        obj_start = None
        for j, ch in enumerate(sg_text):
            if ch == '{':
                depth += 1
                if depth == 1:
                    obj_start = j
            elif ch == '}':
                depth -= 1
                if depth == 0 and obj_start is not None:
                    sub_text = sg_text[obj_start:j+1]
                    sub = parse_goal(sub_text)
                    if sub:
                        subgoals.append(sub)
                    obj_start = None
    importance_m = re.search(r'importance\s*:\s*(\d+)', goal_text)
    importance = int(importance_m.group(1)) if importance_m else 3
    goal_type = extract_field(goal_text, 'type')
    return {
        'id': goal_id, 'name': name, 'status': status,
        'trend': trend, 'party': party, 'importance': importance,
        'type': goal_type, 'outcomeNote': outcome_note, 'subgoals': subgoals,
    }

def extract_goals(jsx_text):
    goals_match = re.search(r'const GOALS\s*=\s*\[', jsx_text)
    if not goals_match:
        return []
    goals_start = goals_match.end() - 1
    depth = 1
    i = goals_start + 1
    while i < len(jsx_text) and depth > 0:
        if jsx_text[i] == '[':
            depth += 1
        elif jsx_text[i] == ']':
            depth -= 1
        i += 1
    goals_text = jsx_text[goals_start+1:i-1]
    goals = []
    depth = 0
    obj_start = None
    for j, ch in enumerate(goals_text):
        if ch == '{':
            depth += 1
            if depth == 1:
                obj_start = j
        elif ch == '}':
            depth -= 1
            if depth == 0 and obj_start is not None:
                goal_text = goals_text[obj_start:j+1]
                goal = parse_goal(goal_text)
                if goal:
                    goals.append(goal)
                obj_start = None
    return goals

def extract_axes(jsx_text):
    """Extract AXES array from JSX source."""
    axes_match = re.search(r'const AXES\s*=\s*\[', jsx_text)
    if not axes_match:
        return []
    axes_start = axes_match.end() - 1
    depth = 1
    i = axes_start + 1
    while i < len(jsx_text) and depth > 0:
        if jsx_text[i] == '[':
            depth += 1
        elif jsx_text[i] == ']':
            depth -= 1
        i += 1
    axes_text = jsx_text[axes_start+1:i-1]

    axes = []
    # Split into top-level objects
    depth = 0
    obj_start = None
    for j, ch in enumerate(axes_text):
        if ch == '{':
            depth += 1
            if depth == 1:
                obj_start = j
        elif ch == '}':
            depth -= 1
            if depth == 0 and obj_start is not None:
                obj_text = axes_text[obj_start:j+1]
                axis = parse_axis(obj_text)
                if axis:
                    axes.append(axis)
                obj_start = None
    return axes

def parse_axis(obj_text):
    """Parse a single axis object from JS source."""
    axis_id = extract_field(obj_text, 'id')
    if not axis_id:
        return None

    axis = {
        'id': axis_id,
        'question': extract_field(obj_text, 'question'),
        'slug': extract_field(obj_text, 'slug'),
        'status': extract_field(obj_text, 'status'),
        'statusLabel': extract_field(obj_text, 'statusLabel'),
        'statusColor': extract_field(obj_text, 'statusColor'),
        'keyMetric': extract_field(obj_text, 'keyMetric'),
        'keyMetricLabel': extract_field(obj_text, 'keyMetricLabel'),
        'summary': extract_field(obj_text, 'summary'),
        'seoTitle': extract_field(obj_text, 'seoTitle'),
        'seoDescription': extract_field(obj_text, 'seoDescription'),
        'seoKeywords': extract_field(obj_text, 'seoKeywords'),
        'keyIndicators': [],
        'watching': [],
        'goalIds': [],
    }

    # Extract goalIds array
    gids_match = re.search(r'goalIds\s*:\s*\[', obj_text)
    if gids_match:
        gids_start = gids_match.end()
        gids_end = obj_text.find(']', gids_start)
        if gids_end > 0:
            gids_str = obj_text[gids_start:gids_end]
            axis['goalIds'] = re.findall(r'"([^"]+)"', gids_str)

    # Extract keyIndicators array
    ki_match = re.search(r'keyIndicators\s*:\s*\[', obj_text)
    if ki_match:
        ki_start = ki_match.end() - 1
        depth = 1
        k = ki_start + 1
        while k < len(obj_text) and depth > 0:
            if obj_text[k] == '[': depth += 1
            elif obj_text[k] == ']': depth -= 1
            k += 1
        ki_text = obj_text[ki_start+1:k-1]
        for m in re.finditer(r'\{', ki_text):
            start = m.start()
            d = 0
            j = start
            while j < len(ki_text):
                if ki_text[j] == '{': d += 1
                elif ki_text[j] == '}':
                    d -= 1
                    if d == 0: break
                j += 1
            item = ki_text[start:j+1]
            axis['keyIndicators'].append({
                'label': extract_field(item, 'label'),
                'value': extract_field(item, 'value'),
                'detail': extract_field(item, 'detail'),
                'color': extract_field(item, 'color'),
            })

    # Extract watching array
    w_match = re.search(r'watching\s*:\s*\[', obj_text)
    if w_match:
        w_start = w_match.end() - 1
        depth = 1
        k = w_start + 1
        while k < len(obj_text) and depth > 0:
            if obj_text[k] == '[': depth += 1
            elif obj_text[k] == ']': depth -= 1
            k += 1
        w_text = obj_text[w_start+1:k-1]
        for m in re.finditer(r'\{', w_text):
            start = m.start()
            d = 0
            j = start
            while j < len(w_text):
                if w_text[j] == '{': d += 1
                elif w_text[j] == '}':
                    d -= 1
                    if d == 0: break
                j += 1
            item = w_text[start:j+1]
            axis['watching'].append({
                'text': extract_field(item, 'text'),
                'timeframe': extract_field(item, 'timeframe'),
            })

    return axis

def extract_updated_at(jsx_text):
    m = re.search(r'updatedAt\s*:\s*"([^"]+)"', jsx_text)
    return m.group(1) if m else datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

# ═══ HTML Generation ═══

def status_badge_html(status, trend=""):
    colors = {
        "achieved": "#22C55E", "in progress": "#F59E0B",
        "at risk": "#F87171", "unachievable": "#9CA3AF", "tbd": "#9CA3AF",
    }
    trend_colors = {"failing": "#F87171", "expanding": "#F59E0B"}
    c = colors.get(status, "#9CA3AF")
    badge = f'<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:{c}20;color:{c};border:1px solid {c}40;text-transform:uppercase">{html.escape(status)}</span>'
    if trend and trend in trend_colors:
        tc = trend_colors[trend]
        badge += f' <span style="display:inline-block;padding:1px 5px;border-radius:8px;font-size:8px;font-weight:700;background:{tc}15;color:{tc};border:1px solid {tc}35;text-transform:uppercase">{trend.upper()}</span>'
    return badge

def generate_axis_html(axis, goals, all_axes, updated_at):
    C = {
        'bg': '#0B1120', 'card': '#111B2E', 'cardAlt': '#162035',
        'navy': '#1A2744', 'blue': '#2D5FA0', 'blueLt': '#6AADDB',
        'border': '#243450', 'text': '#D8DFE8', 'textDim': '#7A8FA8',
        'white': '#F0F3F7', 'green': '#22C55E', 'amber': '#F59E0B',
        'red': '#F87171',
    }
    tf_colors = {
        "imminent": ("#EF4444", "#2E1010"),
        "24-48h": ("#F59E0B", "#2E2410"),
        "this week": ("#3B82F6", "#0F1A2E"),
        "open question": ("#9CA3AF", "#1E2228"),
    }

    # Compute day number
    try:
        updated = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
        current_day = (updated.replace(tzinfo=None) - WAR_START).days + 1
    except:
        current_day = 25

    iso_date = datetime.now(tz=__import__('datetime').timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    page_title = axis['seoTitle'] or f"{axis['question']} | Iran War Tracker 2026"
    description = axis['seoDescription'] or axis['summary'][:155]
    keywords = axis['seoKeywords']

    # Filter goals for this axis
    axis_goals = [g for g in goals if g['id'] in axis['goalIds']]

    # Other axes for nav
    other_axes = [a for a in all_axes if a['id'] != axis['id']]

    lines = []
    lines.append('<!DOCTYPE html>')
    lines.append('<html lang="en">')
    lines.append('<head>')
    lines.append('<meta charset="UTF-8">')
    lines.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    lines.append(f'<title>{html.escape(page_title)}</title>')
    lines.append(f'<meta name="description" content="{html.escape(description)}">')
    if keywords:
        lines.append(f'<meta name="keywords" content="{html.escape(keywords)}">')
    lines.append(f'<meta property="og:title" content="{html.escape(page_title)}">')
    lines.append(f'<meta property="og:description" content="{html.escape(description)}">')
    lines.append('<meta property="og:type" content="article">')
    lines.append(f'<meta property="og:url" content="{DOMAIN}{axis["slug"]}">')
    lines.append(f'<meta property="og:image" content="{DOMAIN}/og-image.png">')
    lines.append(f'<meta name="twitter:card" content="summary_large_image">')
    lines.append(f'<meta name="twitter:title" content="{html.escape(page_title)}">')
    lines.append(f'<meta name="twitter:description" content="{html.escape(description)}">')
    lines.append(f'<link rel="canonical" href="{DOMAIN}{axis["slug"]}">')
    lines.append(f'<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#127919;</text></svg>">')

    # JSON-LD
    lines.append(f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{html.escape(page_title)}",
  "dateModified": "{iso_date}",
  "url": "{DOMAIN}{axis['slug']}",
  "isPartOf": {{ "@type": "WebSite", "name": "2026 Iran War Tracker", "url": "{DOMAIN}" }},
  "author": {{ "@type": "Person", "name": "Avi Berkowitz" }},
  "publisher": {{ "@type": "Person", "name": "Avi Berkowitz" }}
}}
</script>''')

    # Google Analytics
    lines.append('''<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WDDF5XHR4Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-WDDF5XHR4Q');
</script>''')

    # Styles
    lines.append(f'''<style>
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background:{C['bg']}; color:{C['text']}; }}
a {{ color:{C['blueLt']}; text-decoration:none; }}
a:hover {{ text-decoration:underline; }}
.container {{ max-width:800px; margin:0 auto; padding:24px; }}
.indicator {{ background:{C['card']}; border:1px solid {C['border']}; border-radius:8px; padding:14px; margin:8px 0; display:flex; gap:12px; align-items:flex-start; }}
.indicator-label {{ font-size:10px; color:{C['textDim']}; letter-spacing:0.8px; text-transform:uppercase; font-weight:700; min-width:100px; padding-top:2px; }}
.indicator-value {{ font-size:14px; font-weight:800; }}
.indicator-detail {{ font-size:12px; color:{C['text']}; line-height:1.5; margin-top:2px; }}
.watch-item {{ display:flex; gap:8px; align-items:flex-start; margin-bottom:10px; }}
.goal-card {{ background:{C['card']}; border:1px solid {C['border']}; border-radius:8px; margin:8px 0; overflow:hidden; }}
.goal-header {{ padding:12px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; }}
.goal-header:hover {{ background:{C['blue']}10; }}
.goal-name {{ font-size:13px; font-weight:700; color:{C['white']}; }}
.goal-outcome {{ padding:0 14px 12px; font-size:12px; color:{C['text']}; line-height:1.6; }}
.subgoal {{ padding:8px 14px 8px 28px; border-top:1px solid {C['border']}30; font-size:12px; }}
.subgoal-name {{ font-weight:600; color:{C['text']}; }}
.subgoal-outcome {{ color:{C['textDim']}; line-height:1.5; margin-top:2px; }}
.nav-other {{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:16px 0; }}
.nav-card {{ display:block; background:{C['card']}; border:1px solid {C['border']}; border-radius:8px; padding:12px; text-decoration:none; transition:all 0.2s; }}
.nav-card:hover {{ border-color:{C['blue']}; text-decoration:none; transform:translateY(-1px); }}
.nav-card-q {{ font-size:13px; font-weight:700; color:{C['white']}; margin-bottom:4px; }}
.nav-card-status {{ font-size:10px; }}
.section {{ margin:28px 0; }}
.section-title {{ font-size:10px; font-weight:700; color:{C['textDim']}; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; padding-bottom:6px; border-bottom:2px solid {C['border']}; }}
details summary {{ cursor:pointer; list-style:none; }}
details summary::-webkit-details-marker {{ display:none; }}
@media (max-width:640px) {{
  .container {{ padding:16px; }}
  .nav-other {{ grid-template-columns:1fr; }}
  .indicator {{ flex-direction:column; gap:4px; }}
  .indicator-label {{ min-width:auto; }}
}}
</style>''')
    lines.append('</head>')
    lines.append('<body>')
    lines.append('<div class="container">')

    # [1] HEADER
    lines.append(f'<header style="margin-bottom:24px">')
    lines.append(f'<div style="margin-bottom:8px"><a href="/" style="font-size:11px;color:{C["textDim"]}">\u2190 Iran War Tracker \u2014 Day {current_day}</a></div>')
    lines.append(f'<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">')
    lines.append(f'<h1 style="font-size:24px;font-weight:800;color:{C["white"]};line-height:1.2;flex:1">{html.escape(axis["question"])}</h1>')
    lines.append(f'<span style="font-size:9px;font-weight:700;padding:3px 8px;border-radius:8px;background:{axis["statusColor"]}20;color:{axis["statusColor"]};border:1px solid {axis["statusColor"]}40;white-space:nowrap">{html.escape(axis["statusLabel"])}</span>')
    lines.append(f'</div>')
    lines.append(f'<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px">')
    lines.append(f'<span style="font-size:28px;font-weight:800;color:{axis["statusColor"]}">{html.escape(axis["keyMetric"])}</span>')
    lines.append(f'<span style="font-size:12px;color:{C["textDim"]}">{html.escape(axis["keyMetricLabel"])}</span>')
    lines.append(f'</div>')
    lines.append(f'</header>')

    # [2] SUMMARY
    lines.append(f'<div class="section">')
    lines.append(f'<div class="section-title">Assessment</div>')
    # Split summary into paragraphs at sentence boundaries (roughly every 2-3 sentences)
    summary = axis['summary']
    lines.append(f'<p style="font-size:14px;line-height:1.7;color:{C["text"]};margin-bottom:12px">{html.escape(summary)}</p>')
    lines.append(f'</div>')

    # [3] KEY INDICATORS
    if axis['keyIndicators']:
        lines.append(f'<div class="section">')
        lines.append(f'<div class="section-title">Key Indicators</div>')
        for ki in axis['keyIndicators']:
            color = ki.get('color', C['text'])
            lines.append(f'<div class="indicator">')
            lines.append(f'<div class="indicator-label">{html.escape(ki["label"])}</div>')
            lines.append(f'<div style="flex:1"><div class="indicator-value" style="color:{color}">{html.escape(ki["value"])}</div>')
            lines.append(f'<div class="indicator-detail">{html.escape(ki["detail"])}</div></div>')
            lines.append(f'</div>')
        lines.append(f'</div>')

    # [4] WATCHING
    if axis['watching']:
        lines.append(f'<div class="section">')
        lines.append(f'<div class="section-title">What We\'re Watching</div>')
        for w in axis['watching']:
            tf = w.get('timeframe', 'open question')
            tf_color, tf_bg = tf_colors.get(tf, ("#9CA3AF", "#1E2228"))
            lines.append(f'<div class="watch-item">')
            lines.append(f'<span style="display:inline-block;padding:2px 5px;border-radius:4px;font-size:8px;font-weight:700;background:{tf_bg};color:{tf_color};border:1px solid {tf_color}40;white-space:nowrap;margin-top:3px;flex-shrink:0">{tf.upper()}</span>')
            lines.append(f'<span style="font-size:12px;line-height:1.5">{html.escape(w["text"])}</span>')
            lines.append(f'</div>')
        lines.append(f'</div>')

    # [5] SUPPORTING GOALS
    if axis_goals:
        lines.append(f'<div class="section">')
        lines.append(f'<div class="section-title">Supporting Goals ({sum(1 + len(g.get("subgoals", [])) for g in axis_goals)} tracked)</div>')
        for goal in axis_goals:
            status_html = status_badge_html(goal['status'], goal.get('trend', ''))
            lines.append(f'<details class="goal-card">')
            lines.append(f'<summary class="goal-header">')
            lines.append(f'<span class="goal-name">{html.escape(goal["name"])}</span>')
            lines.append(f'<span>{status_html}</span>')
            lines.append(f'</summary>')
            if goal.get('outcomeNote'):
                lines.append(f'<div class="goal-outcome">{html.escape(goal["outcomeNote"])}</div>')
            for sg in goal.get('subgoals', []):
                sg_status = status_badge_html(sg['status'], sg.get('trend', ''))
                lines.append(f'<div class="subgoal">')
                lines.append(f'<div style="display:flex;justify-content:space-between;align-items:center">')
                lines.append(f'<span class="subgoal-name">{html.escape(sg["name"])}</span>')
                lines.append(f'<span>{sg_status}</span>')
                lines.append(f'</div>')
                if sg.get('outcomeNote'):
                    lines.append(f'<div class="subgoal-outcome">{html.escape(sg["outcomeNote"])}</div>')
                lines.append(f'</div>')
            lines.append(f'</details>')
        lines.append(f'</div>')

    # [6] OTHER AXES NAV
    lines.append(f'<div class="section">')
    lines.append(f'<div class="section-title">Other Axes</div>')
    lines.append(f'<div class="nav-other">')
    for other in other_axes:
        lines.append(f'<a href="{other["slug"]}" class="nav-card" style="border-top:3px solid {other["statusColor"]}">')
        lines.append(f'<div class="nav-card-q">{html.escape(other["question"])}</div>')
        lines.append(f'<div class="nav-card-status"><span style="color:{other["statusColor"]};font-weight:700">{html.escape(other["keyMetric"])}</span> <span style="color:{C["textDim"]}">{html.escape(other["keyMetricLabel"])}</span></div>')
        lines.append(f'</a>')
    lines.append(f'</div>')
    lines.append(f'</div>')

    # [7] FOOTER
    lines.append(f'<footer style="border-top:1px solid {C["border"]};padding-top:16px;margin-top:24px;display:flex;justify-content:space-between;align-items:center">')
    lines.append(f'<a href="/" style="padding:8px 16px;border:1px solid {C["border"]};border-radius:6px;font-size:13px">\u2190 Back to Live Tracker</a>')
    lines.append(f'<span style="font-size:10px;color:{C["textDim"]}">Updated {iso_date[:10]}</span>')
    lines.append(f'</footer>')

    lines.append('</div>')  # container
    lines.append('</body>')
    lines.append('</html>')

    return '\n'.join(lines)


def main():
    if len(sys.argv) < 3:
        print("Usage: generate-axis-pages.py <jsx-path> <docs-dir>")
        sys.exit(1)

    jsx_path = sys.argv[1]
    docs_dir = sys.argv[2]

    with open(jsx_path, 'r') as f:
        jsx_text = f.read()

    axes = extract_axes(jsx_text)
    goals = extract_goals(jsx_text)
    updated_at = extract_updated_at(jsx_text)

    if not axes:
        print("WARNING: No AXES found in JSX source")
        return

    print(f"  Found {len(axes)} axes: {', '.join(a['id'] for a in axes)}")

    for axis in axes:
        axis_dir = os.path.join(docs_dir, axis['id'])
        os.makedirs(axis_dir, exist_ok=True)

        page_html = generate_axis_html(axis, goals, axes, updated_at)
        out_path = os.path.join(axis_dir, 'index.html')
        with open(out_path, 'w') as f:
            f.write(page_html)

        goal_count = sum(1 + len(g.get('subgoals', []))
                        for g in goals if g['id'] in axis['goalIds'])
        print(f"  Generated {axis['slug']} ({goal_count} goals, {len(axis['keyIndicators'])} indicators)")


if __name__ == '__main__':
    main()
