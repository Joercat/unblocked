#!/usr/bin/env python3
"""
mirror_to_hf.py — mirror the local games from https://garbsoftball.com/g into a
Hugging Face **Storage Bucket** (new repo type, `hf://buckets/username/name`).

What it does
------------
1. Loads games_manifest.json (604 games scraped from https://garbsoftball.com/g).
2. For each *local* game it starts at the entry page (e.g. /games/2048/index.html
   or /gamefile/1v1.html) and BFS-crawls every same-origin asset referenced from
   the HTML / JS / CSS / JSON (scripts, styles, images, audio, wasm, Unity
   .unityweb/.assets data files, gltf, fonts, ...). Asset names that are built
   dynamically with template strings can never be discovered statically; every
   literally-referenced file is captured.
3. Files are streamed to a local cache using the site's own paths 1:1
   (games/..., gamefile/..., png/...), then uploaded to the bucket in batches.
   Everything is tracked in a state file, so the job is fully resumable:
   re-run the same command any time and it picks up where it left off.

Setup (on any machine with normal internet + Python 3.9+)
---------------------------------------------------------
    pip install -U "huggingface_hub>=2.0" requests
    export HF_TOKEN=hf_xxx

Commands
--------
    python mirror_to_hf.py --scan                 # fast pre-scan: total size, no bulk download
    python mirror_to_hf.py --only "FNAF" --limit 3   # trial run on a few games
    python mirror_to_hf.py                         # THE JOB: crawl + download + upload
    python mirror_to_hf.py --local-only            # download only
    python mirror_to_hf.py --upload-only           # upload what is already cached
    python mirror_to_hf.py --private               # make the bucket private

Bucket layout = the site's own path tree, plus _meta/ (manifest, README, log).
"""
import argparse
import getpass
import html
import json
import os
import random
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote

import requests

BASE = "https://garbsoftball.com"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
MAX_TEXT_PARSE = 20 * 1024 * 1024     # parse at most 20 MB of text per file
MAX_FILE = 4 * 1024 ** 3              # skip individual files > 4 GB

ASSET_EXT_RE = re.compile(
    r"""\.(?:js|mjs|cjs|css|png|jpe?g|webp|avif|gif|svg|ico|mp3|ogg|oga|wav|m4a|aac|flac|"""
    r"""json|wasm|data|unityweb|assets|mem|glb|gltf|bin|fnt|ttf|otf|woff2?|mp4|webm|dat|plist|"""
    r"""pck|vpk|bsp|pk3|gpk|txt|xml|map)(?:$|[?#])""", re.IGNORECASE)

# quoted/parenthesised assignment-looking string that may contain a local ref
REF_RE = re.compile(r"""(?:["'(]|=)\s*([A-Za-z0-9_./:%+~!-][^"'\s<>{}|\\^]{0,2000}?)["')]""")
ABS_URL_RE = re.compile(r"https?://[^\s\"'<>{}|\\^)\]]+")

SHARED_SITE_FILES = [
    "/iframe.html", "/unityframe.html",
    "/png/fullscreen.svg", "/png/refresh.svg", "/png/sound.svg", "/png/link.svg",
    "/png/open.svg", "/png/download.svg", "/png/clip.svg",
]


class Log:
    def __init__(self, path):
        self.fh = open(path, "a", encoding="utf-8")

    def __call__(self, msg):
        line = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
        print(line, flush=True)
        self.fh.write(line + "\n")
        self.fh.flush()

    def close(self):
        self.fh.close()


def load_state(path):
    p = Path(path)
    if p.exists():
        try:
            return json.loads(p.read_text())
        except Exception:
            return {}
    return {}


def save_state(state, path):
    tmp = Path(path).with_suffix(".tmp")
    tmp.write_text(json.dumps(state))
    tmp.replace(path)


def site_rel(url):
    return unquote(urlsplit(url).path).lstrip("/")


def is_same_site(url, host):
    return urlsplit(url).netloc in (host, "www." + host)


def looks_like_asset(pathlike):
    return bool(ASSET_EXT_RE.search(pathlike.split("#")[0].split("?")[0]))


