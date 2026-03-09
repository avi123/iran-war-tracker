#!/usr/bin/env python3
"""Extract goal data from iran-war-goals.jsx and generate static HTML for crawlers.

Reads the JSX source, extracts HIGHLIGHTS and GOALS data using regex,
and outputs a semantic HTML fragment for the <noscript> block.
"""
import re
import sys
import html
import json
from datetime import datetime

def extract_between(text, start_marker, end_marker):
    """Extract text between two markers."""
    start = text.find(start_marker)
    if start == -1:
        return ""
    start += len(start_marker)
    # Find matching bracket/brace
    depth = 1
    i = start
    open_char = end_marker[0] if end_marker in (']', '}') else None
    close_char = end_marker
    # Simple bracket matching
    while i < len(text) and depth > 0:
        if text[i] == '[' or text[i] == '{':
            if (close_char == ']' and text[i] == '[') or (close_char == '}' and text[i] == '{'):
                depth += 1
        elif text[i] == close_char:
            depth -= 1
        i += 1
    return text[start:i-1]

def extract_field(obj_text, field_name):
    """Extract a field value from a JS object literal string."""
    # Match field:"value" or field:'value'
    pattern = rf'{field_name}\s*:\s*"([^"]*)"'
    m = re.search(pattern, obj_text)
    if m:
        return m.group(1)
    pattern = rf"{field_name}\s*:\s*'([^']*)'"
    m = re.search(pattern, obj_text)
    if m:
        return m.group(1)
    return ""

def extract_highlights(jsx_text):
    """Extract keyDevelopments from HIGHLIGHTS constant."""
    highlights_match = re.search(r'const HIGHLIGHTS\s*=\s*\{', jsx_text)
    if not highlights_match:
        return []

    # Find keyDevelopments array
    kd_start = jsx_text.find('keyDevelopments:', highlights_match.start())
    if kd_start == -1:
        return []

    # Find the array
    arr_start = jsx_text.find('[', kd_start)
    if arr_start == -1:
        return []

    # Extract array content
    depth = 1
    i = arr_start + 1
    while i < len(jsx_text) and depth > 0:
        if jsx_text[i] == '[':
            depth += 1
        elif jsx_text[i] == ']':
            depth -= 1
        i += 1
    arr_text = jsx_text[arr_start+1:i-1]

    # Extract individual items
    items = []
    for m in re.finditer(r'\{\s*text\s*:', arr_text):
        start = m.start()
        # Find end of this object
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
        why = extract_field(obj, 'why')
        if text:
            items.append({'text': text, 'why': why})
    return items

def extract_goals(jsx_text):
    """Extract goals and subgoals from the GOALS array."""
    goals_match = re.search(r'const GOALS\s*=\s*\[', jsx_text)
    if not goals_match:
        return []

    goals_start = goals_match.end() - 1
    # Find end of GOALS array
    depth = 1
    i = goals_start + 1
    while i < len(jsx_text) and depth > 0:
        if jsx_text[i] == '[':
            depth += 1
        elif jsx_text[i] == ']':
            depth -= 1
        i += 1
    goals_text = jsx_text[goals_start+1:i-1]

    # Extract top-level goal objects (depth-1 braces)
    goals = []
    depth = 0
    obj_start = None
    for j, ch in enumerate(goals_text):
        if ch == '{' :
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

def parse_goal(goal_text):
    """Parse a single goal object including subgoals."""
    goal_id = extract_field(goal_text, 'id')
    name = extract_field(goal_text, 'name')
    status = extract_field(goal_text, 'status')
    trend = extract_field(goal_text, 'trend')
    party = extract_field(goal_text, 'party')

    # Extract outcomeNote — handle escaped quotes
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

    # Extract subgoals
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

        # Parse each subgoal
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
        'id': goal_id,
        'name': name,
        'status': status,
        'trend': trend,
        'party': party,
        'outcomeNote': outcome_note,
        'subgoals': subgoals,
    }

def status_symbol(status):
    if status == 'achieved': return '\u2713'
    if status == 'at risk': return '\u26a0'
    if status == 'unachievable': return '\u2717'
    if status == 'in progress': return '\u25cb'
    return '\u2014'

