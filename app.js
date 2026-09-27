/* Unblocked Arcade — portal logic (no external dependencies except vendor/jszip) */
(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var searchEl = document.getElementById("search");
  var chipsEl = document.getElementById("chips");
  var sortEl = document.getElementById("sort");
  var countEl = document.getElementById("count");

  var catalog = null;
  var state = { q: "", chip: "all", sort: "az", shown: 0 };
  var BATCH = 150;

  function hashHue(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 360;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtSize(g) {
    if (g.sizeMB >= 1) return g.sizeMB.toFixed(g.sizeMB < 10 ? 1 : 0) + " MB";
    return Math.max(1, Math.round(g.sizeMB * 1024)) + " KB";
  }

  function visibleGames() {
    var list = catalog.games.slice();
    var q = state.q.trim().toLowerCase();
    if (q) {
      list = list.filter(function (g) {
        return (
          g.title.toLowerCase().indexOf(q) !== -1 ||
          (g.author || "").toLowerCase().indexOf(q) !== -1 ||
          (g.desc || "").toLowerCase().indexOf(q) !== -1 ||
          (g.source || "").toLowerCase().indexOf(q) !== -1
        );
      });
    }
    if (state.chip === "tic") list = list.filter(function (g) { return g.type === "tic80"; });
    else if (state.chip === "browser") list = list.filter(function (g) { return g.type === "browser"; });
    else if (state.chip !== "all") list = list.filter(function (g) { return g.category === state.chip; });

    var s = state.sort;
    list.sort(function (a, b) {
      if (s === "az") return a.title.localeCompare(b.title);
      if (s === "za") return b.title.localeCompare(a.title);
      if (s === "big") return b.sizeMB - a.sizeMB;
      if (s === "rated") return (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title);
      return 0;
    });
    return list;
  }

  function downloadBrowser(g) {
    var btn = document.querySelector('[data-zip="' + cssEsc(g.slug) + '"]');
    if (!window.JSZip) { alert("Download support (JSZip) failed to load."); return; }
    if (btn) { btn.disabled = true; btn.textContent = "Zipping…"; }
    var zip = new JSZip();
    var folder = zip.folder(g.slug);
    var done = 0;
    var tasks = g.filelist.map(function (f) {
      var path = "games/" + g.slug + "/" + f;
      return fetch(path).then(function (r) {
        if (!r.ok) throw new Error(path + " -> " + r.status);
        return r.arrayBuffer().then(function (buf) {
          folder.file(f, buf);
          done++;
          if (btn && done % 4 === 0) btn.textContent = "Zipping " + done + "/" + g.filelist.length + "…";
        });
      });
    });
    Promise.all(tasks)
      .then(function () { return zip.generateAsync({ type: "blob", compression: "DEFLATE" }, function (m) {
        if (btn) btn.textContent = "Zipping " + Math.round(m.percent) + "%";
      }) })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = g.slug + ".zip";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
      })
      .catch(function (err) {
        console.error(err);
        alert("Download failed: " + err.message);
      })
      .then(function () {
        if (btn) { btn.disabled = false; btn.innerHTML = "&#8681; Download"; }
      });
  }

  function cssEsc(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/["\\]/g, "\\$&");
  }

  function cardHTML(g) {
    var h = hashHue(g.slug);
    var icon = g.type === "tic80" ? "&#128133;" : "&#127918;";
    var by = g.type === "tic80"
      ? "TIC-80 &middot; by " + esc(g.author || "unknown")
      : esc(g.source || "");
    var badges =
      '<span class="badge ' + (g.type === "tic80" ? "tic" : "browser") + '">' +
        (g.type === "tic80" ? "TIC-80" : "BROWSER") + "</span>" +
      (typeof g.rating === "number" && g.rating > 0
        ? '<span class="badge rated">&#9733; ' + g.rating + "</span>" : "") +
      '<span class="badge">' + fmtSize(g) + "</span>";
    var dl = g.type === "tic80" || (g.filelist && g.filelist.length === 1)
      ? '<a class="btn btn-dl" data-dl="' + esc(g.slug) + '" href="' + esc(g.download) + '" download>&#8681; Download</a>'
      : '<button class="btn btn-dl" data-dl="' + esc(g.slug) + '" data-zip="' + esc(g.slug) + '">&#8681; Download</button>';
    return (
      '<div class="card" style="--h:' + h + ";--h2:" + ((h + 70) % 360) + '">' +
        '<div class="thumb">' + icon + "</div>" +
        "<h3>" + esc(g.title) + "</h3>" +
        '<div class="by">' + by + "</div>" +
        '<div class="badges">' + badges + "</div>" +
        '<div class="actions">' +
          '<a class="btn btn-play" href="' + esc(g.url) + '" target="_blank" rel="noopener">&#9654; Play</a>' +
          dl +
        "</div>" +
      "</div>"
    );
  }

  function render(reset) {
    var list = visibleGames();
    state.shown = 0;
    if (reset) grid.innerHTML = "";
    var next = list.slice(state.shown, state.shown + BATCH);
    var html = next.map(cardHTML).join("");
    grid.insertAdjacentHTML("beforeend", html);
    state.shown += next.length;
    countEl.textContent =
      "Showing " + state.shown + " of " + list.length + " games" +
      (state.shown < list.length ? " — scroll for more" : "");
  }

  function renderAll() {
    render(true);
    var sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    grid.after(sentinel);
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) render(false);
    }, { rootMargin: "900px" });
    io.observe(sentinel);
  }

  function buildChips() {
    var cats = ["all", "browser", "tic"];
    var seen = {};
    catalog.games.forEach(function (g) {
      if (g.type === "browser" && !seen[g.category]) { seen[g.category] = 1; cats.push(g.category); }
    });
    var labels = { all: "All 720", browser: "Browser games", tic: "TIC-80" };
    chipsEl.innerHTML = cats
      .map(function (c) {
        var n =
          c === "all" ? catalog.stats.total
          : c === "browser" ? catalog.stats.browser
          : c === "tic" ? catalog.stats.tic80
          : catalog.games.filter(function (g) { return g.category === c; }).length;
        return (
          '<span class="chip' + (c === state.chip ? " active" : "") + '" data-chip="' + esc(c) + '">' +
          esc(labels[c] || c) + " · " + n + "</span>"
        );
      })
      .join("");
    chipsEl.querySelectorAll(".chip").forEach(function (el) {
      el.addEventListener("click", function () {
        state.chip = el.getAttribute("data-chip");
        chipsEl.querySelectorAll(".chip").forEach(function (c) {
          c.classList.toggle("active", c === el);
        });
        renderAll();
      });
    });
  }

  fetch("catalog.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      catalog = data;
      document.title =
        "Unblocked Arcade — " + catalog.stats.total + " offline games";
      buildChips();
      renderAll();

      searchEl.addEventListener("input", function () {
        state.q = searchEl.value;
        renderAll();
      });
      sortEl.addEventListener("change", function () {
        state.sort = sortEl.value;
        renderAll();
      });

      // Delegated download handling for multi-file (zip) browser games.
      grid.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-zip]");
        if (!btn) return;
        ev.preventDefault();
        var g = null;
        for (var i = 0; i < catalog.games.length; i++)
          if (catalog.games[i].slug === btn.getAttribute("data-zip")) { g = catalog.games[i]; break; }
        if (g) downloadBrowser(g);
      });
    })
    .catch(function (err) {
      grid.innerHTML =
        '<p style="color:#ff7a90">Could not load catalog.json — serve the site over HTTP ' +
        "(python3 server.py) instead of opening index.html directly.</p>";
      console.error(err);
    });
})();
