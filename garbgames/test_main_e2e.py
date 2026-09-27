#!/usr/bin/env python3
"""End-to-end: run mirror_to_hf.main() against the mock site (local-only)."""
import json, os, shutil, sys, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path("/tmp/mocksite")  # from test_crawler.py build
for f in ("png/demo.webp", "png/mini.webp"):
    (ROOT / f).parent.mkdir(parents=True, exist_ok=True)
    (ROOT / f).write_bytes(b"WEBP" + b"9" * 32)

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        f = ROOT / self.path.split("?")[0].lstrip("/")
        if f.is_file():
            self.send_response(200); self.end_headers(); self.wfile.write(f.read_bytes())
        else:
            self.send_response(404); self.end_headers()
    do_HEAD = do_GET

srv = ThreadingHTTPServer(("127.0.0.1", 0), H)
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{port}"

# rewrite files that embed an absolute same-origin URL (fresh port per run)
(ROOT / "games/demo/index.html").write_text(f"""<!doctype html>
<html><head><title>Demo</title>
<link rel="stylesheet" href="style.css">
<script src="main.js"></script>
<script src="{BASE}/games/demo/engine.js"></script>
</head><body>
<img src="assets/logo.png">
<audio src="/games/demo/assets/bgm.ogg"></audio>
<script>fetch('/games/demo/levels.json');</script>
</body></html>""")
(ROOT / "games/demo/assets/data.json").write_text(
    f'{{"x":"{BASE}/games/demo/extra.json"}}')
(ROOT / "games/demo/main.js").write_text("""
const a = new Image(); a.src = "assets/a.png?v=3";
load("assets/deep/anim.gif");
bad = "https://cdn.example.com/evil.js";
""")
(ROOT / "games/demo/engine.js").write_text("""
fetch('assets/pack.unityweb');
fetch('Build/Boot.js');
""")

manifest = {
    "source": "https://garbsoftball.com/g",
    "retrieved": "2026-09-27",
    "site_shown_count": 3,
    "total_parsed": 3,
    "local_count": 2,
    "proxy_count": 1,
    "games": [
        {"name": "Demo", "kind": "local", "entry_path": "games/demo/index.html",
         "thumb": "https://garbsoftball.com/png/demo.webp", "wrapper": "iframe"},
        {"name": "Mini", "kind": "local", "entry_path": "gamefile/mini.html",
         "thumb": "https://garbsoftball.com/png/mini.webp", "wrapper": "iframe"},
        {"name": "Proxied Thing", "kind": "proxy", "proxy_url": "https://nowgg.fun/x.html",
         "thumb": "https://garbsoftball.com/png/px.webp", "entry_path": None},
    ],
}
mpath = "/tmp/mini_manifest.json"
Path(mpath).write_text(json.dumps(manifest))

wd = Path("/tmp/e2e_wd"); shutil.rmtree(wd, ignore_errors=True)
state = "/tmp/e2e_state.json"
if os.path.exists(state): os.remove(state)

sys.argv = ["mirror_to_hf.py", "--base", BASE, "--manifest", mpath,
            "--workdir", str(wd), "--state", state, "--log", "/tmp/e2e.log",
            "--local-only", "--workers", "4"]
import mirror_to_hf as M
M.main()

# ---- assertions ----
st = json.loads(Path(state).read_text())
rels = set(st["files"])
need = {"games/demo/index.html", "games/demo/main.js", "games/demo/assets/pack.unityweb",
        "gamefile/mini.html", "png/demo.webp", "png/mini.webp"}
missing = need - rels
assert not missing, f"e2e missing: {missing}"
assert st["games"]["Demo"] and "games/demo/index.html" in st["games"]["Demo"]
assert "Proxied Thing" not in st["games"]
print("\nE2E OK — state files:", len(rels), "| games tracked:", list(st["games"]))

# README generation (as main() would do at the end with api)
readme = M.build_readme(manifest, "smodusermc/garbsoftball-games", ["Demo", "Mini"], [])
assert "Demo" in readme and "nowgg.fun/x.html" in readme
print("README ok, %d lines" % len(readme.splitlines()))
srv.shutdown()
