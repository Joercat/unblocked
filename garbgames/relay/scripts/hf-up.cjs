/* ============================================================
 * GBM — HF bucket uploader (Tab B)
 * Paste into the DevTools console of a huggingface.co page
 * (best: the bucket page, e.g.
 *  https://huggingface.co/buckets/smodusermc/garbsoftball-games )
 * and press Enter. You will be prompted for your HF token —
 * it is only sent to huggingface.co, never to the relay.
 *
 * It pulls file bytes from the GBM relay and commits them to
 * the bucket using the official @huggingface/hub JS SDK
 * (the same Xet upload flow the web UI uses).
 * Resumable: re-paste any time; already-committed files are
 * detected via pathsInfo and skipped.
 * ============================================================ */
(() => {
  "use strict";
  if (typeof GBM === "undefined") {
    console.error("%cGBM: missing config. Copy the full block from the GBM landing page (it starts with `const GBM = ...`).", "color:#f66;font-weight:bold");
    return;
  }
  if (window.__GBM_UP_RUNNING__) {
    console.warn("GBM uploader is already running — use the PAUSE button in its dashboard.");
    return;
  }
  window.__GBM_UP_RUNNING__ = true;

  const RELAY = (GBM.relay || "").replace(/\/+$/, "");
  const BUCKET_ID = GBM.bucket || "smodusermc/garbsoftball-games";
  const BUCKET = "buckets/" + BUCKET_ID; // SDK repo designation for buckets
  const PAR = GBM.parallel || 2; // files uploaded in parallel
  const SDK_URL = "https://esm.sh/@huggingface/hub@2.17.5";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmt = (b) => b >= 1e9 ? (b / 1e9).toFixed(2) + " GB" : b >= 1e6 ? (b / 1e6).toFixed(1) + " MB" : b + " B";

  // ---------------- dashboard ----------------
  let dashEls = {};
  const dash = (msg) => {
    if (!dashEls.log) { console.log("[GBM-UP]", msg); return; }
    const line = document.createElement("div");
    line.textContent = `[${new Date().toTimeString().slice(0, 8)}] ${msg}`;
    dashEls.log.appendChild(line);
    while (dashEls.log.children.length > 40) dashEls.log.firstChild.remove();
    dashEls.log.scrollTop = dashEls.log.scrollHeight;
  };
  const buildDash = () => {
    const d = document.createElement("div");
    d.id = "gbm-up-dash";
    d.innerHTML = `
      <style>
        #gbm-up-dash{position:fixed;bottom:12px;right:12px;z-index:2147483647;width:360px;background:#0f172a;color:#e2e8f0;
          font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;border:1px solid #334155;border-radius:10px;
          box-shadow:0 8px 30px rgba(0,0,0,.5);user-select:text}
        #gbm-up-dash *{box-sizing:border-box}
        #gbm-up-h{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#1e293b;border-radius:10px 10px 0 0;font-weight:700}
        #gbm-up-h .x{cursor:pointer;color:#94a3b8}
        #gbm-up-body{padding:10px 12px}
        #gbm-up-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin-bottom:6px}
        #gbm-up-grid b{color:#7dd3fc}
        #gbm-up-cur{color:#cbd5e1;margin-bottom:6px}
        #gbm-up-log{height:110px;overflow:auto;background:#020617;border-radius:6px;padding:6px;white-space:pre-wrap;word-break:break-all;color:#94a3b8}
        #gbm-up-btns{display:flex;gap:8px;margin-top:8px}
        #gbm-up-btns button{flex:1;background:#334155;color:#e2e8f0;border:0;border-radius:6px;padding:6px;cursor:pointer;font-weight:700}
      </style>
      <div id="gbm-up-h">GBM UPLOAD <span class="x" title="hide">—</span></div>
      <div id="gbm-up-body">
        <div>bucket: ${BUCKET_ID}</div>
        <div id="gbm-up-grid">
          <div>files: <b id="gbm-up-files">0</b></div>
          <div>bytes: <b id="gbm-up-bytes">0 B</b></div>
          <div>queue: <b id="gbm-up-queue">?</b></div>
          <div>rate: <b id="gbm-up-rate">–</b></div>
        </div>
        <div id="gbm-up-cur">initializing…</div>
        <div id="gbm-up-btns"><button id="gbm-up-pause">PAUSE</button></div>
        <div id="gbm-up-log"></div>
      </div>`;
    document.documentElement.appendChild(d);
    dashEls = {
      files: d.querySelector("#gbm-up-files"), bytes: d.querySelector("#gbm-up-bytes"),
      queue: d.querySelector("#gbm-up-queue"), rate: d.querySelector("#gbm-up-rate"),
      cur: d.querySelector("#gbm-up-cur"), log: d.querySelector("#gbm-up-log"),
    };
    d.querySelector("#gbm-up-h .x").onclick = () => { d.querySelector("#gbm-up-body").style.display = d.querySelector("#gbm-up-body").style.display === "none" ? "" : "none"; };
    d.querySelector("#gbm-up-pause").onclick = () => { upPaused = !upPaused; d.querySelector("#gbm-up-pause").textContent = upPaused ? "RESUME" : "PAUSE"; };
  };
  let upPaused = false;

  const beacon = (obj) => { fetch(RELAY + "/progress", { method: "POST", body: JSON.stringify(obj), headers: { "Content-Type": "text/plain" } }).catch(() => {}); };

  async function main() {
    buildDash();
    const token = prompt(`HF token for ${BUCKET_ID} (sent only to huggingface.co):`);
    if (!token) { dash("no token — aborted"); window.__GBM_UP_RUNNING__ = false; return; }

    dash("loading HF SDK…");
    let sdk = null;
    const attempts = [
      ["relay (ESM)", async () => await import(RELAY + "/sdk/gbmsdk.mjs")],
      ["relay (IIFE/eval)", async () => {
        const txt = await (await fetch(RELAY + "/sdk/gbmsdk.iife.js")).text();
        const fn = new Function(txt + "\n;return __GBMSDK__;");
        return fn();
      }],
      ["esm.sh CDN", async () => await import(SDK_URL)],
    ];
    for (const [label, load] of attempts) {
      try {
        const s = await load();
        if (s && typeof s.commitIterBucket === "function" && typeof s.createRepo === "function") { sdk = s; dash("SDK loaded via " + label + " ✓"); break; }
        dash("SDK via " + label + " missing expected exports — trying next…");
      } catch (e) {
        dash("SDK via " + label + " failed: " + (e && e.message ? e.message : e));
      }
    }
    if (!sdk) {
      dash("!! Could not load the HF SDK from any source. If this page's CSP blocks it, switch Tab A to ZIP MODE (its dashboard has a ZIP MODE button), finish the crawl, then drag the zips into this bucket page.");
      beacon({ side: "hf", summary: "SDK load failed", failed: true });
      window.__GBM_UP_RUNNING__ = false;
      return;
    }

    const who = await sdk.whoAmI({ accessToken: token });
    dash(`logged in as ${who.name}`);
    if (who.name !== BUCKET_ID.split("/")[0]) dash("!! note: token user differs from bucket namespace — will fail if not a member");

    // ensure bucket exists
    try {
      await sdk.createRepo({ repo: BUCKET, visibility: "public", accessToken: token });
      dash("bucket ready ✓");
    } catch (e) {
      dash("createRepo: " + e.message + " (continuing — may already exist)");
    }

    // resume: which files already in the bucket?
    let inBucket = new Set();
    try {
      const listing = await sdk.listFiles({ repo: BUCKET, accessToken: token, recursive: true });
      if (listing) for (const f of listing) if (f.path) inBucket.add(f.path);
      dash(`bucket already has ${inBucket.size} files — those will be skipped`);
    } catch (e) { dash("listFiles failed (fresh bucket? continuing): " + e.message); }

    let uploaded = 0, uploadedBytes = 0;
    let bytesWindow = 0, lastRateT = Date.now(), rate = 0;
    let relayFailStreak = 0;

    const commitOne = async (f) => {
      dashEls.cur.textContent = `fetching ${f.path} (${fmt(f.bytes)})`;
      const r = await fetch(RELAY + "/out/" + encodeURIComponent(f.path).replace(/%2F/g, "/"));
      if (!r.ok) throw new Error("relay /out failed: " + r.status);
      const blob = await r.blob();
      dashEls.cur.textContent = `uploading ${f.path} (xet)`;
      const gen = sdk.commitIterBucket({
        title: "garbsoftball mirror",
        repo: BUCKET,
        operations: [{ operation: "addOrUpdate", path: f.path, content: blob }],
        accessToken: token,
        useWebWorkers: true,
      });
      for await (const ev of gen) {
        if (ev.event === "fileProgress" && ev.state === "error") throw new Error("xet error on " + f.path);
      }
      await fetch(RELAY + "/ack/" + encodeURIComponent(f.path).replace(/%2F/g, "/"), { method: "POST", headers: { "Content-Type": "text/plain" } });
      uploaded++; uploadedBytes += f.bytes; bytesWindow += f.bytes;
      inBucket.add(f.path);
      dashEls.files.textContent = uploaded;
      dashEls.bytes.textContent = fmt(uploadedBytes);
      dash(`✓ ${f.path} (${fmt(f.bytes)})`);
    };

    let idleRounds = 0;
    while (true) {
      if (upPaused) { await sleep(2000); continue; }
      let queueFiles = [];
      try {
        const q = await (await fetch(RELAY + "/queue")).json();
        relayFailStreak = 0;
        queueFiles = q.files || [];
        dashEls.queue.textContent = `${queueFiles.length} (${fmt((q.files || []).reduce((s, f) => s + f.bytes, 0))})`;
      } catch (e) {
        relayFailStreak++;
        if (relayFailStreak === 1 || relayFailStreak % 30 === 0) dash("relay unreachable (" + relayFailStreak + "×) — retrying…");
        await sleep(relayFailStreak > 30 ? 30000 : 5000);
        continue;
      }

      if (!queueFiles.length) {
        idleRounds++;
        dashEls.cur.textContent = "waiting for crawl tab to feed the relay…";
        if (idleRounds % 15 === 1) beacon({ side: "hf", summary: `idle ${uploaded} files ${fmt(uploadedBytes)}`, uploaded, bytes: uploadedBytes });
        await sleep(4000);
        continue;
      }
      idleRounds = 0;

      const todo = queueFiles.filter((f) => !inBucket.has(f.path)).slice(0, PAR * 2);
      if (!todo.length) { dashEls.cur.textContent = "queue has only already-committed files"; await sleep(2000); continue; }

      for (let i = 0; i < todo.length; i += PAR) {
        const batch = todo.slice(i, i + PAR);
        const results = await Promise.allSettled(batch.map(commitOne));
        for (const res of results) {
          if (res.status === "rejected") {
            dash("!! FAILED: " + res.reason + " — retrying next round");
          }
        }
        const now = Date.now();
        if (now - lastRateT > 5000) { rate = bytesWindow / ((now - lastRateT) / 1000); bytesWindow = 0; lastRateT = now; }
        dashEls.rate.textContent = rate ? (rate / 1e6).toFixed(1) + " MB/s" : "–";
      }
      beacon({ side: "hf", summary: `${uploaded} files ${fmt(uploadedBytes)} | queue ${queueFiles.length}`, uploaded, bytes: uploadedBytes, queue: queueFiles.length });
    }
  }

  main().catch((e) => {
    console.error("GBM-UP fatal:", e);
    dash("FATAL: " + (e && e.message ? e.message : e));
    window.__GBM_UP_RUNNING__ = false;
  });
})();