def sniff_text(sample: bytes) -> bool:
    if not sample:
        return False
    if b"\x00" in sample:
        return False
    printable = sum(1 for b in sample if b >= 9 or (32 <= b < 127) or b >= 128)
    return printable / len(sample) > 0.93


class HTMLRefParser(HTMLParser):
    ATTRS = {
        "script": ("src",), "link": ("href",), "img": ("src", "srcset"),
        "source": ("src", "srcset"), "audio": ("src",), "video": ("src", "poster"),
        "iframe": ("src",), "object": ("data",), "embed": ("src",),
        "track": ("src",), "a": ("href",), "form": ("action",),
    }

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []

    def _grab(self, tag, attrs):
        for name in self.ATTRS.get(tag, ()):
            for k, v in attrs:
                if k == name and v:
                    self.refs.extend(r.strip() for r in v.split(",") if r.strip())

    handle_starttag = _grab
    handle_startendtag = _grab


def extract_refs(text, base_url, host):
    """Candidate same-site URLs (absolute) referenced in arbitrary text."""
    out = []
    p = HTMLRefParser()
    try:
        p.feed(text)
        out += p.refs
    except Exception:
        pass
    for m in REF_RE.finditer(text):
        out.append(m.group(1))
    out += [m.group(0) for m in ABS_URL_RE.finditer(text)]
    dedup, seen = [], set()
    for ref in out:
        ref = html.unescape(ref).strip()
        if not ref or ref.startswith(("data:", "blob:", "javascript:", "#", "//")):
            continue
        if ref.startswith("http"):
            absu = ref
        else:
            absu = urljoin(base_url, ref)
        if not is_same_site(absu, host) or absu in seen:
            continue
        seen.add(absu)
        dedup.append(absu)
    return dedup


def ref_allowed(ref, entry_dir, host):
    """Keep asset-extension refs anywhere; page refs only inside the game's dir."""
    if not is_same_site(ref, host):
        return False
    p = unquote(urlsplit(ref).path)
    lp = p.lower()
    if lp.endswith(("/",)):
        return False
    if looks_like_asset(lp):
        return True
    if lp.endswith((".html", ".htm")):
        return lp.startswith(entry_dir.lower())
    return False


def entry_dir_of(entry_path):
    """Directory prefix of a game entry (used to scope page-level link following)."""
    e = "/" + entry_path.lstrip("/")
    if e.rsplit("/", 1)[-1] == "":
        return e if e.endswith("/") else e + "/"
    return e.rsplit("/", 1)[0] + "/"


