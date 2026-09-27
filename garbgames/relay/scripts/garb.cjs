/* ============================================================
 * GBM — garbsoftball.com mirror crawler (Tab A)
 * Paste the full block from the GBM landing page into the
 * DevTools console of a https://garbsoftball.com/g tab.
 *
 * Crawls every local game on the site (same-origin), streams
 * each file to the GBM relay; auto-falls-back to ZIP batches
 * (downloaded to your machine) if the relay is unreachable.
 * Progress is kept in localStorage — re-paste to resume.
 * ============================================================ */
// ---------------- pure core (browser + node testable) ----------------
const ASSET_EXT = /\.(?:js|mjs|cjs|css|png|jpe?g|webp|avif|gif|svg|ico|mp3|ogg|oga|wav|m4a|aac|flac|json|wasm|data|unityweb|assets|mem|glb|gltf|bin|fnt|ttf|otf|woff2?|mp4|webm|dat|plist|pck|vpk|bsp|pk3|gpk|txt|xml|map)(?:$|[?#])/i;
const REF_RE = /(?:["'(]|=)\s*([A-Za-z0-9_./:%+~!-][^"'\s<>{}|\\^]{0,2000}?)["')]/g;
const ABS_URL_RE = /https?:\/\/[^\s"'<>{}|\\^)\]]+/g;

function allowedHosts(origin) {
  try {
    const h = new URL(origin).host.toLowerCase();
    const bare = h.replace(/^www\./, "").split(":")[0];
    return new Set([h, bare, "www." + bare]);
  } catch { return new Set(); }
}
function sameSite(url, origin) {
  try {
    const h = new URL(url, origin).host.toLowerCase();
    const hs = allowedHosts(origin);
    return hs.has(h) || hs.has(h.split(":")[0]) || hs.has("www." + h.split(":")[0]);
  } catch { return false; }
}
function relOf(url, origin) {
  try { return decodeURIComponent(new URL(url, origin).pathname).replace(/^\/+/, ""); } catch { return ""; }
}
function sniffText(bytes) {
  if (!bytes.length) return false;
  const n = Math.min(bytes.length, 512);
  let printable = 0;
  for (let i = 0; i < n; i++) { const b = bytes[i]; if (b === 0) return false; if (b === 9 || (b >= 32 && b < 127) || b >= 128) printable++; }
  return printable / n > 0.93;
}
function toText(bytes) { return new TextDecoder("utf-8", { fatal: false }).decode(bytes); }

function extractRefs(text, base, origin, hasDomParser) {
  const out = [];
  if (hasDomParser && /^\s*</.test(text.slice(0, 200))) {
    try {
      const doc = new DOMParser().parseFromString(text, "text/html");
      for (const el of doc.querySelectorAll("*")) {
        for (const attr of ["src", "href", "poster", "data"]) {
          const v = el.getAttribute && el.getAttribute(attr);
          if (v) out.push(v.trim());
        }
        const ss = el.getAttribute && el.getAttribute("srcset");
        if (ss) for (const part of ss.split(",")) out.push(part.trim().split(/\s+/)[0]);
      }
    } catch {}
  }
  let m;
  REF_RE.lastIndex = 0;
  while ((m = REF_RE.exec(text))) out.push(m[1]);
  ABS_URL_RE.lastIndex = 0;
  while ((m = ABS_URL_RE.exec(text))) out.push(m[0]);
  // srcset (defense for non-DOMParser paths)
  const SRCSET_RE = /srcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = SRCSET_RE.exec(text))) for (const part of m[1].split(",")) out.push(part.trim().split(/\s+/)[0]);

  const dedup = new Set(); const res = [];
  for (let ref of out) {
    ref = ref.trim();
    if (!ref || /^(data:|blob:|javascript:|#|\/\/)/.test(ref)) continue;
    let abs;
    try { abs = new URL(ref, base).href; } catch { continue; }
    if (!sameSite(abs, origin) || dedup.has(abs)) continue;
    dedup.add(abs);
    res.push(abs);
  }
  return res;
}

function entryDirOf(entryPath) {
  let e = "/" + entryPath.replace(/^\/+/, "");
  if (e.endsWith("/")) return e;
  return e.slice(0, e.lastIndexOf("/")) + "/";
}
function refAllowed(ref, entryDir, origin) {
  if (!sameSite(ref, origin)) return false;
  let p;
  try { p = decodeURIComponent(new URL(ref, origin).pathname); } catch { return false; }
  const lp = p.toLowerCase();
  if (ASSET_EXT.test(lp)) return true;
  if (/\.html?$/.test(lp)) return lp.startsWith(entryDir.toLowerCase());
  return false;
}

// ---------------- zip writer (fallback mode) ----------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
async function deflateRaw(bytes) {
  if (typeof CompressionStream === "undefined") return { data: bytes, method: 0 };
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    const buf = await new Response(stream).arrayBuffer();
    return { data: new Uint8Array(buf), method: 8 };
  } catch { return { data: bytes, method: 0 }; }
}
function zipLocalHeader(name, method, crc, csize, usize) {
  const enc = new TextEncoder().encode(name);
  const h = new DataView(new ArrayBuffer(30));
  h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0, true);
  h.setUint16(8, method, true); h.setUint16(10, 0, true); h.setUint16(12, 0, true);
  h.setUint32(14, crc, true); h.setUint32(18, csize, true); h.setUint32(22, usize, true);
  h.setUint16(26, enc.length, true); h.setUint16(28, 0, true);
  return [new Uint8Array(h.buffer), enc];
}
function zipCentralHeader(name, method, crc, csize, usize, offset) {
  const enc = new TextEncoder().encode(name);
  const h = new DataView(new ArrayBuffer(46));
  h.setUint32(0, 0x02014b50, true); h.setUint16(4, 20, true); h.setUint16(6, 20, true);
  h.setUint16(8, 0, true); h.setUint16(10, method, true); h.setUint16(12, 0, true); h.setUint16(14, 0, true);
  h.setUint32(16, crc, true); h.setUint32(20, csize, true); h.setUint32(24, usize, true);
  h.setUint16(28, enc.length, true); h.setUint16(30, 0, true); h.setUint16(32, 0, true);
  h.setUint16(34, 0, true); h.setUint16(36, 0, true); h.setUint32(38, 0, true); h.setUint32(42, offset, true);
  return [new Uint8Array(h.buffer), enc];
}
async function makeZip(entries) { // [{name, bytes}]
  const parts = []; const central = []; let offset = 0;
  for (const e of entries) {
    const crc = crc32(e.bytes);
    const { data, method } = e.bytes.length > 65536 ? await deflateRaw(e.bytes) : { data: e.bytes, method: 0 };
    const [lh, nameB] = zipLocalHeader(e.name, method, crc, data.length, e.bytes.length);
    parts.push(lh, nameB, data);
    const [ch, nameC] = zipCentralHeader(e.name, method, crc, data.length, e.bytes.length, offset);
    central.push(ch, nameC);
    offset += lh.length + nameB.length + data.length;
  }
  const cdSize = central.reduce((s, p) => s + p.length, 0);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true); eocd.setUint16(8, entries.length, true); eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, cdSize, true); eocd.setUint32(16, offset, true);
  parts.push(...central, new Uint8Array(eocd.buffer));
  return new Blob(parts, { type: "application/zip" });
}

