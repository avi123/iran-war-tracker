#!/usr/bin/env python3
"""Generate weekly review pages for the Iran War Goals Tracker.

Diffs goal data between week boundaries using git history,
then generates standalone static HTML pages at docs/week-N/index.html.

Usage:
    python3 generate-weekly-review.py [--all] [--week N]
"""
import os
import re
import sys
import html
import json
import subprocess
from datetime import datetime, timedelta

WAR_START = datetime(2026, 2, 28)
DOMAIN = "https://2026iranwartracker.com"
JSX_PATH = "src/iran-war-goals.jsx"
DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ═══ JSX Parsing (ported from extract-static.py) ═══

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
    return {
        'id': goal_id, 'name': name, 'status': status,
        'trend': trend, 'party': party,
        'outcomeNote': outcome_note, 'subgoals': subgoals,
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

def extract_highlights(jsx_text):
    highlights_match = re.search(r'const HIGHLIGHTS\s*=\s*\{', jsx_text)
    if not highlights_match:
        return []
    kd_start = jsx_text.find('keyDevelopments:', highlights_match.start())
    if kd_start == -1:
        return []
    arr_start = jsx_text.find('[', kd_start)
    if arr_start == -1:
        return []
    depth = 1
    i = arr_start + 1
    while i < len(jsx_text) and depth > 0:
        if jsx_text[i] == '[':
            depth += 1
        elif jsx_text[i] == ']':
            depth -= 1
        i += 1
    arr_text = jsx_text[arr_start+1:i-1]
    items = []
    for m in re.finditer(r'\{\s*text\s*:', arr_text):
        start = m.start()
        d = 0
        j = start
        while j < len(arr_text):
            if arr_text[j] == '{':
                d += 1
            elif arr_text[j] == '}':
                d -= 1
                if d == 0:
                    break
            j += 1
        obj = arr_text[start:j+1]
        text = extract_field(obj, 'text')
        category = extract_field(obj, 'category')
        if text:
            items.append({'text': text, 'category': category})
    return items

def extract_watch_resolved(jsx_text):
    wr_start = jsx_text.find('watchResolved:')
    if wr_start == -1:
        return []
    arr_start = jsx_text.find('[', wr_start)
    if arr_start == -1:
        return []
    depth = 1
    i = arr_start + 1
    while i < len(jsx_text) and depth > 0:
        if jsx_text[i] == '[':
            depth += 1
        elif jsx_text[i] == ']':
            depth -= 1
        i += 1
    arr_text = jsx_text[arr_start+1:i-1]
    items = []
    for m in re.finditer(r'\{\s*text\s*:', arr_text):
        start = m.start()
        d = 0
        j = start
        while j < len(arr_text):
            if arr_text[j] == '{':
                d += 1
            elif arr_text[j] == '}':
                d -= 1
                if d == 0:
                    break
            j += 1
        obj = arr_text[start:j+1]
        text = extract_field(obj, 'text')
        resolved = extract_field(obj, 'resolved')
        status = extract_field(obj, 'status')
        if text:
            items.append({'text': text, 'resolved': resolved, 'status': status})
    return items

# ═══ Git Integration ═══

def git_run(args):
    result = subprocess.run(
        ['git'] + args,
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    return result.stdout.strip() if result.returncode == 0 else ""

def find_boundary_commit(target_date):
    """Find the last commit modifying JSX on or before target_date."""
    date_str = target_date.strftime("%Y-%m-%dT23:59:59")
    output = git_run([
        'log', '--format=%H', '-1',
        f'--until={date_str}',
        '--', JSX_PATH
    ])
    return output if output else None

def get_first_commit():
    output = git_run([
        'log', '--format=%H', '--reverse',
        '--', JSX_PATH
    ])
    lines = output.split('\n')
    return lines[0] if lines else None

def get_jsx_at_commit(commit_hash):
    return git_run(['show', f'{commit_hash}:{JSX_PATH}'])

def get_week_commits(start_date, end_date):
    """Get all commits modifying JSX within a date range."""
    after = (start_date - timedelta(days=1)).strftime("%Y-%m-%d")
    until = end_date.strftime("%Y-%m-%dT23:59:59")
    output = git_run([
        'log', '--format=%H',
        f'--after={after}', f'--until={until}',
        '--', JSX_PATH
    ])
    return [h for h in output.split('\n') if h] if output else []

def collect_week_highlights(start_date, end_date):
    """Walk all commits in the week, extract keyDevelopments, dedupe and rank.

    Returns a list of the most important developments, ranked by:
    1. Persistence: items that appear across multiple commits are more important
    2. Category diversity: ensure coverage across domains
    3. Recency: later items break ties
    """
    commits = get_week_commits(start_date, end_date)
    if not commits:
        return []

    # Extract keyDevelopments from each commit
    seen_texts = {}  # text_prefix -> {text, category, count, last_commit_idx}
    all_resolved = []

    for idx, commit in enumerate(reversed(commits)):  # oldest first
        jsx = get_jsx_at_commit(commit)
        if not jsx:
            continue
        highlights = extract_highlights(jsx)
        for h in highlights:
            # Use first 60 chars as dedup key (handles minor edits)
            prefix = h['text'][:60]
            if prefix in seen_texts:
                seen_texts[prefix]['count'] += 1
                seen_texts[prefix]['last_idx'] = idx
            else:
                seen_texts[prefix] = {
                    'text': h['text'],
                    'category': h.get('category', ''),
                    'count': 1,
                    'last_idx': idx,
                }

        resolved = extract_watch_resolved(jsx)
        for r in resolved:
            prefix = r['text'][:40]
            if not any(prefix == er['text'][:40] for er in all_resolved):
                all_resolved.append(r)

    if not seen_texts:
        return [], all_resolved

    # Rank: persistence (count) * 2 + recency (last_idx)
    ranked = sorted(seen_texts.values(),
                    key=lambda x: x['count'] * 2 + x['last_idx'],
                    reverse=True)

    # Ensure category diversity: take top items but limit 2 per category
    result = []
    cat_counts = {}
    for item in ranked:
        cat = item['category'] or 'other'
        if cat_counts.get(cat, 0) >= 2 and len(result) < 7:
            continue
        result.append(item)
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        if len(result) >= 7:
            break

    # If we didn't get 7, fill from remaining
    if len(result) < 7:
        for item in ranked:
            if item not in result:
                result.append(item)
                if len(result) >= 7:
                    break

    return result, all_resolved

# ═══ Diff Logic ═══

def flatten_goals(goals):
    flat = {}
    for g in goals:
        flat[g['id']] = g
        for sg in g.get('subgoals', []):
            flat[sg['id']] = sg
    return flat

def compute_stats(goals):
    flat = flatten_goals(goals)
    all_goals = list(flat.values())
    return {
        'total': len(all_goals),
        'achieved': sum(1 for g in all_goals if g['status'] == 'achieved'),
        'inProgress': sum(1 for g in all_goals if g['status'] == 'in progress'),
        'atRisk': sum(1 for g in all_goals if g['status'] == 'at risk'),
        'failing': sum(1 for g in all_goals if g.get('trend') == 'failing'),
        'expanding': sum(1 for g in all_goals if g.get('trend') == 'expanding'),
        'unachievable': sum(1 for g in all_goals if g['status'] == 'unachievable'),
        'tbd': sum(1 for g in all_goals if g['status'] == 'tbd'),
    }

def diff_goals(start_goals, end_goals):
    start_flat = flatten_goals(start_goals)
    end_flat = flatten_goals(end_goals)
    changes = []
    for gid, end_g in end_flat.items():
        if gid not in start_flat:
            changes.append({
                'id': gid, 'name': end_g['name'],
                'type': 'new', 'party': end_g.get('party', ''),
                'old_status': '', 'new_status': end_g['status'],
                'old_trend': '', 'new_trend': end_g.get('trend', ''),
                'outcomeNote': end_g.get('outcomeNote', ''),
                'magnitude': 3,
            })
            continue
        start_g = start_flat[gid]
        status_changed = start_g['status'] != end_g['status']
        trend_changed = start_g.get('trend', '') != end_g.get('trend', '')
        note_delta = len(end_g.get('outcomeNote', '')) - len(start_g.get('outcomeNote', ''))
        if status_changed or trend_changed or abs(note_delta) > 50:
            mag = 0
            if status_changed:
                mag += 3
            if trend_changed:
                mag += 2
            if abs(note_delta) > 50:
                mag += 1
            changes.append({
                'id': gid, 'name': end_g['name'],
                'type': 'changed', 'party': end_g.get('party', ''),
                'old_status': start_g['status'],
                'new_status': end_g['status'],
                'old_trend': start_g.get('trend', ''),
                'new_trend': end_g.get('trend', ''),
                'outcomeNote': end_g.get('outcomeNote', ''),
                'magnitude': mag,
            })
    # Check for removed goals
    for gid in start_flat:
        if gid not in end_flat:
            changes.append({
                'id': gid, 'name': start_flat[gid]['name'],
                'type': 'removed', 'party': start_flat[gid].get('party', ''),
                'old_status': start_flat[gid]['status'], 'new_status': '',
                'old_trend': start_flat[gid].get('trend', ''), 'new_trend': '',
                'outcomeNote': '', 'magnitude': 3,
            })
    changes.sort(key=lambda c: c['magnitude'], reverse=True)
    return changes

# ═══ Narrative Generation ═══

def format_status(status, trend):
    s = status
    if trend:
        s += f" ({trend})"
    return s

def generate_narrative(changes, stats_start, stats_end, week_num, is_complete, end_day):
    status_changes = [c for c in changes if c['old_status'] != c['new_status']]
    trend_changes = [c for c in changes if c['old_trend'] != c['new_trend'] and c['old_status'] == c['new_status']]
    total_changes = len(changes)

    if total_changes == 0:
        return f"Week {week_num} saw no significant goal status changes."

    parts = []
    day_range = f"Days {(week_num-1)*7+1}\u2013{end_day}"
    if is_complete:
        parts.append(f"In Week {week_num} ({day_range}), {total_changes} goals saw significant changes.")
    else:
        parts.append(f"Through Day {end_day} of Week {week_num}, {total_changes} goals have seen significant changes so far.")

    if status_changes:
        parts.append(f"{len(status_changes)} goals changed status.")
    if trend_changes:
        parts.append(f"{len(trend_changes)} goals changed trend direction.")

    # Note biggest stat shifts
    deltas = []
    for key, label in [('achieved', 'achieved'), ('atRisk', 'at risk'), ('failing', 'failing'), ('expanding', 'expanding')]:
        d = stats_end[key] - stats_start[key]
        if abs(d) >= 2:
            direction = "more" if d > 0 else "fewer"
            deltas.append(f"{abs(d)} {direction} goals {label}")
    if deltas:
        parts.append("Net movement: " + ", ".join(deltas) + ".")

    return " ".join(parts)

# ═══ Category helpers ═══

CATEGORY_MAP = {
    'nuke': 'Nuclear', 'missile': 'Military', 'regime': 'Regime',
    'navy': 'Military', 'hormuz': 'Economic', 'airsup': 'Military',
    'hez': 'Military', 'prx': 'Military', 'cas': 'Humanitarian',
    'sco': 'Political', 'alliance': 'Political', 'all': 'Political',
    'nar': 'Political', 'en': 'Economic', 'gulf': 'Economic',
    'hor': 'Economic', 'terror': 'Military', 'ter': 'Military',
    'reg': 'Regime',
}

def goal_category(goal_id):
    for prefix in sorted(CATEGORY_MAP.keys(), key=len, reverse=True):
        if goal_id.startswith(prefix):
            return CATEGORY_MAP[prefix]
    return "Other"

# ═══ HTML Generation ═══

def status_badge_html(status, trend=""):
    colors = {
        'achieved': '#22C55E', 'in progress': '#F59E0B',
        'at risk': '#F87171', 'unachievable': '#9CA3AF', 'tbd': '#9CA3AF',
    }
    c = colors.get(status, '#9CA3AF')
    badge = f'<span style="display:inline-block;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:700;background:{c}20;color:{c};border:1px solid {c}40;text-transform:uppercase">{html.escape(status)}</span>'
    if trend:
        tc = '#F87171' if trend == 'failing' else '#F59E0B'
        badge += f' <span style="display:inline-block;padding:1px 4px;border-radius:6px;font-size:8px;font-weight:700;background:{tc}15;color:{tc};border:1px solid {tc}35;text-transform:uppercase">{html.escape(trend)}</span>'
    return badge

def resolved_icon(status):
    icons = {'confirmed': ('&#x2713;', '#22C55E'), 'partial': ('~', '#F59E0B'), 'wrong': ('&#x2717;', '#EF4444'), 'ongoing': ('&#x2192;', '#3B82F6')}
    icon, color = icons.get(status, ('?', '#9CA3AF'))
    return f'<span style="color:{color};font-weight:700">{icon}</span>'

def generate_week_html(week_num, start_day, end_day, start_date, end_date,
                       is_complete, stats_start, stats_end, changes,
                       highlights, watch_resolved, narrative):
    C = {
        'bg': '#0B1120', 'card': '#111B2E', 'navy': '#1A2744',
        'blue': '#2D5FA0', 'blueLt': '#6AADDB', 'border': '#243450',
        'text': '#D8DFE8', 'textDim': '#7A8FA8', 'white': '#F0F3F7',
        'green': '#22C55E', 'amber': '#F59E0B', 'red': '#F87171',
    }

    date_fmt = lambda d: d.strftime("%b %d")
    status_label = "Complete" if is_complete else f"Through Day {end_day}"
    page_title = f"Week {week_num}: Iran War Days {start_day}\u2013{end_day} | 2026 Iran War Tracker"

    # Build description from top highlights (not goal names)
    def snippet(text, max_len=35):
        for sep in [' \u2014 ', ' - ']:
            idx = text.find(sep)
            if 0 < idx <= max_len:
                return text[:idx].strip().rstrip(',.')
        if len(text) > max_len:
            sp = text[:max_len].rfind(' ')
            if sp > max_len - 12:
                return text[:sp].strip().rstrip(',.')
        return text[:max_len].strip().rstrip(',.')

    if highlights:
        snips = [snippet(h['text']) for h in highlights[:3]]
        desc_snips = ", ".join(snips)
        description = f"Week {week_num}: {desc_snips}. {len(changes)} goal changes across {stats_end['total']} tracked objectives. Updated analysis."
    else:
        description = f"Week {week_num}: {len(changes)} goal changes across the 2026 Iran war. {stats_end['total']} sourced goals. Updated analysis."
    if len(description) > 160:
        description = f"Week {week_num}: {len(changes)} goal changes across the 2026 Iran war. {stats_end['total']} sourced goals. Updated analysis."

    og_title = f"Iran War Week {week_num} Review: Days {start_day}\u2013{end_day}"
    iso_date = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    pub_date = end_date.strftime("%Y-%m-%dT00:00:00Z")

    lines = []
    lines.append('<!DOCTYPE html>')
    lines.append('<html lang="en">')
    lines.append('<head>')
    lines.append('<meta charset="UTF-8">')
    lines.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    lines.append(f'<title>{html.escape(page_title)}</title>')
    lines.append(f'<meta name="description" content="{html.escape(description)}">')
    lines.append(f'<meta property="og:title" content="{html.escape(og_title)}">')
    lines.append(f'<meta property="og:description" content="{html.escape(description)}">')
    lines.append('<meta property="og:type" content="article">')
    lines.append(f'<meta property="og:url" content="{DOMAIN}/week-{week_num}/">')
    lines.append(f'<meta property="og:image" content="{DOMAIN}/og-image.png">')
    lines.append(f'<meta name="twitter:card" content="summary_large_image">')
    lines.append(f'<meta name="twitter:title" content="{html.escape(og_title)}">')
    lines.append(f'<meta name="twitter:description" content="{html.escape(description)}">')
    lines.append(f'<link rel="canonical" href="{DOMAIN}/week-{week_num}/">')
    lines.append(f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{html.escape(og_title)}",
  "datePublished": "{pub_date}",
  "dateModified": "{iso_date}",
  "url": "{DOMAIN}/week-{week_num}/",
  "isPartOf": {{ "@type": "WebSite", "name": "2026 Iran War Tracker", "url": "{DOMAIN}" }},
  "author": {{ "@type": "Person", "name": "Avi Berkowitz" }},
  "publisher": {{ "@type": "Person", "name": "Avi Berkowitz" }}
}}
</script>''')
    lines.append(f'''<style>
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background:{C['bg']}; color:{C['text']}; }}
a {{ color:{C['blueLt']}; text-decoration:none; }}
a:hover {{ text-decoration:underline; }}
.container {{ max-width:900px; margin:0 auto; padding:24px; }}
.stat-bar {{ display:flex; gap:12px; flex-wrap:wrap; margin:16px 0; }}
.stat-box {{ background:{C['card']}; border:1px solid {C['border']}; border-radius:8px; padding:10px 14px; text-align:center; min-width:80px; flex:1; }}
.stat-val {{ font-size:22px; font-weight:800; }}
.stat-label {{ font-size:9px; color:{C['textDim']}; letter-spacing:0.8px; text-transform:uppercase; margin-top:2px; }}
.stat-delta {{ font-size:10px; margin-top:2px; }}
table {{ width:100%; border-collapse:collapse; margin:12px 0; }}
th {{ text-align:left; font-size:10px; color:{C['textDim']}; letter-spacing:1px; text-transform:uppercase; padding:8px; border-bottom:2px solid {C['blue']}; }}
td {{ padding:8px; border-bottom:1px solid {C['border']}30; font-size:12px; vertical-align:top; }}
.section {{ margin:24px 0; }}
.section h3 {{ font-size:15px; font-weight:700; margin-bottom:12px; padding-bottom:6px; border-bottom:2px solid {C['border']}; }}
.card {{ background:{C['card']}; border:1px solid {C['border']}; border-radius:8px; padding:14px; margin:8px 0; }}
.nav {{ display:flex; justify-content:space-between; align-items:center; padding:20px 0; border-top:1px solid {C['border']}; margin-top:24px; }}
.nav a {{ padding:8px 16px; border:1px solid {C['border']}; border-radius:6px; font-size:13px; }}
.nav a:hover {{ border-color:{C['blue']}; background:{C['blue']}20; text-decoration:none; }}
</style>''')
    lines.append('</head>')
    lines.append(f'<body>')
    lines.append('<div class="container">')

    # [1] HEADER
    badge_color = C['green'] if is_complete else C['amber']
    badge_text = "COMPLETE" if is_complete else "IN PROGRESS"
    lines.append(f'<header style="margin-bottom:20px">')
    lines.append(f'<div style="font-size:10px;color:{C["textDim"]};letter-spacing:3px;text-transform:uppercase;margin-bottom:4px">Week {week_num} Review</div>')
    lines.append(f'<h1 style="font-size:22px;font-weight:800;color:{C["white"]};margin-bottom:6px">Iran War Tracker \u2014 Week {week_num}: Days {start_day}\u2013{end_day}</h1>')
    lines.append(f'<div style="font-size:13px;color:{C["textDim"]}">{date_fmt(start_date)} \u2013 {date_fmt(end_date)}, 2026 <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;background:{badge_color}20;color:{badge_color};border:1px solid {badge_color}40;margin-left:8px">{badge_text}</span></div>')
    lines.append(f'<div style="margin-top:8px"><a href="/" style="font-size:12px">\u2190 Back to Live Tracker</a></div>')
    lines.append('</header>')

    # [2] STATS BAR
    lines.append('<div class="stat-bar">')
    for key, label, color in [
        ('achieved', 'Achieved', C['green']),
        ('inProgress', 'In Progress', C['amber']),
        ('atRisk', 'At Risk', C['red']),
        ('failing', 'Failing', '#F87171'),
        ('expanding', 'Expanding', '#F59E0B'),
        ('unachievable', 'Unachievable', '#9CA3AF'),
        ('tbd', 'TBD', '#9CA3AF'),
    ]:
        val_end = stats_end[key]
        val_start = stats_start[key]
        delta = val_end - val_start
        delta_str = ""
        if delta > 0:
            delta_str = f'<div class="stat-delta" style="color:{C["green"]}">+{delta}</div>'
        elif delta < 0:
            delta_str = f'<div class="stat-delta" style="color:{C["red"]}">{delta}</div>'
        else:
            delta_str = f'<div class="stat-delta" style="color:{C["textDim"]}">=</div>'
        lines.append(f'<div class="stat-box"><div class="stat-val" style="color:{color}">{val_end}</div><div class="stat-label">{label}</div>{delta_str}</div>')
    lines.append('</div>')

    # [3] WHAT HAPPENED THIS WEEK — curated highlights (the narrative lead)
    if highlights:
        cat_colors = {'military':'#3B82F6', 'political':'#A78BFA', 'economic':'#F59E0B', 'regime':'#EF4444', 'humanitarian':'#EC4899'}
        lines.append('<div class="section">')
        lines.append(f'<h3 style="color:{C["white"]}">What Happened This Week</h3>')
        for h in highlights:
            cat = h.get('category', '')
            dot_color = cat_colors.get(cat, C['textDim'])
            # Truncate to first sentence or em-dash for the headline, show rest as context
            text = h['text']
            headline = text
            context = ''
            for sep in [' \u2014 ', '. ']:
                idx = text.find(sep)
                if idx > 0 and idx < len(text) - 5:
                    headline = text[:idx].rstrip('.')
                    context = text[idx + len(sep):].strip()
                    break
            lines.append(f'<div class="card" style="border-left:3px solid {dot_color};padding:10px 14px">')
            lines.append(f'<div style="font-size:13px;font-weight:600;color:{C["white"]};line-height:1.4">{html.escape(headline)}</div>')
            if context:
                lines.append(f'<div style="font-size:11px;color:{C["textDim"]};line-height:1.5;margin-top:4px">{html.escape(context)}</div>')
            if h.get('count', 1) > 1:
                lines.append(f'<div style="font-size:9px;color:{C["textDim"]};margin-top:4px;font-style:italic">Persisted across {h["count"]} update cycles</div>')
            lines.append('</div>')
        lines.append('</div>')

    # [4] SUMMARY STATS (mechanical narrative — secondary to the bullets above)
    lines.append(f'<div style="padding:8px 14px;background:{C["card"]};border-radius:6px;font-size:12px;color:{C["textDim"]};line-height:1.5;margin:8px 0">')
    lines.append(f'{html.escape(narrative)}')
    lines.append('</div>')

    # [5] STATUS CHANGES TABLE
    if changes:
        lines.append('<div class="section">')
        lines.append(f'<h3 style="color:{C["white"]}">Status & Trend Changes ({len(changes)})</h3>')
        lines.append('<table>')
        lines.append('<tr><th>Goal</th><th>Previous</th><th>Current</th><th style="width:40%">Context</th></tr>')
        for c in changes:
            prev = status_badge_html(c['old_status'], c['old_trend']) if c['old_status'] else '<span style="color:#9CA3AF;font-size:11px">new</span>'
            curr = status_badge_html(c['new_status'], c['new_trend']) if c['new_status'] else '<span style="color:#9CA3AF;font-size:11px">removed</span>'
            note = html.escape(c['outcomeNote'][:200]) + '...' if len(c.get('outcomeNote', '')) > 200 else html.escape(c.get('outcomeNote', ''))
            lines.append(f'<tr><td style="font-weight:600;color:{C["white"]}">{html.escape(c["name"])}</td><td>{prev}</td><td>{curr}</td><td style="color:{C["textDim"]};font-size:11px;line-height:1.5">{note}</td></tr>')
        lines.append('</table>')
        lines.append('</div>')

    # [6] PREDICTION SCORECARD
    if watch_resolved:
        lines.append('<div class="section">')
        lines.append(f'<h3 style="color:{C["amber"]}">Prediction Scorecard</h3>')
        lines.append('<table>')
        lines.append('<tr><th>Prediction</th><th>Result</th><th>Status</th></tr>')
        for w in watch_resolved:
            icon = resolved_icon(w['status'])
            lines.append(f'<tr><td style="font-weight:600;color:{C["white"]}">{html.escape(w["text"])}</td><td style="color:{C["textDim"]};font-size:11px">{html.escape(w["resolved"])}</td><td>{icon} {html.escape(w["status"])}</td></tr>')
        lines.append('</table>')
        lines.append('</div>')

    # [7] CATEGORY BREAKDOWN
    if changes:
        cat_changes = {}
        for c in changes:
            cat = goal_category(c['id'])
            cat_changes.setdefault(cat, []).append(c)
        if cat_changes:
            lines.append('<div class="section">')
            lines.append(f'<h3 style="color:{C["white"]}">Changes by Category</h3>')
            lines.append(f'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">')
            for cat in sorted(cat_changes.keys()):
                items = cat_changes[cat]
                names = ", ".join(c['name'][:30] for c in items[:3])
                if len(items) > 3:
                    names += f", +{len(items)-3} more"
                lines.append(f'<div class="card"><div style="font-weight:700;color:{C["white"]};font-size:13px;margin-bottom:4px">{html.escape(cat)}</div>')
                lines.append(f'<div style="font-size:20px;font-weight:800;color:{C["blueLt"]}">{len(items)}</div>')
                lines.append(f'<div style="font-size:10px;color:{C["textDim"]};margin-top:4px">{html.escape(names)}</div></div>')
            lines.append('</div>')
            lines.append('</div>')

    # [8] BIGGEST MOVERS
    top_movers = [c for c in changes if c['magnitude'] >= 2][:5]
    if top_movers:
        lines.append('<div class="section">')
        lines.append(f'<h3 style="color:{C["white"]}">Biggest Movers</h3>')
        for c in top_movers:
            note_short = c.get('outcomeNote', '')[:300]
            if len(c.get('outcomeNote', '')) > 300:
                note_short += '...'
            lines.append(f'<div class="card" style="border-left:3px solid {C["blue"]}">')
            lines.append(f'<div style="font-weight:700;color:{C["white"]};font-size:13px;margin-bottom:4px">{html.escape(c["name"])}</div>')
            lines.append(f'<div style="margin-bottom:4px">{status_badge_html(c["old_status"], c["old_trend"])} \u2192 {status_badge_html(c["new_status"], c["new_trend"])}</div>')
            if note_short:
                lines.append(f'<div style="font-size:11px;color:{C["textDim"]};line-height:1.5">{html.escape(note_short)}</div>')
            lines.append('</div>')
        lines.append('</div>')

    # [9] NAVIGATION
    lines.append('<nav class="nav">')
    if week_num > 1:
        lines.append(f'<a href="/week-{week_num-1}/">\u2190 Week {week_num-1}</a>')
    else:
        lines.append('<span></span>')
    lines.append(f'<a href="/" style="font-weight:700">Live Tracker</a>')
    if not is_complete:
        lines.append('<span></span>')
    else:
        lines.append(f'<a href="/week-{week_num+1}/">Week {week_num+1} \u2192</a>')
    lines.append('</nav>')

    lines.append(f'<footer style="text-align:center;padding:16px 0;font-size:11px;color:{C["textDim"]};font-family:monospace;border-top:1px solid {C["border"]}">&copy; 2026 Avi Berkowitz</footer>')
    lines.append('</div>')
    lines.append('</body>')
    lines.append('</html>')
    return '\n'.join(lines)

# ═══ Main ═══

def get_week_dates(week_num):
    start = WAR_START + timedelta(days=(week_num - 1) * 7)
    end = start + timedelta(days=6)
    return start, end

def get_current_day():
    now = datetime.now()
    return (now - WAR_START).days + 1

def generate_week(week_num, current_day):
    start_date, end_date = get_week_dates(week_num)
    start_day = (week_num - 1) * 7 + 1
    end_day_max = week_num * 7
    is_complete = current_day > end_day_max
    actual_end_day = end_day_max if is_complete else current_day

    # Find boundary commits
    if week_num == 1:
        start_commit = get_first_commit()
        end_commit = find_boundary_commit(end_date)
        if not end_commit:
            end_commit = start_commit
    else:
        prev_end_date = start_date - timedelta(days=1)
        start_commit = find_boundary_commit(prev_end_date)
        if is_complete:
            end_commit = find_boundary_commit(end_date)
        else:
            end_commit = git_run(['rev-parse', 'HEAD'])

    if not start_commit or not end_commit:
        print(f"  Week {week_num}: skipped (no git commits found)", file=sys.stderr)
        return False

    # Parse JSX at both commits
    start_jsx = get_jsx_at_commit(start_commit)
    end_jsx = get_jsx_at_commit(end_commit)

    if not start_jsx or not end_jsx:
        print(f"  Week {week_num}: skipped (could not read JSX)", file=sys.stderr)
        return False

    start_goals = extract_goals(start_jsx)
    end_goals = extract_goals(end_jsx)
    start_stats = compute_stats(start_goals)
    end_stats = compute_stats(end_goals)

    changes = diff_goals(start_goals, end_goals)

    # Collect highlights across ALL commits in the week (not just end-of-week)
    week_end = end_date if is_complete else WAR_START + timedelta(days=actual_end_day - 1)
    aggregated = collect_week_highlights(start_date, week_end)
    if isinstance(aggregated, tuple):
        week_highlights, watch_resolved = aggregated
    else:
        week_highlights, watch_resolved = aggregated, []

    # Fallback: if no aggregated highlights, use end-of-week snapshot
    if not week_highlights:
        highlights_raw = extract_highlights(end_jsx)
        week_highlights = [{'text': h['text'], 'category': h.get('category', ''), 'count': 1} for h in highlights_raw]
        watch_resolved = extract_watch_resolved(end_jsx)

    # Quality check: at least 1 change for complete weeks
    if is_complete and len(changes) == 0 and len(week_highlights) == 0:
        print(f"  Week {week_num}: skipped (no changes detected)", file=sys.stderr)
        return False

    narrative = generate_narrative(changes, start_stats, end_stats, week_num, is_complete, actual_end_day)

    html_content = generate_week_html(
        week_num, start_day, actual_end_day,
        start_date, end_date if is_complete else WAR_START + timedelta(days=actual_end_day - 1),
        is_complete, start_stats, end_stats,
        changes, week_highlights, watch_resolved, narrative
    )

    # Write output
    out_dir = os.path.join(DOCS_DIR, f"week-{week_num}")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "index.html")
    with open(out_path, 'w') as f:
        f.write(html_content)

    print(f"  Week {week_num}: {len(changes)} changes, {len(week_highlights)} highlights → docs/week-{week_num}/index.html", file=sys.stderr)
    return True


def main():
    week_arg = None
    gen_all = '--all' in sys.argv
    for i, arg in enumerate(sys.argv):
        if arg == '--week' and i + 1 < len(sys.argv):
            week_arg = int(sys.argv[i + 1])

    current_day = get_current_day()
    current_week = max(1, (current_day - 1) // 7 + 1)

    if week_arg:
        generate_week(week_arg, current_day)
    elif gen_all:
        for w in range(1, current_week + 1):
            generate_week(w, current_day)
    else:
        generate_week(current_week, current_day)

    print(f"Weekly reviews generated (current: Week {current_week}, Day {current_day})", file=sys.stderr)


if __name__ == '__main__':
    main()