# ----------------------------------------------------------------------------- http
class Crawler:
    def __init__(self, workdir, base=BASE, workers=8, retries=4, timeout=120):
        self.workdir = Path(workdir)
        self.base = base.rstrip("/")
        self.host = urlsplit(self.base).netloc
        self.workers = workers
        self.retries = retries
        self.timeout = timeout
        self.sess = requests.Session()
        self.sess.headers.update({"User-Agent": UA})

    def _download(self, url, rel):
        """Stream url to workdir/rel with .part resume. Returns (status, size, err)."""
        dest = self.workdir / rel
        part = dest.parent / (dest.name + ".part")
        last_err = None
        for attempt in range(self.retries):
            try:
                headers = {}
                resume_at = 0
                if part.exists():
                    resume_at = part.stat().st_size
                    if resume_at:
                        headers["Range"] = f"bytes={resume_at}-"
                with self.sess.get(url, headers=headers, stream=True,
                                   timeout=self.timeout) as r:
                    if r.status_code in (403, 404):
                        return r.status_code, 0, None
                    if r.status_code == 416:
                        return 200, part.stat().st_size, None
                    if r.status_code >= 400:
                        return r.status_code, 0, None
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    mode = "ab" if (resume_at and r.status_code == 206) else "wb"
                    written = resume_at if mode == "ab" else 0
                    with open(part, mode) as f:
                        for chunk in r.iter_content(1024 * 1024):
                            if chunk:
                                f.write(chunk)
                                written += len(chunk)
                    part.replace(dest)
                    return 200, written, None
            except (requests.RequestException, OSError) as e:
                last_err = str(e)
                if attempt < self.retries - 1:
                    time.sleep(1.5 ** attempt + random.random())
        return 0, 0, last_err

    def fetch(self, url, rel, scan):
        """One unit of work. Returns dict(url, rel, status, size, text, err)."""
        if not scan:
            dest = self.workdir / rel
            part = dest.parent / (dest.name + ".part")
            if dest.exists() and not part.exists():
                # complete copy from a previous run: parse locally, no network
                text = None
                try:
                    with open(dest, "rb") as f:
                        sample = f.read(512)
                    if sniff_text(sample):
                        text = dest.read_text("utf-8", "ignore")[:MAX_TEXT_PARSE]
                except Exception:
                    pass
                return dict(url=url, rel=rel, status=200,
                            size=dest.stat().st_size, text=text, cached=True)
        if scan:
            # GET but do not persist; sniff content type from the stream head.
            try:
                with self.sess.get(url, stream=True, timeout=self.timeout) as r:
                    if r.status_code >= 400 or r.status_code in (403, 404):
                        return dict(url=url, rel=rel, status=r.status_code, size=0, text=None)
                    cl = r.headers.get("Content-Length")
                    size = int(cl) if cl and cl.isdigit() else -1
                    if size > MAX_FILE:
                        r.close()
                        return dict(url=url, rel=rel, status=200, size=size, text=None,
                                    oversize=True)
                    sample = b""
                    chunks, total_read = [], 0
                    for chunk in r.iter_content(256 * 1024):
                        if not chunk:
                            continue
                        sample = (sample + chunk)[:512]
                        if total_read < MAX_TEXT_PARSE:
                            chunks.append(chunk)
                            total_read += len(chunk)
                    r.close()
                    if sniff_text(sample):
                        text = b"".join(chunks)[:MAX_TEXT_PARSE].decode("utf-8", "ignore")
                        return dict(url=url, rel=rel, status=200,
                                    size=total_read if size < 0 else size, text=text)
                    return dict(url=url, rel=rel, status=200, size=size, text=None)
            except requests.RequestException as e:
                return dict(url=url, rel=rel, status=0, size=0, text=None, err=str(e))
        else:
            st, size, err = self._download(url, rel)
            text = None
            if st == 200 and (self.workdir / rel).exists():
                with open(self.workdir / rel, "rb") as f:
                    sample = f.read(512)
                if sniff_text(sample):
                    try:
                        text = (self.workdir / rel).read_text("utf-8", "ignore")[:MAX_TEXT_PARSE]
                    except Exception:
                        text = None
            return dict(url=url, rel=rel, status=st, size=size, text=text, err=err)

    def crawl(self, entry_path, depth, max_bytes, log, scan=False):
        """BFS crawl. Returns {rel: (local_path_or_None, size)}."""
        entry_dir = entry_dir_of(entry_path)
        entry_url = self.base + "/" + entry_path.lstrip("/")
        queue = [entry_url]
        seen = set(queue)
        files = {}
        total = 0
        for level in range(depth + 1):
            if not queue:
                break
            # one fetch per path: query-string variants of the same file must not race
            rel_to_url = {}
            for u in queue:
                rel = site_rel(u)
                if rel and rel not in rel_to_url:
                    rel_to_url[rel] = u
            queue = []
            if not rel_to_url:
                break
            nxt = []
            with ThreadPoolExecutor(max_workers=self.workers) as pool:
                futs = {pool.submit(self.fetch, u, rel, scan): rel for rel, u in rel_to_url.items()}
                for fut in as_completed(futs):
                    r = fut.result()
                    url, rel, st = r["url"], r["rel"], r["status"]
                    if st != 200 or not rel:
                        if url == entry_url:
                            log(f"    !! entry request failed (status={st} {r.get('err') or ''}): {url}")
                        continue
                    size = r.get("size", 0) or 0
                    if r.get("oversize") or size > MAX_FILE:
                        log(f"    !! skipped oversized file: {rel} ({size / 1e9:.1f} GB)")
                        continue
                    if not scan:
                        total += size
                        files[rel] = (self.workdir / rel, size)
                        if total > max_bytes:
                            log("    !! per-game size cap hit; stopping this game's crawl")
                            return files
                    else:
                        files[rel] = (None, size)
                    if r.get("text"):
                        for ref in extract_refs(r["text"], url, self.host):
                            if ref in seen or not ref_allowed(ref, entry_dir, self.host):
                                continue
                            seen.add(ref)
                            nxt.append(ref)
            queue = nxt
        return files


