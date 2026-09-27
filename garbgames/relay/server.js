#!/usr/bin/env node
/**
 * GBM relay server — byte pipe between the browser crawl tab and the HF upload tab.
 * - serves / (landing), /scripts/garb.cjs, /scripts/hf-up.cjs
 * - POST /in/<path>     receive file bytes from the crawl tab (queue on disk)
 * - GET  /queue         list queued (complete) files
 * - GET  /out/<path>    serve queued file bytes to the upload tab
 * - POST /ack/<path>    upload tab acknowledges -> evict
 * - POST /progress      beacons from both tabs
 * - GET  /stats         dashboard state
 * CORS: *  (content-type text/plain on POSTs to avoid preflight entirely)
 */
const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const QUEUE = path.join(ROOT, "queue");
const META = path.join(QUEUE, ".meta");
const PROGRESS_FILE = path.join(ROOT, "progress.json");
const LOG_FILE = path.join(ROOT, "relay.log");
const PORT = parseInt(process.env.PORT || "8077", 10);
const MAX_QUEUE_BYTES = 8 * 1024 * 1024 * 1024; // 8 GB soft cap (evict oldest un-acked)
const MAX_FILE_BYTES = 6 * 1024 * 1024 * 1024;  // refuse single files > 6 GB

fs.mkdirSync(META, { recursive: true });

const log = (m) => {
  const line = `[${new Date().toISOString()}] ${m}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch {}
};

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length");
}
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(body);
}

const state = {
  startedAt: Date.now(),
  receivedFiles: 0,
  receivedBytes: 0,
  ackedFiles: 0,
  ackedBytes: 0,
  queue: {},      // rel -> {bytes, complete, at}
  progress: { garb: null, hf: null },
};
try {
  const p = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  state.progress = { ...state.progress, ...p };
} catch {}

function queueStats() {
  let n = 0, b = 0;
  for (const k in state.queue) {
    if (state.queue[k].complete) { n++; b += state.queue[k].bytes; }
  }
  return { files: n, bytes: b };
}

function evictIfNeeded() {
  const qs = queueStats();
  if (qs.bytes <= MAX_QUEUE_BYTES) return;
  // evict oldest complete (not yet acked) entries
  const entries = Object.entries(state.queue)
    .filter(([, v]) => v.complete)
    .sort((a, b) => a[1].at - b[1].at);
  for (const [rel, v] of entries) {
    if (qs.bytes <= MAX_QUEUE_BYTES) break;
    try {
      fs.rmSync(path.join(QUEUE, rel), { force: true });
      fs.rmSync(path.join(META, rel + ".json"), { force: true });
    } catch {}
    delete state.queue[rel];
    qs.bytes -= v.bytes;
    log(`evicted (queue cap): ${rel}`);
  }
}

async function persistProgress() {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state.progress));
  } catch {}
}

function safeRel(p) {
  // relative path, no traversal/absolute/NUL — spaces & unicode filenames allowed
  if (!p || p.includes("\0") || p.includes("\\")) return null;
  if (p.length > 1024) return null;
  const rel = p.replace(/^\/+/, "");
  const segs = rel.split("/");
  if (segs.length === 0 || segs.some((s) => s === "" || s === "." || s === "..")) return null;
  return rel;
}

const server = http.createServer(async (req, res) => {
  cors(res);
  const u = new URL(req.url, "http://x");
  const p = decodeURIComponent(u.pathname);

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // ---------- static ----------
  if (req.method === "GET") {
    if (p === "/" || p === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(fs.readFileSync(path.join(ROOT, "index.html")));
    }
    if (p === "/scripts/garb.cjs" || p === "/scripts/hf-up.cjs") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end(fs.readFileSync(path.join(ROOT, "scripts", p.split("/")[2])));
    }
    if (p === "/sdk/gbmsdk.mjs") {
      res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
      return res.end(fs.readFileSync(path.join(ROOT, "sdk", "gbmsdk.mjs")));
    }
    if (p === "/sdk/gbmsdk.iife.js") {
      res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
      return res.end(fs.readFileSync(path.join(ROOT, "sdk", "gbmsdk.iife.js")));
    }
    if (p === "/stats") {
      const qs = queueStats();
      return json(res, 200, {
        up: Date.now() - state.startedAt,
        received: { files: state.receivedFiles, bytes: state.receivedBytes },
        acked: { files: state.ackedFiles, bytes: state.ackedBytes },
        queue: qs,
        progress: state.progress,
      });
    }
    if (p === "/queue") {
      const out = Object.entries(state.queue)
        .filter(([, v]) => v.complete)
        .map(([rel, v]) => ({ path: rel, bytes: v.bytes }))
        .sort((a, b) => a.path.localeCompare(b.path));
      return json(res, 200, { files: out });
    }
    if (p.startsWith("/out/")) {
      const rel = safeRel(p.slice(5));
      const f = path.join(QUEUE, rel);
      if (!rel || !state.queue[rel]?.complete || !fs.existsSync(f)) return json(res, 404, { error: "not queued" });
      const st = fs.statSync(f);
      res.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Length": st.size });
      return fs.createReadStream(f).pipe(res);
    }
  }

  if (req.method === "POST") {
    if (p === "/progress") {
      let body = "";
      req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
      req.on("end", async () => {
        try {
          const j = JSON.parse(body);
          if (j.side === "garb" || j.side === "hf") {
            state.progress[j.side] = { ...j, ts: Date.now() };
            await persistProgress();
            log(`progress[${j.side}]: ${j.summary || ""}`);
          }
          json(res, 200, { ok: true });
        } catch (e) { json(res, 400, { error: String(e) }); }
      });
      return;
    }
    if (p.startsWith("/in/")) {
      const rel = safeRel(p.slice(4));
      if (!rel) return json(res, 400, { error: "bad path" });
      const dest = path.join(QUEUE, rel);
      const tmp = dest + ".part-" + crypto.randomBytes(4).toString("hex");
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      let n = 0;
      const out = fs.createWriteStream(tmp);
      req.pipe(out);
      req.on("data", (c) => {
        n += c.length;
        if (n > MAX_FILE_BYTES) {
          req.destroy();
          out.destroy();
          try { fs.rmSync(tmp, { force: true }); } catch {}
        }
      });
      out.on("finish", () => {
        fs.renameSync(tmp, dest);
        state.queue[rel] = { bytes: n, complete: true, at: Date.now() };
        state.receivedFiles++;
        state.receivedBytes += n;
        evictIfNeeded();
        const qs = queueStats();
        log(`queued: ${rel} (${n} bytes) queue=${qs.files} files / ${(qs.bytes / 1e9).toFixed(2)} GB`);
        json(res, 200, { ok: true, bytes: n });
      });
      out.on("error", (e) => {
        try { fs.rmSync(tmp, { force: true }); } catch {}
        if (res.writeHead) json(res, 500, { error: String(e) });
      });
      return;
    }
    if (p.startsWith("/ack/")) {
      const rel = safeRel(p.slice(5));
      if (rel && state.queue[rel]) {
        const b = state.queue[rel].bytes;
        try {
          fs.rmSync(path.join(QUEUE, rel), { force: true });
          fs.rmSync(path.join(META, rel + ".json"), { force: true });
        } catch {}
        delete state.queue[rel];
        state.ackedFiles++;
        state.ackedBytes += b;
        log(`acked: ${rel}`);
        return json(res, 200, { ok: true });
      }
      return json(res, 404, { error: "not queued" });
    }
  }

  json(res, 405, { error: "method not allowed" });
});

server.listen(PORT, "0.0.0.0", () => log(`GBM relay listening on :${PORT}`));
