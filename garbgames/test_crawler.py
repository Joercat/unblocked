#!/usr/bin/env python3
"""Mock garbsoftball-like site + end-to-end test of mirror_to_hf.py crawler/upload."""
import json, os, shutil, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import mirror_to_hf as M

ROOT = Path("/tmp/mocksite")
if ROOT.exists():
    shutil.rmtree(ROOT)
(ROOT / "games/demo").mkdir(parents=True)
(ROOT / "games/demo/assets").mkdir(parents=True)
(ROOT / "gamefile").mkdir(parents=True)
(ROOT / "png").mkdir(parents=True)

# Game: HTML referencing JS, CSS, image, audio (relative + absolute + query-string)
(ROOT / "games/demo/index.html").write_text("""<!doctype html>
<html><head>
<title>Demo</title>
<link rel="stylesheet" href="style.css">
<script src="main.js"></script>
<script src="https://garbsoftball.com/games/demo/engine.js"></script>
</head><body>
<img src="assets/logo.png">
<audio src="/games/demo/assets/bgm.ogg"></audio>
<video poster="assets/poster.jpg"></video>
<a href="../outside/nope.html">outside page (should be skipped)</a>
<script>
  var L = "assets/data.json";
  fetch('/games/demo/levels.json');
</script>
</body></html>""")

(ROOT / "games/demo/style.css").write_text(
    "body{background:url('assets/bg.webp');font-family:url('font.woff2')}")

# JS that references more files (nested), incl a query-string url and a cross-origin (skip)
(ROOT / "games/demo/main.js").write_text("""
const a = new Image(); a.src = "assets/a.png?v=3";
load("assets/deep/anim.gif");
bad = "https://cdn.example.com/evil.js";
data = "data:image/png;base64,AAAA";
""")

(ROOT / "games/demo/engine.js").write_text("""
fetch('assets/pack.unityweb');
fetch('Build/Boot.js');
""")

(ROOT / "games/demo/assets/logo.png").write_bytes(b"\x89PNG\r\n\x1a\n" + b"0" * 40)
(ROOT / "games/demo/assets/bg.webp").write_bytes(b"RIFF\x00\x00\x00\x00WEBP" + b"1" * 40)
(ROOT / "games/demo/assets/bgm.ogg").write_bytes(b"OggS" + b"2" * 40)
(ROOT / "games/demo/assets/poster.jpg").write_bytes(b"\xff\xd8\xff\xe0" + b"3" * 40)
(ROOT / "games/demo/font.woff2").write_bytes(b"wOF2" + b"4" * 40)
(ROOT / "games/demo/assets/data.json").write_text('{"sprite":"assets/deep/anim.gif","x":"https://garbsoftball.com/games/demo/extra.json"}')
(ROOT / "games/demo/assets/a.png").write_bytes(b"\x89PNG" + b"5" * 40)
(ROOT / "games/demo/assets/deep").mkdir(parents=True)
(ROOT / "games/demo/assets/deep/anim.gif").write_bytes(b"GIF89a" + b"6" * 40)
(ROOT / "games/demo/assets/pack.unityweb").write_bytes(b"UNITY" + b"7" * 60)
(ROOT / "games/demo/Build").mkdir()
(ROOT / "games/demo/Build/Boot.js").write_text('fetch("levels.json");')
(ROOT / "games/demo/levels.json").write_text('{"map":"assets/a.png"}')
(ROOT / "games/demo/extra.json").write_text('{"done":true}')
(ROOT / "gamefile/mini.html").write_text("<html><body>self-contained</body></html>")
(ROOT / "png/fullscreen.svg").write_text("<svg></svg>")

# ---- serve (start first so files can embed the real origin) ----
class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass
    def do_GET(self):
        p = self.path.split("?")[0].lstrip("/")
        f = ROOT / p
        if f.is_file():
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.end_headers()
            self.wfile.write(f.read_bytes())
        else:
            self.send_response(404); self.end_headers()
    do_HEAD = do_GET

srv = ThreadingHTTPServer(("127.0.0.1", 0), H)
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{port}"
print(f"mock site on {BASE}")

# rewrite the two files that embed an absolute same-origin URL
(ROOT / "games/demo/index.html").write_text(f"""<!doctype html>
<html><head>
<title>Demo</title>
<link rel="stylesheet" href="style.css">
<script src="main.js"></script>
<script src="{BASE}/games/demo/engine.js"></script>
</head><body>
<img src="assets/logo.png">
<audio src="/games/demo/assets/bgm.ogg"></audio>
<video poster="assets/poster.jpg"></video>
<a href="../outside/nope.html">outside page (should be skipped)</a>
<script>
  var L = "assets/data.json";
  fetch('/games/demo/levels.json');
</script>
</body></html>""")
(ROOT / "games/demo/assets/data.json").write_text(
    f'{{"sprite":"assets/deep/anim.gif","x":"{BASE}/games/demo/extra.json"}}')