# ----------------------------------------------------------------------------- upload
def existing_paths(api, bucket, paths, token):
    have = set()
    for i in range(0, len(paths), 100):
        chunk = paths[i:i + 100]
        try:
            for item in api.get_bucket_paths_info(bucket, paths=chunk, token=token):
                have.add(getattr(item, "path", str(item)))
        except Exception:
            pass
    return have


def upload_files(api, bucket, workdir, rels, token, log, batch_files=64, batch_mb=256):
    rels = sorted(set(rels))
    if not rels:
        return 0, 0
    have = existing_paths(api, bucket, rels, token)
    skipped = len([r for r in rels if r in have])
    todo = [r for r in rels if r not in have and (workdir / r).exists()]
    uploaded = 0
    batch, batch_bytes = [], 0

    def flush():
        nonlocal batch, batch_bytes, uploaded
        if not batch:
            return
        try:
            api.batch_bucket_files(
                bucket,
                add=[(str(workdir / r), r) for r in batch],
                token=token)
            uploaded += len(batch)
            log(f"    + bucket: {len(batch)} files / {batch_bytes / 1e6:.0f} MB")
        except Exception as e:
            log(f"    !! upload batch failed ({e}); those files retry on next run")
        batch, batch_bytes = [], 0

    for r in todo:
        size = (workdir / r).stat().st_size
        if batch and (len(batch) >= batch_files or batch_bytes + size > batch_mb * 1024 ** 2):
            flush()
        batch.append(r)
        batch_bytes += size
    flush()
    return uploaded, skipped


