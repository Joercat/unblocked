#!/usr/bin/env python3
"""Parse the reconstructed catalog markdown into games_manifest.json."""
import json, re, sys
from urllib.parse import unquote

raw = open('/home/user/garbgames/catalog_raw.md', encoding='utf-8').read()

# Each game tile is:  [![Name](thumbUrl)](href)
pat = re.compile(r'\[!\[([^\]]*)\]\((https://garbsoftball\.com/[^)]+)\)\]\(([^)]+)\)')
games, bad = [], []
for i, line in enumerate(raw.splitlines(), 1):
    line = line.strip()
    if not line.startswith('['):
        continue
    m = pat.search(line)
    if not m:
        bad.append((i, line[:120]))
        continue
    name, thumb, href = m.group(1), m.group(2), m.group(3)
    entry = {'name': name, 'thumb': thumb}
    if '?proxy=' in href:
        entry['kind'] = 'proxy'
        entry['proxy_url'] = unquote(href.split('?proxy=')[1])
        entry['entry_path'] = None
    elif '?url=' in href:
        entry['kind'] = 'local'
        entry['entry_path'] = unquote(href.split('?url=')[1])
        entry['wrapper'] = 'unityframe' if 'unityframe.html' in href else 'iframe'
    elif href.startswith('https://garbsoftball.com/'):
        entry['kind'] = 'local'
        entry['entry_path'] = href.split('https://garbsoftball.com', 1)[1]
        entry['wrapper'] = 'direct'
    else:
        entry['kind'] = 'other'
        entry['other_url'] = href
    games.append(entry)

local = [g for g in games if g['kind'] == 'local']
proxy = [g for g in games if g['kind'] == 'proxy']
other = [g for g in games if g['kind'] == 'other']

manifest = {
    'source': 'https://garbsoftball.com/g',
    'retrieved': '2026-09-27',
    'site_shown_count': 604,
    'total_parsed': len(games),
    'local_count': len(local),
    'proxy_count': len(proxy),
    'other_count': len(other),
    'games': games,
}
with open('/home/user/garbgames/games_manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=1, ensure_ascii=False)

print(f"total={len(games)} local={len(local)} proxy={len(proxy)} other={len(other)}")
print(f"expected 604 -> match: {len(games) == 604}")
print("\nnon-local entries:")
for g in games:
    if g['kind'] != 'local':
        print(' ', g['kind'], '|', g['name'], '|', g.get('proxy_url') or g.get('other_url'))
if bad:
    print("\nMALFORMED LINES:")
    for i, l in bad:
        print(f'  line {i}: {l}')
else:
    print("\nall tile lines parsed cleanly")

# check for duplicate entry paths
from collections import Counter
c = Counter(g['entry_path'] for g in local if g['entry_path'])
dups = {k: v for k, v in c.items() if v > 1}
print("\nduplicate entry paths:", dups if dups else "none")
