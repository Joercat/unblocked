#!/usr/bin/env bash
#
# verify-offline.sh — audit the whole site for external (internet) references.
#
# A fully offline archive should not fetch anything from the network. This
# scans every text file in the repo (except .git) for http(s) URLs and prints
# any suspicious ones. Known-harmless domains (W3C namespaces, w3schools in
# comments, MDN links in code comments, ad-SDK strings that fail silently)
# are listed in the ALLOW list — review the output before shipping.
#
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Domains that are acceptable to appear in comments/strings but never load:
ALLOW='www\.w3\.org|w3\.org/2005|schema\.org|xmlns\.com|adobe\.com|web\.org|developer\.mozilla\.org|asawicki\.info|en\.wikipedia\.org|docs\.turbowarp\.org|extensions\.turbowarp\.org|dummy\.namespace|help\.yoyogames\.com|sites\.google\.com|valve\.github\.io|tizen\.org|www\.java2s\.com|github\.com|gitlab\.com|twitter\.com|facebook\.com|graph\.facebook\.com|play\.google\.com|itunes\.apple\.com|www\.apple\.com|code\.google\.com|www\.google\.com|www\.microsoft\.com|www\.mozilla\.org|whatbrowser\.org|www\.construct\.net|help\.construct\.net|jsd\.supersonicads\.com|a248\.e\.akamai\.net|sdk\.enjoy4fun\.com|leveldata\.poki\.io|a\.poki\.com|poki\.com|kris\.games|www\.weebly\.com|unblockedgamesroblox\.weebly\.com|purl\.eligrey\.com|camerongott\.github\.io|ihtasham42\.github\.io|discord\.gg|cdn\.icon-icons\.com|www\.w3schools\.com|aax\.amazon-adsystem\.com|onetag-sys\.com|prebid-server\.rubiconproject\.com|prebid\.adnxs\.com|search\.spotxchange\.com|www\.googletagmanager\.com|pagead2\.googlesyndication\.com|arc\.io'

echo "== scanning $ROOT for external references =="
find . -type f -not -path './.git/*' -not -path './downloads-zips/*' \
  -not -name '*.png' -not -name '*.jpg' -not -name '*.jpeg' -not -name '*.gif' \
  -not -name '*.webp' -not -name '*.mp3' -not -name '*.ogg' -not -name '*.wav' \
  -not -name '*.mp4' -not -name '*.unityweb' -not -name '*.wasm' \
  -not -name '*.woff2' -not -name '*.ttf' -not -name '*.ico' -not -name '*.zip' \
  -not -name 'catalog.json' | while read -r f; do
  [ "$(wc -c < "$f")" -gt 4000000 ] && continue
  grep -HnoE 'https?://[a-zA-Z0-9.-]+' "$f" 2>/dev/null
done | sed -E 's/^([^:]+):[0-9]+:(https?:\/\/[a-zA-Z0-9.-]+)/\1  \2/' \
  | sort -u \
  | grep -viE "https?://${ALLOW}($|/)" > /tmp/offline_hits.txt || true

if [ -s /tmp/offline_hits.txt ]; then
  echo
  echo "POTENTIAL EXTERNAL REFERENCES (review manually):"
  column -t -s'  ' /tmp/offline_hits.txt | head -60
  echo
  echo "Total lines: $(wc -l < /tmp/offline_hits.txt)"
  echo "Most are comments/credit links/ad-SDK strings that fail silently offline."
else
  echo "OK — no external references found."
fi