# ----------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(
        description="Mirror garbsoftball.com games into a Hugging Face Storage Bucket",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--manifest", default="games_manifest.json")
    ap.add_argument("--base", default=BASE, help="site to mirror (default: garbsoftball.com)")
    ap.add_argument("--bucket", default="smodusermc/garbsoftball-games")
    ap.add_argument("--token", default=None, help="HF token (default: $HF_TOKEN, else prompt)")
    ap.add_argument("--private", action="store_true", help="create the bucket as private")
    ap.add_argument("--workdir", default="./mirror_cache")
    ap.add_argument("--state", default="./mirror_state.json")
    ap.add_argument("--log", default="./mirror.log")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--depth", type=int, default=10)
    ap.add_argument("--max-gb-game", type=float, default=12.0)
    ap.add_argument("--only", default="", help="comma-separated name substrings to include")
    ap.add_argument("--skip", default="", help="comma-separated name substrings to exclude")
    ap.add_argument("--limit", type=int, default=0, help="process at most N local games")
    ap.add_argument("--start", default="", help="start from first game whose name contains this")
    ap.add_argument("--scan", action="store_true",
                    help="pre-scan only: discover files + sizes, write scan_report.json")
    ap.add_argument("--local-only", action="store_true", help="download only, no HF upload")
    ap.add_argument("--upload-only", action="store_true", help="upload files already in cache")
    ap.add_argument("--no-thumbnails", action="store_true")
    ap.add_argument("--no-site", action="store_true", help="skip shared wrapper/svg files")
    ap.add_argument("--batch-files", type=int, default=64)
    ap.add_argument("--batch-mb", type=int, default=256)
    args = ap.parse_args()

    workdir = Path(args.workdir).resolve()
    workdir.mkdir(parents=True, exist_ok=True)
    log = Log(args.log)
    manifest = json.loads(Path(args.manifest).read_text())
    games = manifest["games"]
    local = [g for g in games if g["kind"] == "local"]
    log(f"manifest: {manifest['total_parsed']} tiles, {len(local)} local, "
        f"{sum(1 for g in games if g['kind'] == 'proxy')} proxied (external)")

    if args.only:
        needles = [s.strip().lower() for s in args.only.split(",") if s.strip()]
        local = [g for g in local if any(n in g["name"].lower() for n in needles)]
    if args.skip:
        needles = [s.strip().lower() for s in args.skip.split(",") if s.strip()]
        local = [g for g in local if not any(n in g["name"].lower() for n in needles)]
    if args.start:
        for i, g in enumerate(local):
            if args.start.lower() in g["name"].lower():
                local = local[i:]
                break
    if args.limit:
        local = local[: args.limit]
    log(f"selected {len(local)} games")

    state = load_state(args.state)
    files_done = state.setdefault("files", {})
    game_files = state.setdefault("games", {})
    crawler = Crawler(workdir, base=args.base, workers=args.workers)

    api = token = None
    need_hf = args.upload_only or (not args.scan and not args.local_only)
    if need_hf:
        from huggingface_hub import HfApi, create_bucket
        token = args.token or os.environ.get("HF_TOKEN") or getpass.getpass("Hugging Face token: ")
        api = HfApi(token=token)
        if not args.upload_only:
            info = create_bucket(args.bucket, private=args.private or None,
                                 exist_ok=True, token=token)
            log(f"bucket ready: {args.bucket} url={getattr(info, 'url', '?')}")

    # shared wrapper files + all thumbnails (small, site-path layout)
    extras = []
    if not args.no_site:
        extras += [crawler.base + p for p in SHARED_SITE_FILES]
    if not args.no_thumbnails:
        extras += [g["thumb"] for g in games]
    if not args.scan and not args.upload_only:
        extras = list(dict.fromkeys(extras))
        for rel in (site_rel(u) for u in extras):
            if files_done.get(rel, {}).get("status") == "downloaded" and (workdir / rel).exists():
                continue
            st, n, err = crawler._download(crawler.base + "/" + rel, rel)
            if st == 200 and (workdir / rel).exists():
                files_done[rel] = {"status": "downloaded", "bytes": (workdir / rel).stat().st_size}
            else:
                log(f"  wrapper/thumb miss (status={st}): {rel}")
        save_state(state, args.state)
        log(f"wrappers+thumbnails cached ({len(extras)} requested)")

    scan_report, done, failed = {}, [], []
    for idx, g in enumerate(local, 1):
        name, entry = g["name"], g["entry_path"]
        log(f"[{idx}/{len(local)}] {name}  ->  {entry}")
        try:
            if args.upload_only:
                rels = game_files.get(name, [])
                if not rels:
                    log("    no cached file list for this game (never crawled); skipping")
                    failed.append(f"{name} ({entry}): no state entry")
                    continue
                if api:
                    up, sk = upload_files(api, args.bucket, workdir, rels, token, log,
                                          args.batch_files, args.batch_mb)
                    for r in rels:
                        files_done.setdefault(r, {})["status"] = "uploaded"
                    save_state(state, args.state)
                done.append(name)
                continue

            files = crawler.crawl(entry, args.depth, int(args.max_gb_game * 1e9),
                                  log, scan=args.scan)
            rels = sorted(files.keys())
            if args.scan:
                total = sum(v[1] for v in files.values() if v[1] and v[1] > 0)
                scan_report[name] = {"entry": entry, "files": len(rels), "bytes": total}
                log(f"    scan: {len(rels)} files, {total / 1e6:,.1f} MB")
                continue

            game_files[name] = sorted(set(game_files.get(name, [])) | set(rels))
            for r in rels:
                p = workdir / r
                if p.exists():
                    files_done[r] = {"status": "downloaded",
                                     "bytes": p.stat().st_size}
            save_state(state, args.state)
            total = sum(files[r][1] for r in rels)
            log(f"    {len(rels)} files total, {total / 1e6:,.1f} MB")
            if api and not args.local_only:
                up, sk = upload_files(api, args.bucket, workdir, rels, token, log,
                                      args.batch_files, args.batch_mb)
                for r in rels:
                    files_done.setdefault(r, {})["status"] = "uploaded"
                save_state(state, args.state)
                log(f"    bucket: {up} new, {sk} already present")
            done.append(name)
        except KeyboardInterrupt:
            log("interrupted — state saved; re-run to resume")
            raise
        except Exception as e:
            import traceback
            log(f"    !! FAILED: {e!r}")
            log(traceback.format_exc(limit=8))
            failed.append(f"{name} ({entry}): {e!r}")
        if idx % 5 == 0:
            save_state(state, args.state)

    # ---- summary / metadata
    if args.scan:
        total = sum(v["bytes"] for v in scan_report.values())
        Path("scan_report.json").write_text(json.dumps(scan_report, indent=1))
        log(f"SCAN COMPLETE: {len(scan_report)} games, "
            f"{sum(v['files'] for v in scan_report.values())} files, {total / 1e9:.2f} GB")
        log("Re-run without --scan to mirror + upload for real.")
    else:
        if api and not args.local_only:
            meta = workdir / "_meta"
            meta.mkdir(exist_ok=True)
            (meta / "manifest.json").write_text(json.dumps(manifest, indent=1))
            (meta / "README.md").write_text(build_readme(manifest, args.bucket, done, failed))
            upload_files(api, args.bucket, workdir,
                         ["_meta/manifest.json", "_meta/README.md"], token, log)
            log("meta uploaded")
        up = sum(1 for v in files_done.values() if v.get("status") == "uploaded")
        dl = len(files_done)
        gb = sum(v.get("bytes", 0) for v in files_done.values()) / 1e9
        log(f"DONE: games ok={len(done)} failed={len(failed)} | files={dl} ({gb:.2f} GB) "
            f"uploaded={up}")
        if failed:
            Path("failed_games.txt").write_text("\n".join(failed))
            log("failures -> failed_games.txt (re-run the job to retry them)")
        if api and not args.local_only:
            log(f"bucket: https://huggingface.co/buckets/{args.bucket}")
    log.close()


