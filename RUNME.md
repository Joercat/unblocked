# GBM — garbsoftball.com → Hugging Face bucket

Mirrors all **580 local games** from https://garbsoftball.com/g into the HF bucket
**`smodusermc/garbsoftball-games`** (the 24 proxied games are live third-party sites —
skipped by design and listed in `games.csv`).

## How it works

The sandbox has no direct egress to either site, so the transfer is driven through
**your browser** (unrestricted network) via a small relay this repo serves:

```
Tab A (garbsoftball.com)          my relay (this repo)          Tab B (huggingface.co)
console crawl script  ──file bytes──▶  queue + dashboard  ◀──file bytes──  console upload script
              same-origin fetch              (8 GB bounded)         official @huggingface/hub
                                                                                    JS SDK (Xet)
```

- **Tab A** crawls every game from the entry page outward (per-level BFS, ref
  extraction from HTML/CSS/JS/JSON, entry-dir scoping, per-game size cap) and
  streams each file to the relay. If the relay is unreachable it **automatically
  switches to ZIP mode** — zips auto-download to your machine.
- **Tab B** pulls files from the relay and commits them to the bucket with the
  **official Hugging Face JS SDK** (same Xet upload flow as the web UI,
  same-origin so no CORS). The HF token is typed into Tab B and goes **only to
  huggingface.co** — the relay never sees it.
- Both scripts are **resumable** (localStorage / queue state). Kill, sleep, crash —
  re-paste and it continues.

Everything is tested in-sandbox (`relay/test_relay.js`: 64/64 — CRC32, zip writer
verified against Python `zipfile`, ref extraction, scoping, relay round-trips,
path-safety, full crawl→relay→consumer e2e with byte-identity checks).

## Run it

1. **Start the relay** (any machine/browser-visible host; the repo assumes the
   Arena preview, port 8077):
   ```sh
   cd garbgames/relay && node server.js   # needs Node 18+
   ```
   Open the landing page it serves (e.g. `http://localhost:8077` or the preview URL).

2. **Tab A — crawl**: open https://garbsoftball.com/g, F12 → Console, click
   **Copy Script A** on the landing page, paste, Enter. Green dashboard appears
   top-right. Keep the tab open.

3. **Tab B — upload**: open https://huggingface.co/buckets/smodusermc/garbsoftball-games
   (404 is fine — the script creates it), F12 → Console, **Copy Script B**, paste,
   Enter, and paste your HF token when prompted. Blue dashboard appears bottom-right.

4. Watch the landing page: crawl progress, relay queue depth, upload progress.

### If something stalls

- **Tab B can't load the SDK** (page CSP): press **ZIP MODE** on Tab A's dashboard,
  let the crawl finish, then drag the downloaded zips into the bucket page in the
  HF web UI.
- **Relay down mid-run**: Tab A auto-switches to ZIP mode for remaining files;
  files already queued are picked up when Tab B next polls.
- **Bucket quota (free tier)**: if uploads start failing with a storage/quota
  error, the dashboard shows it — deal with the account and re-paste Script B.

## Layout in the bucket

1:1 site-path mirror: `games/...`, `gamefile/...`, `png/...` (thumbnails).
The Python pipeline variant also writes `_meta/manifest.json` + `README.md`.

## Files

| Path | What |
|---|---|
| `garbgames/relay/server.js` | Node relay: queue, beacons, dashboard, SDK hosting (no deps) |
| `garbgames/relay/scripts/garb.cjs` | Tab A console script (crawl + relay push + zip fallback + dashboard) |
| `garbgames/relay/scripts/hf-up.cjs` | Tab B console script (SDK upload + resume + dashboard) |
| `garbgames/relay/index.html` | Landing page: copy buttons + live status |
| `garbgames/relay/sdk/` | Self-hosted `@huggingface/hub@2.17.5` browser builds (ESM + IIFE) |
| `garbgames/relay/test_relay.js` | 64-assertion test suite (node) |
| `garbgames/mirror_to_hf.py` | Python crawl+download+upload pipeline (backup path, fully tested) |
| `garbgames/games_manifest.json` | Parsed catalog: 604 games (580 local / 24 proxy) |
| `garbgames/games.csv` | Human-readable catalog incl. the 24 proxied titles |
| `garbgames/catalog_raw.md` | Raw /g page capture (parse source) |