def generate_html(highlights, goals):
    """Generate semantic HTML fragment."""
    lines = []
    lines.append('<div style="max-width:900px;margin:0 auto;padding:24px;color:#E2E8F0;">')
    lines.append('<h2 style="color:#E2E8F0;font-size:20px;margin-bottom:16px;">Iran War Goals Tracker &mdash; 2026 US-Israel-Iran Conflict</h2>')

    # Key developments
    if highlights:
        lines.append('<section>')
        lines.append('<h3 style="color:#3B82F6;font-size:16px;margin:16px 0 8px;">Key Developments</h3>')
        lines.append('<ul style="list-style:none;padding:0;">')
        for item in highlights:
            text_escaped = html.escape(item['text'])
            why_escaped = html.escape(item['why']) if item.get('why') else ''
            lines.append(f'<li style="margin-bottom:12px;padding:8px;border-left:3px solid #3B82F6;">')
            lines.append(f'<strong style="color:#E2E8F0;">{text_escaped}</strong>')
            if why_escaped:
                lines.append(f'<br><span style="color:#94A3B8;font-size:13px;">{why_escaped}</span>')
            lines.append('</li>')
        lines.append('</ul>')
        lines.append('</section>')

    # Goals
    lines.append('<section>')
    lines.append('<h3 style="color:#E2E8F0;font-size:16px;margin:20px 0 8px;">All Goals</h3>')

    party_labels = {'us': 'US', 'israel': 'Israel', 'both': 'US/Israel', 'opposing': 'Opposing'}

    for goal in goals:
        party_label = party_labels.get(goal['party'], goal['party'])
        status_sym = status_symbol(goal['status'])
        trend_str = f' [{goal["trend"]}]' if goal.get('trend') else ''
        name_escaped = html.escape(goal['name'])

        lines.append(f'<article style="margin:12px 0;padding:10px;border:1px solid #1E293B;border-radius:6px;">')
        lines.append(f'<h4 style="color:#E2E8F0;font-size:14px;margin-bottom:4px;">{status_sym} {name_escaped} <span style="color:#64748B;font-size:12px;">({party_label} &mdash; {html.escape(goal["status"])}{html.escape(trend_str)})</span></h4>')

        if goal.get('outcomeNote'):
            on_escaped = html.escape(goal['outcomeNote'])
            # Truncate very long notes for static version
            if len(on_escaped) > 500:
                on_escaped = on_escaped[:497] + '...'
            lines.append(f'<p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:4px 0;">{on_escaped}</p>')

        # Subgoals
        if goal.get('subgoals'):
            lines.append('<dl style="margin:6px 0 0 16px;">')
            for sub in goal['subgoals']:
                sub_sym = status_symbol(sub['status'])
                sub_trend = f' [{sub["trend"]}]' if sub.get('trend') else ''
                sub_name = html.escape(sub['name'])
                lines.append(f'<dt style="color:#CBD5E1;font-size:12px;margin-top:6px;">{sub_sym} {sub_name} <span style="color:#64748B;">({html.escape(sub["status"])}{html.escape(sub_trend)})</span></dt>')
                if sub.get('outcomeNote'):
                    sub_on = html.escape(sub['outcomeNote'])
                    if len(sub_on) > 300:
                        sub_on = sub_on[:297] + '...'
                    lines.append(f'<dd style="color:#64748B;font-size:11px;line-height:1.4;margin:2px 0 0 0;">{sub_on}</dd>')
            lines.append('</dl>')

        lines.append('</article>')

    lines.append('</section>')

    # Sources
    lines.append('<section style="margin-top:20px;">')
    lines.append('<h3 style="color:#E2E8F0;font-size:14px;margin-bottom:8px;">Sources</h3>')
    lines.append('<p style="color:#94A3B8;font-size:12px;">All claims are sourced to verifiable reports including CENTCOM, IAEA, Al Jazeera, PBS, Reuters, FDD, Alma Center, Times of Israel, and dozens of others. Enable JavaScript for the full interactive experience with source links, filtering, and real-time status tracking.</p>')
    lines.append('</section>')

    lines.append('</div>')
    return '\n'.join(lines)

def extract_updated_at(jsx_text):
    """Extract updatedAt timestamp from HIGHLIGHTS."""
    m = re.search(r'updatedAt\s*:\s*"([^"]+)"', jsx_text)
    return m.group(1) if m else ""


def snippet_from_text(text, max_len=40):
    """Extract a short headline snippet from a keyDevelopment text.
    Takes the portion before the first em-dash or period, truncated."""
    # Split on em-dash, period+space, or comma+space (after reasonable length)
    for sep in [' — ', ' - ']:
        idx = text.find(sep)
        if idx != -1 and idx <= max_len:
            snippet = text[:idx].strip()
            return snippet.rstrip(',.')
    # Try period
    idx = text.find('. ')
    if idx != -1 and idx <= max_len:
        snippet = text[:idx].strip()
        return snippet.rstrip(',.')
    # Just truncate at word boundary
    if len(text) > max_len:
        truncated = text[:max_len]
        last_space = truncated.rfind(' ')
        if last_space > max_len - 15:
            snippet = truncated[:last_space].strip()
            return snippet.rstrip(',.')
    return text[:max_len].strip().rstrip(',.')