def build_readme(manifest, bucket, done, failed):
    L = [
        "# garbsoftball.com game archive",
        "",
        f"Unmodified mirror of the self-hosted games listed on "
        f"<https://garbsoftball.com/g>. Listing captured {manifest['retrieved']}; "
        f"files mirrored into Storage Bucket `{bucket}` with the site's original paths.",
        "",
        f"- Local games in manifest: **{manifest['local_count']}**",
        f"- Proxied (live third-party sites, intentionally not mirrored): **{manifest['proxy_count']}**",
        f"- Mirrored on the last run: **{len(done)}**",
        f"- Failed/skipped on the last run: **{len(failed)}**",
        "",
        "Bucket paths == site paths: `games/<dir>/...`, `gamefile/<name>.html`, `png/...`.",
        "Open a game by serving the bucket and visiting its entry path, e.g. "
        "`games/2048/index.html`.",
        "",
        "## Games",
        "",
        "| Name | Type | Entry / target |",
        "|---|---|---|",
    ]
    for g in manifest["games"]:
        if g["kind"] == "local":
            L.append(f"| {g['name'].replace('|', '/')} | local | `{g['entry_path']}` |")
        elif g["kind"] == "proxy":
            L.append(f"| {g['name'].replace('|', '/')} | proxy | {g['proxy_url']} |")
    if failed:
        L += ["", "## Failures on last run", ""] + [f"- {f}" for f in failed]
    L += [
        "",
        "## Notes",
        "- All content belongs to its original authors; this archive is a convenience mirror of files publicly served by garbsoftball.com.",
        "- Proxied games load external live services and were not mirrored.",
        "- Files referenced only via dynamically-built URLs (e.g. `assets/level${n}.png`) "
        "may be missing from a particular game; everything referenced literally was captured.",
        "",
    ]
    return "\n".join(L)


if __name__ == "__main__":
    main()
