#!/usr/bin/env python3
"""
Unblocked Arcade — offline game server.

Serves the whole site as static files (works with no internet) and provides
on-demand ZIP downloads under /downloads/:

    /downloads/<slug>.zip     -> zip of one game (browser game dir or single .tic cart)
    /downloads/all-games.zip  -> zip of the entire archive (all games + player)

Zips are built lazily on first request and cached in the cache dir
(default: <repo>/../downloads-zips), so repeat downloads are instant.

Usage:  python3 server.py [port]     (default port 8000, binds 0.0.0.0)
"""
import json
import os
import sys
import zipfile
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
ZIP_CACHE = os.environ.get(
    "ZIP_CACHE", os.path.join(os.path.dirname(ROOT), "downloads-zips")
)
os.makedirs(ZIP_CACHE, exist_ok=True)


def load_catalog():
    with open(os.path.join(ROOT, "catalog.json"), "rb") as fh:
        return json.load(fh)


def zip_game(catalog, slug, target):
    """Write a zip for one game into target. Returns (path, mtime)."""
    if os.path.isfile(target):
        return target, os.path.getmtime(target)
    game = next((g for g in catalog["games"] if g["slug"] == slug), None)
    tmp = target + ".part"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zf:
        if game is None:
            raise FileNotFoundError(slug)
        if game["type"] == "tic80":
            p = os.path.join(ROOT, game["filelist"][0])
            zf.write(p, game["slug"] + ".tic")
        else:
            base = os.path.join(ROOT, "games", game["slug"])
            for f in game["filelist"]:
                zf.write(os.path.join(base, f), os.path.join(game["slug"], f))
    os.replace(tmp, target)
    return target, os.path.getmtime(target)


def zip_all(target):
    if os.path.isfile(target):
        return target, os.path.getmtime(target)
    catalog = load_catalog()
    tmp = target + ".part"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zf:
        for g in catalog["games"]:
            if g["type"] == "tic80":
                p = os.path.join(ROOT, g["filelist"][0])
                zf.write(p, os.path.join("carts", os.path.basename(p)))
            else:
                base = os.path.join(ROOT, "games", g["slug"])
                for f in g["filelist"]:
                    zf.write(os.path.join(base, f),
                             os.path.join("games", g["slug"], f))
        for name in ("tic80.js", "tic80.wasm"):
            zf.write(os.path.join(ROOT, "player", name),
                     os.path.join("player", name))
    os.replace(tmp, target)
    return target, os.path.getmtime(target)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.address_string(), fmt % args))

    def _serve_file(self, path, name):
        try:
            size = os.path.getsize(path)
            mtime = os.path.getmtime(path)
        except OSError:
            self.send_error(404, "Not found")
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/zip")
        self.send_header("Content-Length", str(size))
        self.send_header("Content-Disposition", 'attachment; filename="%s"' % name)
        self.send_header("Last-Modified", self.date_time_string(mtime))
        self.send_header("Cache-Control", "private, max-age=3600")
        self.end_headers()
        with open(path, "rb") as fh:
            self.wfile.write(fh.read())

    def do_GET(self):
        path = unquote(self.path.split("?", 1)[0])
        if path.startswith("/downloads/"):
            name = path[len("/downloads/"):]
            try:
                if name == "all-games.zip":
                    target = os.path.join(ZIP_CACHE, "all-games.zip")
                    self.log_message("building all-games.zip (first run may take a minute)")
                    p, _ = zip_all(target)
                elif name.endswith(".zip") and "/" not in name:
                    target = os.path.join(ZIP_CACHE, name)
                    catalog = load_catalog()
                    p, _ = zip_game(catalog, name[:-4], target)
                else:
                    self.send_error(404, "Not found")
                    return
                self._serve_file(p, name)
            except FileNotFoundError:
                self.send_error(404, "Unknown game")
            except Exception as exc:  # noqa: BLE001
                self.log_message("zip error: %s", exc)
                self.send_error(500, "Zip build failed")
            return
        super().do_GET()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    catalog = load_catalog()
    print("Unblocked Arcade: %d games (browser: %d, TIC-80: %d)"
          % (catalog["stats"]["total"], catalog["stats"]["browser"], catalog["stats"]["tic80"]))
    print("Serving %s on http://0.0.0.0:%d  (zip cache: %s)" % (ROOT, port, ZIP_CACHE))
    httpd.serve_forever()


if __name__ == "__main__":
    main()