// ---------------- crawl core (browser + node testable) ----------------
// cfg: { origin, fetchBytes(url) -> {status, bytes}, maxGbGame, depth, workers,
//        isStopped() -> bool, isPaused() -> bool, sleep(ms) -> promise, log(msg) }
async function crawlGameCore(entryPath, cfg) {
  const { origin, fetchBytes, isStopped, isPaused, sleep, log } = cfg;
  const maxGbGame = cfg.maxGbGame || 12;
  const depth = cfg.depth ?? 10;
  const workers = cfg.workers || 4;
  const entryDir = entryDirOf(entryPath);
  const entryUrl = origin + "/" + entryPath.replace(/^\/+/, "");
  const extract = cfg.extractRefs || ((text, base) => extractRefs(text, base, origin, false));
  const queue = [entryUrl];
  const seen = new Set(queue);
  const files = {};
  let total = 0;
  for (let level = 0; level <= depth && queue.length; level++) {
    const relToUrl = {};
    for (const u of queue) { const rp = relOf(u, origin); if (rp && !(rp in relToUrl)) relToUrl[rp] = u; }
    queue.length = 0;
    const urls = Object.entries(relToUrl);
    if (!urls.length) break;
    const nxt = [];
    for (let i = 0; i < urls.length; i += workers) {
      if (isStopped()) return files;
      while (isPaused()) { await sleep(500); if (isStopped()) return files; }
      const batch = urls.slice(i, i + workers);
      const results = await Promise.all(batch.map(async ([rp, u]) => {
        try {
          const r = await fetchBytes(u);
          return { rp, u, ...r };
        } catch (e) { return { rp, u, status: 0, bytes: null, err: String(e) }; }
      }));
      for (const r of results) {
        if (r.status !== 200 || !r.bytes) {
          if (r.u === entryUrl) log(`!! entry failed (status=${r.status}) ${r.u} ${r.err || ""}`);
          continue;
        }
        if (r.bytes.length > 5e9) { log(`!! skipped oversized: ${r.rp}`); continue; }
        total += r.bytes.length;
        if (total > maxGbGame * 1e9) { log("!! per-game cap hit; stopping crawl of this game"); return files; }
        files[r.rp] = r.bytes;
        if (sniffText(r.bytes)) {
          let text;
          try { text = toText(r.bytes.slice(0, 20 * 1024 * 1024)); } catch { text = ""; }
          for (const ref of extract(text, r.u)) {
            if (!seen.has(ref) && refAllowed(ref, entryDir, origin)) { seen.add(ref); nxt.push(ref); }
          }
        }
      }
    }
    queue.push(...nxt);
  }
  return files;
}