workdir = Path("/tmp/mockwd"); shutil.rmtree(workdir, ignore_errors=True)
state_path = "/tmp/mock_state.json"
if os.path.exists(state_path): os.remove(state_path)

logs = []
log = lambda m: (logs.append(m), print("   ", m))

crawler = M.Crawler(workdir, base=BASE, workers=4)

print("\n=== SCAN MODE ===")
scan = crawler.crawl("games/demo/index.html", depth=8, max_bytes=10**12, log=log, scan=True)
print("scan found", len(scan), "files")
expected = {"games/demo/index.html","games/demo/style.css","games/demo/main.js",
  "games/demo/engine.js","games/demo/assets/logo.png","games/demo/assets/bgm.ogg",
  "games/demo/assets/poster.jpg","games/demo/assets/bg.webp","games/demo/font.woff2",
  "games/demo/assets/data.json","games/demo/assets/a.png","games/demo/assets/deep/anim.gif",
  "games/demo/assets/pack.unityweb","games/demo/Build/Boot.js","games/demo/levels.json",
  "games/demo/extra.json"}
missing = expected - set(scan)
extra = set(scan) - expected
print("MISSING:", missing or "none")
print("UNEXPECTED:", extra or "none")
assert not missing, f"crawler missed {missing}"

print("\n=== FULL CRAWL (download) ===")
files = crawler.crawl("games/demo/index.html", depth=8, max_bytes=10**12, log=log)
for rel in sorted(files):
    p = workdir / rel
    assert p.exists() and p.stat().st_size > 0, f"not downloaded: {rel}"
print("downloaded", len(files), "files; on-disk bytes:",
      sum((workdir/r).stat().st_size for r in files))

# second game, standalone gamefile
files2 = crawler.crawl("gamefile/mini.html", depth=4, max_bytes=10**12, log=log)
assert "gamefile/mini.html" in files2

# ---- upload against a fake HfApi ----
print("\n=== UPLOAD (fake HfApi) ===")
class FakeApi:
    def __init__(self): self.store = {}; self.calls = 0
    def get_bucket_paths_info(self, bucket, paths, token=None):
        class I: pass
        out = []
        for pth in paths:
            if pth in self.store:
                i = I(); i.path = pth; out.append(i)
        return iter(out)
    def batch_bucket_files(self, bucket, add, token=None):
        self.calls += 1
        for src, dst in add:
            self.store[dst] = (Path(src).stat().st_size)
        return None
api = FakeApi()
# pre-mark one file as already present to test skip
api.store["games/demo/style.css"] = 123
up, sk = M.upload_files(api, BASE and "user/bucket", workdir, list(files.keys()), "tok", log,
                        batch_files=3, batch_mb=1)
print("uploaded", up, "skipped(existing)", sk, "batches", api.calls, "stored", len(api.store))
assert "games/demo/style.css" in api.store  # still there
assert up > 0 and sk >= 1

# ---- resume: state roundtrip ----
print("\n=== STATE ROUNDTRIP ===")
st = {"files": {"games/demo/index.html": {"status": "uploaded", "bytes": 10}},
      "games": {"Demo": ["games/demo/index.html"]}}
M.save_state(st, state_path)
st2 = M.load_state(state_path)
assert st2 == st
print("state ok")

print("\n=== UNIT CHECKS ===")
# entry_dir_of
assert M.entry_dir_of("games/demo/index.html") == "/games/demo/"
assert M.entry_dir_of("games/demo/") == "/games/demo/"
assert M.entry_dir_of("gamefile/1v1.html") == "/gamefile/"
assert M.entry_dir_of("games/fnf/tord.html") == "/games/fnf/"
# absolute URL: same origin kept, other origin dropped
t = f'src="{BASE}/a.png" src="https://other.example.com/b.png" src="c.png"'
refs = M.extract_refs(t, BASE + "/games/x/index.html", "127.0.0.1:%d" % port)
assert f"{BASE}/a.png" in refs, refs
assert not any("other.example.com" in r for r in refs), refs
assert f"{BASE}/games/x/c.png" in refs, refs
# page refs scoped to entry dir
assert M.ref_allowed(f"{BASE}/games/fnf/other.html", "/games/fnf/", "127.0.0.1:%d" % port)
assert not M.ref_allowed(f"{BASE}/games/other/other.html", "/games/fnf/", "127.0.0.1:%d" % port)
assert M.ref_allowed(f"{BASE}/anything/asset.png", "/games/fnf/", "127.0.0.1:%d" % port)
print("unit checks ok")

print("\nALL TESTS PASSED")
srv.shutdown()
