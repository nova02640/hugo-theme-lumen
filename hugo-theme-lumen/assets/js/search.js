/* ==========================================================================
   search.js —— 全文检索功能（方案二·全文检索功能）
   集成 Fuse.js 客户端搜索：标题 + 正文模糊匹配，毫秒级响应
   索引在构建时由 layouts/_default/index.json 生成
   ========================================================================== */
(function () {
  "use strict";

  var FuseReady = false;
  var FuseLib = null;
  var fuseIndex = null;
  var indexData = null;
  var loading = false;
  var lastQuery = "";
  var activeIdx = -1;

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); }

  function openSearch() {
    var overlay = $(".search-overlay");
    var input = $(".search-input input", overlay);
    if (!overlay) return;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (input) { input.focus(); input.value = ""; }
    ensureFuse();
  }
  function closeSearch() {
    var overlay = $(".search-overlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function ensureFuse() {
    if (FuseReady) { maybeIndex(); return; }
    if (loading) return;
    loading = true;
    // Fuse.js 由 CDN 动态加载（按需懒加载，避免首屏负担）
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js";
    s.onload = function () {
      FuseLib = window.Fuse;
      FuseReady = true;
      loading = false;
      maybeIndex();
    };
    s.onerror = function () { loading = false; };
    document.body.appendChild(s);
  }

  function maybeIndex() {
    if (fuseIndex || !FuseLib) return;
    if (indexData) { buildIndex(); return; }
    fetch("/index.json").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (data) {
      indexData = data;
      buildIndex();
    }).catch(function () {
      indexData = [];
      buildIndex();
    });
  }

  function buildIndex() {
    if (!FuseLib || !indexData) return;
    fuseIndex = new FuseLib(indexData, {
      keys: [
        { name: "title", weight: 0.7 },
        { name: "summary", weight: 0.2 },
        { name: "content", weight: 0.1 }
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(text, matches) {
    if (!matches || !matches.length) return escapeHTML(text);
    var result = "", last = 0;
    matches.forEach(function (m) {
      var s = m[0], e = m[m.length - 1] + 1;
      if (s < last) s = last;
      if (e > text.length) e = text.length;
      if (s > last) result += escapeHTML(text.slice(last, s));
      result += "<mark>" + escapeHTML(text.slice(s, e)) + "</mark>";
      last = e;
    });
    if (last < text.length) result += escapeHTML(text.slice(last));
    return result;
  }

  function render(query) {
    var box = $(".search-results");
    if (!box) return;
    activeIdx = -1;
    if (!query.trim()) { box.innerHTML = ""; return; }
    if (!fuseIndex) {
      box.innerHTML = '<div class="search-empty">索引加载中…</div>';
      return;
    }
    var results = fuseIndex.search(query).slice(0, 30);
    if (!results.length) {
      box.innerHTML = '<div class="search-empty">没有匹配结果</div>';
      return;
    }
    box.innerHTML = results.map(function (r, i) {
      var item = r.item;
      var titleMatches = r.matches ? r.matches.find(function (m) { return m.key === "title"; }) : null;
      var titleHTML = highlight(item.title || "(无标题)", titleMatches ? titleMatches.indices : null);
      var summary = (item.summary || item.content || "").slice(0, 120);
      return '<div class="search-results__item" data-idx="' + i + '">' +
        '<a href="' + escapeHTML(item.permalink) + '">' +
        '<div class="search-results__title">' + titleHTML + '</div>' +
        (summary ? '<div class="search-results__excerpt">' + escapeHTML(summary) + '</div>' : '') +
        '</a></div>';
    }).join("");
  }

  function moveActive(dir) {
    var items = $$(".search-results__item");
    if (!items.length) return;
    activeIdx += dir;
    if (activeIdx < 0) activeIdx = items.length - 1;
    if (activeIdx >= items.length) activeIdx = 0;
    items.forEach(function (el, i) { el.classList.toggle("is-active", i === activeIdx); });
    items[activeIdx].scrollIntoView({ block: "nearest" });
  }
  function gotoActive() {
    var el = $$(".search-results__item")[activeIdx];
    if (el) { var a = $("a", el); if (a) location.href = a.getAttribute("href"); }
  }

  function init() {
    var overlay = $(".search-overlay");
    if (!overlay) return;
    var openBtns = $$("[data-search-open]");
    openBtns.forEach(function (b) { b.addEventListener("click", openSearch); });
    var closeBtn = $(".search-overlay__close", overlay);
    if (closeBtn) closeBtn.addEventListener("click", closeSearch);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSearch(); });
    var input = $(".search-input input", overlay);
    if (input) {
      var debounce;
      input.addEventListener("input", function () {
        var q = input.value;
        clearTimeout(debounce);
        debounce = setTimeout(function () { lastQuery = q; render(q); }, 120);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeSearch();
        else if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
        else if (e.key === "Enter") { e.preventDefault(); gotoActive(); }
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/i.test(document.activeElement.tagName)) {
        e.preventDefault(); openSearch();
      } else if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        closeSearch();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  window.LumenSearch = { open: openSearch, close: closeSearch };
})();
