/* GBM test suite — run with: node test_relay.js */
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const http = require("http");

const core = require("./scripts/garb.cjs");
let passed = 0, failed = 0;
const ok = (cond, label) => { if (cond) { passed++; console.log("  ✓ " + label); } else { failed++; console.log("  ✗ " + label); } };
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");

const ORIGIN = "http://127.0.0.1:18078";

(async () => {
  // ============ 1. CRC32 ============
  console.log("\n[1] crc32");
  ok(core.crc32(Buffer.from("123456789")) === 0xCBF43926, "crc32('123456789') = CBF43926");
  ok(core.crc32(new Uint8Array(0)) === 0, "crc32(empty) = 0");

  // ============ 2. ZIP writer ============
  console.log("\n[2] zip writer");
  const f1 = Buffer.alloc(300000); for (let i = 0; i < f1.length; i++) f1[i] = (i * 31 + 7) & 0xFF; // compressible-ish pattern
  const f2 = crypto.randomBytes(2000); // random -> stored
  const f3 = Buffer.from("hello world\n".repeat(100));
  const blob = await core.makeZip([
    { name: "games/g1/big.bin", bytes: new Uint8Array(f1) },
    { name: "games/g1/rand.bin", bytes: new Uint8Array(f2) },
    { name: "top.txt", bytes: new Uint8Array(f3) },
  ]);
  const zipBuf = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync("/tmp/gbm_test.zip", zipBuf);
  const pyCheck = JSON.parse(execSync(`python3 -c "
import zipfile, json, base64
z = zipfile.ZipFile('/tmp/gbm_test.zip')
bad = z.testzip()
out = {'names': z.namelist(), 'bad': bad, 'data': [base64.b64encode(z.read(n)).decode() for n in z.namelist()]}
print(json.dumps(out))
"`).toString());
  ok(JSON.stringify(pyCheck.names) === JSON.stringify(["games/g1/big.bin", "games/g1/rand.bin", "top.txt"]), "zip contains 3 entries, order preserved");
  ok(pyCheck.bad === null, "zip CRCs all valid (python testzip)");
  ok(Buffer.from(pyCheck.data[0], "base64").equals(f1), "entry 1 bytes match (deflated)");
  ok(Buffer.from(pyCheck.data[1], "base64").equals(f2), "entry 2 bytes match (stored)");
  ok(Buffer.from(pyCheck.data[2], "base64").equals(f3), "entry 3 bytes match");
  const zSize = zipBuf.length;
  ok(zSize < f1.length + f2.length + f3.length, `zip smaller than raw (${zSize} < ${f1.length + f2.length + f3.length})`);

  // ============ 3. ref extraction ============
  console.log("\n[3] ref extraction");
  const html = `<!doctype html><html><head><link rel="stylesheet" href="style.css">
<script src="/gamefile/games/g1/loader.js"></script></head>
<body><img src="img/hero.webp" data-src="img/hero2.webp">
<video poster="p.jpg" src="v.mp4"></video>
<img srcset="a1.jpg 1x, a2.jpg 2x">
<a href="level2.html">next</a><a href="../other/page.html">outside</a>
<script>const u = "${ORIGIN}/gamefile/games/g1/level.dat"; const x = "https://evil.example.com/x.js";</script>
</body></html>`;
  const refs = core.extractRefs(html, ORIGIN + "/games/g1/index.html", ORIGIN, false);
  const rset = new Set(refs);
  ok(rset.has(ORIGIN + "/games/g1/style.css"), "css href found");
  ok(rset.has(ORIGIN + "/gamefile/games/g1/loader.js"), "js src (absolute) found");
  ok(rset.has(ORIGIN + "/games/g1/img/hero.webp"), "img src found");
  ok(rset.has(ORIGIN + "/games/g1/img/hero2.webp"), "data-src found");
  ok(rset.has(ORIGIN + "/games/g1/p.jpg"), "poster found");
  ok(rset.has(ORIGIN + "/games/g1/v.mp4"), "video src found");
  ok(rset.has(ORIGIN + "/games/g1/a1.jpg") && rset.has(ORIGIN + "/games/g1/a2.jpg"), "srcset split");
  ok(rset.has(ORIGIN + "/games/g1/level2.html"), "relative html found");
  ok(rset.has(ORIGIN + "/games/other/page.html"), "sibling html found (scoping done later)");
  ok(rset.has(ORIGIN + "/gamefile/games/g1/level.dat"), "absolute same-site js string found");
  ok(![...rset].some((u) => u.includes("evil.example.com")), "external URL excluded");
  ok(!rset.has("https://evil.example.com/x.js"), "no external in list");

  const css = `@font-face { src: url("../shared/font.woff2"); } body { background: url("bg.png"); }`;
  const crefs = core.extractRefs(css, ORIGIN + "/games/g1/style.css", ORIGIN, false);
  ok(crefs.includes(ORIGIN + "/games/shared/font.woff2"), "css url() relative found");
  ok(crefs.includes(ORIGIN + "/games/g1/bg.png"), "css url() same-dir found");

  // ============ 4. entry-dir scoping ============
  console.log("\n[4] entry-dir scoping");
  const ed = core.entryDirOf("games/g1/index.html");
  ok(ed === "/games/g1/", "entryDirOf");
  ok(core.refAllowed(ORIGIN + "/games/g1/x.html", ed, ORIGIN) === true, "html in dir allowed");
  ok(core.refAllowed(ORIGIN + "/games/other/x.html", ed, ORIGIN) === false, "html outside dir blocked");
  ok(core.refAllowed(ORIGIN + "/games/shared/font.woff2", ed, ORIGIN) === true, "asset anywhere allowed");
  ok(core.refAllowed(ORIGIN + "/games/g1/page", ed, ORIGIN) === false, "no-ext page blocked");
  ok(core.refAllowed(ORIGIN + "/games/g1/a.png?v=2", ed, ORIGIN) === true, "asset with query allowed");

  // ============ 5. mock game site ============
  console.log("\n[5] mock game site");
  const siteFiles = {};
  const addSite = (p, content) => { siteFiles[p] = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8"); };
  addSite("/games/g1/index.html", `<!doctype html><html><head><link rel="stylesheet" href="style.css"></head>
<body><script src="/gamefile/games/g1/loader.js"></script>
<img src="img/hero.webp"><img src="bin/blob.bin">
<a href="level2.html">next</a><a href="../other/page.html">outside</a></body></html>`);
  addSite("/games/g1/style.css", `@font-face{src:url("../shared/font.woff2")}`);
  addSite("/games/g1/level2.html", `<img src="deep/inner.jpg">`);
  addSite("/gamefile/games/g1/loader.js", `const urls = ["/gamefile/games/g1/level.dat", "/games/g1/anim.webp", "https://evil.example.com/nope.js"];`);
  addSite("/gamefile/games/g1/level.dat", crypto.randomBytes(1500));
  addSite("/games/g1/anim.webp", crypto.randomBytes(640));
  addSite("/games/g1/img/hero.webp", crypto.randomBytes(1000));
  addSite("/games/g1/bin/blob.bin", crypto.randomBytes(5000));
  addSite("/games/g1/deep/inner.jpg", crypto.randomBytes(800));
  addSite("/games/shared/font.woff2", crypto.randomBytes(700));
  addSite("/games/other/page.html", `<img src="sneaky.png">`);
  addSite("/games/g2/index.html", `<script src="/gamefile/g2/unityweb.unityweb"></script><img src="thumb.png">`);
  addSite("/gamefile/g2/unityweb.unityweb", crypto.randomBytes(4000));
  addSite("/games/g2/thumb.png", crypto.randomBytes(300));

  const site = http.createServer((req, res) => {
    const p = req.url.split("?")[0];
    if (siteFiles[p]) { res.writeHead(200, { "Content-Type": "application/octet-stream" }); res.end(siteFiles[p]); }
    else { res.writeHead(404); res.end("nope"); }
  });
  await new Promise((r) => site.listen(18078, "127.0.0.1", r));

  const fetchBytes = async (url) => {
    const r = await fetch(url);
    return { status: r.status, bytes: r.ok ? new Uint8Array(await r.arrayBuffer()) : null };
  };
  const noop = () => {};
  const stopped = () => false;
  const paused = () => false;
  const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

  // ============ 6. e2e: crawl g1 & g2 ============
  console.log("\n[6] crawl (real core vs mock site)");
  const g1 = await core.crawlGameCore("games/g1/index.html", { origin: ORIGIN, fetchBytes, isStopped: stopped, isPaused: paused, sleep: sleepMs, log: noop });
  const g1rels = Object.keys(g1).sort();
  const wantG1 = ["games/g1/index.html", "games/g1/style.css", "games/g1/level2.html", "gamefile/games/g1/loader.js",
    "games/g1/img/hero.webp", "games/g1/bin/blob.bin", "games/g1/deep/inner.jpg", "games/shared/font.woff2",
    "games/g1/anim.webp", "gamefile/games/g1/level.dat"];
  ok(g1rels.length === wantG1.length, `g1 crawled ${wantG1.length} files (got ${g1rels.length}: ${g1rels.join(", ")})`);
  for (const want of wantG1) ok(g1rels.includes(want), `g1 has ${want}`);
  ok(!g1rels.includes("games/other/page.html"), "g1 excluded sibling-dir html (scoping)");
  ok(!Object.keys(g1).some((k) => k.includes("evil")), "g1 excluded external refs");
  // byte integrity
  let byteOk = true;
  for (const [rel, bytes] of Object.entries(g1)) if (!Buffer.from(bytes).equals(siteFiles["/" + rel])) byteOk = false;
  ok(byteOk, "all g1 bytes match source");

  const g2 = await core.crawlGameCore("games/g2/index.html", { origin: ORIGIN, fetchBytes, isStopped: stopped, isPaused: paused, sleep: sleepMs, log: noop });
  const g2rels = Object.keys(g2).sort();
  ok(g2rels.length === 3, `g2 crawled 3 files (got ${g2rels.length})`);
  ok(g2rels.includes("gamefile/g2/unityweb.unityweb"), "g2 has unityweb (non-text, referenced)");

  // ============ 7. relay server ============
  console.log("\n[7] relay server");
  const QUEUE = path.join(__dirname, "queue");
  fs.rmSync(QUEUE, { recursive: true, force: true });
  const server = spawn(process.execPath, [path.join(__dirname, "server.js")], {
    env: { ...process.env, PORT: "18077" }, stdio: ["ignore", "pipe", "pipe"],
  });
  let serverLog = "";
  server.stdout.on("data", (d) => (serverLog += d));
  server.stderr.on("data", (d) => (serverLog += d));
  await new Promise((r) => setTimeout(r, 900));
  const R = "http://127.0.0.1:18077";

  let r = await fetch(R + "/stats");
  ok(r.ok, "relay /stats 200");
  r = await fetch(R + "/nonexistent", { method: "POST", body: "x" });
  ok(r.status === 405, "unknown POST -> 405");

  const payload = crypto.randomBytes(1_000_000);
  r = await fetch(R + "/in/games/g1/img/hero.webp", { method: "POST", body: payload, headers: { "Content-Type": "text/plain" } });
  ok(r.ok, "POST /in 1MB -> 200");
  let q = await (await fetch(R + "/queue")).json();
  ok(q.files.length === 1 && q.files[0].path === "games/g1/img/hero.webp" && q.files[0].bytes === 1e6, "queue lists file+size");
  const got = Buffer.from(await (await fetch(R + "/out/games/g1/img/hero.webp")).arrayBuffer());
  ok(got.equals(payload), "GET /out bytes exact");
  r = await fetch(R + "/ack/games/g1/img/hero.webp", { method: "POST" });
  ok(r.ok, "POST /ack 200");
  q = await (await fetch(R + "/queue")).json();
  ok(q.files.length === 0, "queue empty after ack");
  const stats = await (await fetch(R + "/stats")).json();
  ok(stats.received.files === 1 && stats.acked.files === 1, "stats counts");

  r = await fetch(R + "/in/%2e%2e%2fetc%2fpasswd", { method: "POST", body: "x" });
  ok(r.status === 400, "path traversal (encoded) rejected (400)");
  // filename with a space round-trips (garb script sends %20)
  r = await fetch(R + "/in/games/g1/a%20b.bin", { method: "POST", body: "y" });
  ok(r.ok, "POST /in with %20 in name -> 200");
  q = await (await fetch(R + "/queue")).json();
  ok(q.files.some((f) => f.path === "games/g1/a b.bin"), "space filename round-trips");
  await fetch(R + "/ack/games/g1/a%20b.bin", { method: "POST" });

  r = await fetch(R + "/progress", { method: "POST", body: JSON.stringify({ side: "garb", summary: "test beacon", files: 5, bytes: 100 }), headers: { "Content-Type": "text/plain" } });
  ok(r.ok, "POST /progress 200");
  const stats2 = await (await fetch(R + "/stats")).json();
  ok(stats2.progress.garb && stats2.progress.garb.summary === "test beacon", "progress stored");

  // CORS
  const ho = await fetch(R + "/queue", { method: "OPTIONS" });
  ok(ho.status === 204 && ho.headers.get("access-control-allow-origin") === "*", "OPTIONS preflight 204 + ACAO *");
  const hq = await fetch(R + "/queue");
  ok(hq.headers.get("access-control-allow-origin") === "*", "GET CORS *");

  // ============ 8. full e2e: push crawl output -> consume like HF tab ============
  console.log("\n[8] e2e: crawl -> relay -> HF-style consumer");
  const baseStats = await (await fetch(R + "/stats")).json();
  const all = { ...g1, ...g2 };
  for (const [rel, bytes] of Object.entries(all)) {
    const rr = await fetch(R + "/in/" + encodeURIComponent(rel).replace(/%2F/g, "/"), { method: "POST", body: bytes, headers: { "Content-Type": "text/plain" } });
    if (!rr.ok) { ok(false, "push " + rel); }
  }
  ok(true, `pushed ${Object.keys(all).length} files to relay`);
  // consumer loop (mirrors hf-up.cjs)
  const consumed = {};
  for (let round = 0; round < 5; round++) {
    const qj = await (await fetch(R + "/queue")).json();
    if (!qj.files.length) break;
    for (const f of qj.files.slice(0, 4)) {
      const rr = await fetch(R + "/out/" + encodeURIComponent(f.path).replace(/%2F/g, "/"));
      const bytes = Buffer.from(await rr.arrayBuffer());
      consumed[f.path] = bytes;
      await fetch(R + "/ack/" + encodeURIComponent(f.path).replace(/%2F/g, "/"), { method: "POST" });
    }
  }
  const finalQ = await (await fetch(R + "/queue")).json();
  ok(finalQ.files.length === 0, "queue drained");
  ok(Object.keys(consumed).length === Object.keys(all).length, `consumer got all ${Object.keys(all).length} files`);
  let integrity = true;
  for (const [p, b] of Object.entries(consumed)) if (!b.equals(siteFiles["/" + p])) { integrity = false; console.log("  mismatch: " + p); }
  ok(integrity, "every consumed file byte-identical to mock site");
  const fstats = await (await fetch(R + "/stats")).json();
  ok(fstats.acked.files === baseStats.acked.files + Object.keys(all).length, "acked count matches");

  server.kill();
  site.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("FATAL", e); process.exit(2); });
