#!/usr/bin/env bash
#
# make-zips.sh — pre-build ZIP downloads into $ZIP_CACHE (default:
# ../downloads-zips next to this repo). server.py also builds them on demand,
# so this script is only needed if you want the zips to exist on disk ahead
# of time (e.g. to copy the whole folder to a USB stick without a server).
#
#   ./tools/make-zips.sh            # everything (all-games.zip + per-game)
#   ./tools/make-zips.sh all        # just all-games.zip
#   ./tools/make-zips.sh <slug>     # just one game
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${ZIP_CACHE:-$ROOT/../downloads-zips}"
mkdir -p "$CACHE"

python3 - "$ROOT" "$CACHE" "${1:-all}" <<'EOF'
import json, os, sys, zipfile

root, cache, which = sys.argv[1], sys.argv[2], sys.argv[3]
catalog = json.load(open(os.path.join(root, "catalog.json")))

def write_zip(target, entries):
    if os.path.isfile(target):
        os.remove(target)
    tmp = target + ".part"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zf:
        for src, arc in entries:
            zf.write(src, arc)
    os.replace(tmp, target)
    print("wrote %s (%.1f MB)" % (target, os.path.getsize(target) / 1048576))

def game_entries(g):
    if g["type"] == "tic80":
        p = os.path.join(root, g["filelist"][0])
        return [(p, g["slug"] + ".tic")]
    base = os.path.join(root, "games", g["slug"])
    return [(os.path.join(base, f), os.path.join(g["slug"], f)) for f in g["filelist"]]

games = catalog["games"]
if which == "all" or which == "all-games.zip":
    entries = []
    for g in games:
        entries.extend(game_entries(g))
    for name in ("tic80.js", "tic80.wasm"):
        p = os.path.join(root, "player", name)
        entries.append((p, os.path.join("player", name)))
    entries.append((os.path.join(root, "tic80.html"), "tic80.html"))
    write_zip(os.path.join(cache, "all-games.zip"), entries)
else:
    g = next((x for x in games if x["slug"] == which), None)
    if not g:
        sys.exit("unknown game: %s" % which)
    write_zip(os.path.join(cache, which + ".zip"), game_entries(g))
EOF