// ---------------- node exports for tests ----------------
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ASSET_EXT, REF_RE, ABS_URL_RE, sameSite, relOf, sniffText, toText, extractRefs, entryDirOf, refAllowed, crc32, deflateRaw, makeZip, zipLocalHeader, zipCentralHeader, crawlGameCore };
}

// ---------------- browser app ----------------
if (typeof window !== "undefined" && typeof document !== "undefined" && typeof location !== "undefined") {
  (() => {
    "use strict";
    if (typeof GBM === "undefined") {
      console.error("%cGBM: missing config. Copy the full block from the GBM landing page (it starts with `const GBM = ...`).", "color:#f66;font-weight:bold");
      return;
    }
    if (window.__GBM_RUNNING__) {
      console.warn("GBM is already running — use the PAUSE/STOP buttons in the dashboard.");
      return;
    }
    window.__GBM_RUNNING__ = true;

    const ORIGIN = location.origin;
    const RELAY = (GBM.relay || "").replace(/\/+$/, "");
    const BUCKET = GBM.bucket || "smodusermc/garbsoftball-games";
    const MAX_GB_GAME = GBM.maxGbGame || 12;
    const DEPTH = 10;
    const WORKERS = 4;
    const ZIP_BATCH_BYTES = 1.4e9;
    const STATE_KEY = "gbm_state_v1";
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const fmt = (b) => b >= 1e9 ? (b / 1e9).toFixed(2) + " GB" : b >= 1e6 ? (b / 1e6).toFixed(1) + " MB" : (b || 0) + " B";
    const ss = (u) => sameSite(u, ORIGIN);
    const rel = (u) => relOf(u, ORIGIN);
    const refsOf = (text, base) => extractRefs(text, base, ORIGIN, true);
    const refOk = (r, ed) => refAllowed(r, ed, ORIGIN);

    // ---- state ----
    let state;
    try { state = JSON.parse(localStorage.getItem(STATE_KEY) || "null") || {}; } catch { state = {}; }
    state.done = new Set(state.done || []);
    state.failed = state.failed || {};
    state.totals = state.totals || { files: 0, bytes: 0 };
    state.zipBatches = state.zipBatches || 0;
    const saveState = () => {
      const payload = { done: [...state.done], failed: state.failed, totals: state.totals, zipBatches: state.zipBatches };
      try { localStorage.setItem(STATE_KEY, JSON.stringify(payload)); }
      catch {
        try {
          payload.done = [...state.done].slice(-20000);
          localStorage.setItem(STATE_KEY, JSON.stringify(payload));
          dash("state saved (trimmed to 20k paths)");
        } catch { dash("!! could not save state: " + payload); }
      }
    };

    // ---- dashboard ----
    let dashEls = {};
    const dash = (msg) => {
      if (!dashEls.log) return;
      const line = document.createElement("div");
      line.textContent = `[${new Date().toTimeString().slice(0, 8)}] ${msg}`;
      dashEls.log.appendChild(line);
      while (dashEls.log.children.length > 40) dashEls.log.firstChild.remove();
      dashEls.log.scrollTop = dashEls.log.scrollHeight;
    };
    const buildDash = () => {
      const d = document.createElement("div");
      d.id = "gbm-dash";
      d.innerHTML = `
        <style>
          #gbm-dash{position:fixed;top:12px;right:12px;z-index:2147483647;width:370px;background:#111827;color:#e5e7eb;
            font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;border:1px solid #374151;border-radius:10px;
            box-shadow:0 8px 30px rgba(0,0,0,.5);user-select:text}
          #gbm-dash *{box-sizing:border-box}
          #gbm-h{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#1f2937;border-radius:10px 10px 0 0;font-weight:700}
          #gbm-h .x{cursor:pointer;color:#9ca3af}
          #gbm-body{padding:10px 12px}
          #gbm-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin-bottom:6px}
          #gbm-grid b{color:#93c5fd}
          #gbm-bar{height:6px;background:#374151;border-radius:3px;overflow:hidden;margin:6px 0}
          #gbm-bar i{display:block;height:100%;width:0;background:#34d399;transition:width .5s}
          #gbm-log{height:110px;overflow:auto;background:#0b0f19;border-radius:6px;padding:6px;margin-top:6px;white-space:pre-wrap;word-break:break-all;color:#9ca3af}
          #gbm-btns{display:flex;gap:8px;margin-top:8px}
          #gbm-btns button{flex:1;background:#374151;color:#e5e7eb;border:0;border-radius:6px;padding:6px;cursor:pointer;font-weight:700}
          #gbm-btns button:hover{background:#4b5563}
          #gbm-mode{font-weight:700}
        </style>
        <div id="gbm-h">GBM CRAWL <span class="x" title="hide">—</span></div>
        <div id="gbm-body">
          <div>mode: <span id="gbm-mode">…</span> &nbsp; → ${BUCKET}</div>
          <div id="gbm-grid">
            <div>game: <b id="gbm-game">–</b></div>
            <div>files: <b id="gbm-files">0</b></div>
            <div>bytes: <b id="gbm-bytes">0 B</b></div>
            <div>rate: <b id="gbm-rate">–</b></div>
            <div>eta: <b id="gbm-eta">–</b></div>
            <div>zips: <b id="gbm-zips">0</b></div>
          </div>
          <div id="gbm-bar"><i></i></div>
          <div id="gbm-cur" style="color:#d1d5db">starting…</div>
          <div id="gbm-btns"><button id="gbm-pause">PAUSE</button><button id="gbm-zip">ZIP MODE</button><button id="gbm-stop" style="background:#7f1d1d">STOP</button></div>
          <div id="gbm-log"></div>
        </div>`;
      document.documentElement.appendChild(d);
      dashEls = {
        mode: d.querySelector("#gbm-mode"), game: d.querySelector("#gbm-game"), files: d.querySelector("#gbm-files"),
        bytes: d.querySelector("#gbm-bytes"), rate: d.querySelector("#gbm-rate"), eta: d.querySelector("#gbm-eta"),
        zips: d.querySelector("#gbm-zips"), cur: d.querySelector("#gbm-cur"), bar: d.querySelector("#gbm-bar i"), log: d.querySelector("#gbm-log"),
      };
      d.querySelector("#gbm-h .x").onclick = () => { d.querySelector("#gbm-body").style.display = d.querySelector("#gbm-body").style.display === "none" ? "" : "none"; };
      d.querySelector("#gbm-pause").onclick = () => { paused = !paused; d.querySelector("#gbm-pause").textContent = paused ? "RESUME" : "PAUSE"; dash(paused ? "paused" : "resumed"); };
      d.querySelector("#gbm-zip").onclick = () => { forceZip = true; relayOK = false; dashEls.mode.textContent = "ZIP"; dash("ZIP MODE forced — remaining files will auto-download as zips"); };
      d.querySelector("#gbm-stop").onclick = () => { stopped = true; dash("stopping after current file… (state saved — paste again to resume)"); };
    };
    let paused = false, stopped = false, forceZip = false;

    // ---- relay ----
    let relayOK = false;
    async function relayAlive() {
      try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 6000);
        const r = await fetch(RELAY + "/stats", { signal: c.signal });
        clearTimeout(t);
        return r.ok;
      } catch { return false; }
    }
    async function pushRelay(relPath, bytes) {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 30 * 60 * 1000);
      try {
        const r = await fetch(RELAY + "/in/" + encodeURIComponent(relPath).replace(/%2F/g, "/"), {
          method: "POST", body: bytes, headers: { "Content-Type": "text/plain" }, signal: c.signal,
        });
        clearTimeout(t);
        return r.ok;
      } catch (e) { clearTimeout(t); return false; }
    }
    const beacon = (obj) => { if (RELAY) fetch(RELAY + "/progress", { method: "POST", body: JSON.stringify(obj), headers: { "Content-Type": "text/plain" } }).catch(() => {}); };

    // ---- zip download ----
    function downloadBlob(blob, name) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 60000);
    }

    // ---- crawl ----
    async function fetchBytes(url) {
      const r = await fetch(url, { credentials: "same-origin" });
      if (!r.ok) return { status: r.status, bytes: null };
      return { status: 200, bytes: new Uint8Array(await r.arrayBuffer()) };
    }
    async function crawlGame(entryPath) {
      return crawlGameCore(entryPath, {
        origin: ORIGIN,
        fetchBytes,
        maxGbGame: MAX_GB_GAME,
        depth: DEPTH,
        workers: WORKERS,
        extractRefs: (text, base) => extractRefs(text, base, ORIGIN, true),
        isStopped: () => stopped,
        isPaused: () => paused,
        sleep,
        log: dash,
      });
    }

    // ---- catalog ----
    function parseCatalogHtml(htmlText) {
      const doc = new DOMParser().parseFromString(htmlText, "text/html");
      return catalogFromDoc(doc);
    }
    function catalogFromDoc(doc) {
      const games = []; const seen = new Set();
      const addLocal = (name, entry) => { if (entry && entry.startsWith("/") && !seen.has(entry + "|" + name)) { seen.add(entry + "|" + name); games.push({ name, entry, kind: "local" }); } };
      for (const a of doc.querySelectorAll("a[href]")) {
        const href = a.getAttribute("href") || "";
        let name = (a.querySelector("img") && a.querySelector("img").getAttribute("alt")) || a.textContent.trim() || "unnamed";
        if (href.includes("iframe.html?url=") || href.includes("unityframe.html?url=")) {
          try { addLocal(name, decodeURIComponent(href.split("url=")[1].split("&")[0])); } catch {}
        } else if (href.includes("iframe.html?proxy=") || href.includes("unityframe.html?proxy=")) {
          games.push({ name, entry: null, kind: "proxy" });
        } else if (href.startsWith("/games/") || href.startsWith("/gamefile/")) {
          addLocal(name, href);
        }
      }
      return games;
    }
    async function loadCatalog() {
      let games = [];
      try { games = catalogFromDoc(document); } catch {}
      if (games.length < 100) {
        dash("live DOM had " + games.length + " tiles — fetching /g …");
        try {
          const r = await fetch("/g");
          games = parseCatalogHtml(await r.text());
        } catch (e) { dash("!! /g fetch failed: " + e); }
      }
      return games;
    }

    // ---- main ----
    let zipEntries = []; let zipBytes = 0;
    async function flushZip(force) {
      if (!zipEntries.length) return;
      if (!force && zipBytes < ZIP_BATCH_BYTES) return;
      state.zipBatches++;
      const name = `gbm_batch_${String(state.zipBatches).padStart(3, "0")}.zip`;
      dash(`building ${name} (${zipEntries.length} files, ${fmt(zipBytes)}) …`);
      const t0 = Date.now();
      const blob = await makeZip(zipEntries.map((e) => ({ name: e.rel, bytes: e.bytes })));
      zipEntries = []; zipBytes = 0;
      downloadBlob(blob, name);
      dash(`downloaded ${name} in ${((Date.now() - t0) / 1000).toFixed(0)}s — keep these zips!`);
      saveState();
    }

    async function main() {
      buildDash();
      dash("GBM starting…");
      if (GBM.zipMode) { forceZip = true; dash("ZIP mode forced by config"); }
      relayOK = !forceZip && RELAY ? await relayAlive() : false;
      if (RELAY && !relayOK && !forceZip) dash("!! relay unreachable — ZIP MODE (batches will auto-download)");
      else if (relayOK) dash("relay connected: " + RELAY);
      dashEls.mode.textContent = relayOK ? "RELAY" : "ZIP";

      const catalog = await loadCatalog();
      const local = catalog.filter((g) => g.kind === "local");
      const proxyN = catalog.length - local.length;
      if (local.length < 100) { dash("!! catalog looks small (" + local.length + " local) — make sure the /g page fully loaded, then re-run"); }
      dash(`catalog: ${local.length} local games, ${proxyN} proxied (external, skipped)`);

      let bytesWindow = 0, lastRateT = Date.now(), rate = 0;
      const t0 = Date.now();

      for (let i = 0; i < local.length; i++) {
        if (stopped) break;
        const g = local[i];
        dashEls.game.textContent = `${i + 1}/${local.length} ${g.name}`;
        dashEls.cur.textContent = "crawling…";
        try {
          const files = await crawlGame(g.entry);
          const rels = Object.keys(files);
          dash(`crawl done: ${rels.length} files, ${fmt(rels.reduce((s, r) => s + files[r].length, 0))}`);
          let pushed = 0;
          for (const rp of rels) {
            if (stopped) break;
            while (paused) { await sleep(500); if (stopped) break; }
            if (state.done.has(rp)) { pushed++; continue; }
            const bytes = files[rp];
            if (relayOK) {
              const ok = await pushRelay(rp, bytes);
              if (!ok) { relayOK = false; dashEls.mode.textContent = "ZIP"; dash("relay lost — switching to ZIP MODE for remaining files"); }
            }
            if (!relayOK) {
              zipEntries.push({ rel: rp, bytes });
              zipBytes += bytes.length;
              if (zipBytes >= ZIP_BATCH_BYTES) await flushZip(false);
            }
            state.done.add(rp);
            state.totals.files++;
            state.totals.bytes += bytes.length;
            pushed++;
            bytesWindow += bytes.length;
          }
          dash(`uploaded/queued: ${pushed}/${rels.length}`);
          dashEls.files.textContent = state.totals.files;
          dashEls.bytes.textContent = fmt(state.totals.bytes);
          dashEls.zips.textContent = state.zipBatches;
          saveState();
          const now = Date.now();
          if (now - lastRateT > 5000) { rate = bytesWindow / ((now - lastRateT) / 1000); bytesWindow = 0; lastRateT = now; }
          dashEls.rate.textContent = rate ? (rate / 1e6).toFixed(1) + " MB/s" : "–";
          const doneBytes = state.totals.bytes;
          const remainGames = local.length - (i + 1);
          const avg = i + 1 ? doneBytes / (i + 1) : 0;
          const remainSec = rate > 0 ? (avg * remainGames) / rate : 0;
          dashEls.eta.textContent = rate > 0 ? (remainSec > 3600 ? (remainSec / 3600).toFixed(1) + " h" : Math.ceil(remainSec / 60) + " min") : "–";
          dashEls.bar.style.width = ((i + 1) / local.length * 100).toFixed(1) + "%";
          beacon({ side: "garb", summary: `${i + 1}/${local.length} ${g.name} | ${state.totals.files} files ${fmt(state.totals.bytes)} | mode=${relayOK ? "relay" : "zip"}`,
            game: g.name, idx: i + 1, total: local.length, files: state.totals.files, bytes: state.totals.bytes,
            mode: relayOK ? "relay" : "zip", zips: state.zipBatches });
        } catch (e) {
          state.failed[g.name] = String(e);
          dash(`!! FAILED ${g.name}: ${e}`);
        }
      }

      if (!relayOK) await flushZip(true);
      const failed = Object.keys(state.failed);
      dash(`FINISHED: ${state.totals.files} files, ${fmt(state.totals.bytes)}, ${state.zipBatches} zips, ${failed.length} failed games`);
      if (failed.length) dash("failed: " + failed.join(", "));
      dash(relayOK ? "upload side: watch the landing page + the HF tab (Script B)." : "drag the zips into the HF bucket web page to finish.");
      beacon({ side: "garb", summary: `DONE ${state.totals.files} files ${fmt(state.totals.bytes)}`, finished: true });
      dashEls.cur.textContent = "done ✓";
      window.__GBM_RUNNING__ = false;
    }

    main().catch((e) => {
      console.error("GBM fatal:", e);
      dash("FATAL: " + e);
      window.__GBM_RUNNING__ = false;
    });
  })();
}
