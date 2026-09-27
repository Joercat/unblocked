# Unbuilt → Unblocked Arcade

A **fully offline** arcade with **720 games** (17 classic browser games + 703
TIC-80 cartridges). Every game runs 100% from local files — no internet, no
proxies, no CDNs — and **every game can be downloaded** as a single file or ZIP.

Built by cloning large public "unblocked games" archives from GitHub
(perfectnip, nativegames, monkeygg2, entraptadoez) and the official
`nesbox/tic80web` source (which bundles the entire TIC-80 community cart
library plus the compiled web console), then re-assembling them into one
clean, self-contained site.

## Quick start

```bash
python3 server.py            # serves http://0.0.0.0:8000
```

Open the site, search, click **Play**, click **Download**.
That's it. It works with the network cable unplugged.

Any static file server works too (`python3 -m http.server`, Caddy, nginx…) —
but `server.py` additionally provides the `/downloads/*.zip` endpoints
(built lazily, cached in `../downloads-zips`).

## What's inside

| Path | What |
|---|---|
| `index.html`, `style.css`, `app.js` | The portal (search, categories, sort, per-game download) |
| `catalog.json` | Machine-readable manifest of all 720 games |
| `games/<slug>/` | 17 self-contained browser games (Drive Mad, Crossy Road, Slope 2, Angry Birds, Doodle Jump, Frogfall, Level Devil, Skyball, Rocket League 2D, …) |
| `carts/*.tic` | 703 TIC-80 cartridges (top community games: JETPAC, Portal TIC-80, Mario Bros?, FPS80, …) |
| `player/tic80.js`, `player/tic80.wasm` | The official TIC-80 web console (compiled, MIT-licensed) |
| `tic80.html` | Standalone TIC-80 player page (`tic80.html?cart=<name>`) |
| `vendor/jszip.min.js` | Client-side ZIP creation for multi-file game downloads |
| `server.py` | Offline server with on-demand ZIP downloads |
| `tools/verify-offline.sh` | Audits the whole repo for external references |
| `tools/make-zips.sh` | Pre-builds per-game and all-in-one ZIPs to disk |

### Downloads

- **Single TIC-80 cart** → one click, the `.tic` file (importable into the
  desktop TIC-80 console or any emulator).
- **Browser game** → zipped in the browser via JSZip (or
  `GET /downloads/<slug>.zip` / `tools/make-zips.sh <slug>`).
- **Everything** → `GET /downloads/all-games.zip` (~110 MB, built once and
  cached) or `tools/make-zips.sh all`.

## Research notes (where the games came from)

- **perfectnip.github.io** (GitHub Pages) — the largest "unblocked games"
  site found: 200+ games spread across 3 repos (`perfectnip/perfectnip.github.io`
  1.4 GB, `perfectnip/games-cdn` 815 MB, `perfectnip/games-cdn2` 826 MB).
  Only the games whose **entire file set is local and self-contained** were
  kept; pages that proxy or hotlink other sites were dropped (they can't
  work offline).
- **parcoillegacy/nativegames.net-v1** (1.7 GB) — the original
  "Nativegames" arcade (500+ forks before a fork was DMCA'd in Dec 2025).
  Same filtering applied.
- **MonkeyGG2/monkeygg2.github.io** (3.4 GB, 117 games) and
  **Entraptadoeztechnology/html5-games** (133 MB, 23 games) — additional
  self-contained browser games.
- **nesbox/tic80web** (51 MB) — source of the tic80.com website; bundles
  **4,729 community cartridges** plus metadata (`games.json`) and the
  compiled web console. 703 unique *game* carts were selected (demos/tools
  excluded, one copy per unique name).

### Why not all ~330 browser games?

The complete browser set is ~4 GB; a git-friendly archive is kept under
~120 MB. The remaining large games (Subway Surfers, Undertale, FNAF,
Geometry Dash, EagleCraft builds, …) are still available: the full source
trees are in `../src/` of this workspace (perfectnip, nativegames,
games-cdn, games-cdn2, monkeygg2, entraptadoez, tyler6974, tic80web).
To add one, copy its directory into `games/`, verify its files are
self-contained, and add it to `catalog.json`.

### The TIC-80 player

`tic80.html` uses the exact loading protocol of the official tic80.com web
player: it fetches `player/tic80.js`, imports it from a blob URL, and passes
the local cart path (`carts/<name>.tic`) as the runtime argument. The console
itself (TIC-80 by NESBOX/edubart, MIT license) never phones home.

## Verification

```bash
bash tools/verify-offline.sh
```

scans every file for `http(s)://` references. Remaining hits are credit
links in code comments and ad/telemetry strings that fail silently when
offline — no game requires the network to run.

## Legal note

The portal code here is original. The games are a mixed bag of open-source,
fan-made and re-hosted commercial titles, aggregated from public GitHub
archives for **personal, offline use only**. The games remain the property
of their respective authors — please do not redistribute this archive
publicly (note: the original Nativegames fork was removed via DMCA in
December 2025, so treat the bigger commercial titles with care).
The TIC-80 console is MIT-licensed; community carts are shared by their
authors through the official TIC-80 site.