def count_goals(goals):
    """Count total goals including subgoals."""
    total = 0
    for g in goals:
        total += 1
        total += len(g.get('subgoals', []))
    return total


def generate_meta(jsx_text):
    """Generate dynamic SEO title and description from HIGHLIGHTS data."""
    WAR_START = datetime(2026, 2, 28)

    updated_at = extract_updated_at(jsx_text)
    highlights = extract_highlights(jsx_text)
    goals = extract_goals(jsx_text)
    goal_count = count_goals(goals)

    # Calculate war day
    day_num = None
    if updated_at:
        try:
            # Parse ISO timestamp (handle various formats)
            ts = updated_at.replace('Z', '+00:00')
            if '+' not in ts and '-' not in ts[10:]:
                ts += '+00:00'
            dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            day_num = (dt.replace(tzinfo=None) - WAR_START).days + 1
        except (ValueError, TypeError):
            pass

    # Extract headline snippets from first 3 keyDevelopments
    snippets = []
    for item in highlights[:3]:
        s = snippet_from_text(item['text'])
        if s:
            snippets.append(s)

    # Make short snippets for title (max 20 chars each)
    short_snippets = [snippet_from_text(item['text'], max_len=22) for item in highlights[:3] if item.get('text')]

    # Build title: "Iran War Tracker — Day N: snippet1, snippet2 | {goal_count} Goals"
    day_prefix = f"Day {day_num}" if day_num else "Live"

    # Try 2 short snippets first
    if len(short_snippets) >= 2:
        title_snips = ", ".join(short_snippets[:2])
        title = f"Iran War Tracker — {day_prefix}: {title_snips} | {goal_count} Goals"
    elif short_snippets:
        title = f"Iran War Tracker — {day_prefix}: {short_snippets[0]} | {goal_count} Goals"
    else:
        title = f"Iran War Tracker — {day_prefix} | {goal_count} Goals Live"

    # If still too long, fall back
    if len(title) > 70 and short_snippets:
        title = f"Iran War Tracker — {day_prefix}: {short_snippets[0]} | {goal_count} Goals"
    if len(title) > 70:
        title = f"Iran War Tracker — {day_prefix} | {goal_count} Goals Live"

    # Build description using longer snippets
    desc_snippets_str = ", ".join(snippets[:3])
    description = f"{day_prefix}: {desc_snippets_str}. Track {goal_count} sourced goals across military, nuclear, oil & casualties. Updated multiple times daily."
    if len(description) > 160:
        desc_snippets_str = ", ".join(snippets[:2])
        description = f"{day_prefix}: {desc_snippets_str}. Track {goal_count} sourced war goals — military, nuclear, oil, casualties. Updated daily."
    if len(description) > 160:
        description = f"{day_prefix}: {snippets[0]}. {goal_count} sourced goals across the 2026 US-Israel-Iran war. Updated daily."

    # OG title can be longer (up to ~95 chars)
    og_title_snips = ", ".join(snippets[:2])
    og_title = f"Iran War Tracker — {day_prefix}: {og_title_snips}"
    if len(og_title) > 95:
        og_title = f"Iran War Tracker — {day_prefix}: {snippets[0]}"

    # Value prop for description suffix
    value_prop = f"{goal_count} sourced goals across military, nuclear, oil & casualties"

    return json.dumps({
        "day": day_num,
        "goal_count": goal_count,
        "title": title,
        "description": description,
        "og_title": og_title,
        "snippets": snippets,
        "value_prop": value_prop,
    })


def main():
    if len(sys.argv) < 2:
        print("Usage: extract-static.py <path-to-jsx> [--meta]", file=sys.stderr)
        sys.exit(1)

    jsx_path = sys.argv[1]
    meta_mode = '--meta' in sys.argv

    with open(jsx_path, 'r') as f:
        jsx_text = f.read()

    if meta_mode:
        print(generate_meta(jsx_text))
        return

    highlights = extract_highlights(jsx_text)
    goals = extract_goals(jsx_text)

    print(f"Extracted {len(highlights)} highlights, {len(goals)} goals", file=sys.stderr)

    html_output = generate_html(highlights, goals)
    print(html_output)

if __name__ == '__main__':
    main()
