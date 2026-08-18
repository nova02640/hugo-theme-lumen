/* Lumen — 全文检索（Fuse.js 模糊匹配，缺省回退内置打分器）
 * 检索数据来自首页输出格式生成的 index.json。 */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  var I18N = (window.LUMEN_I18N || {}).search || {};
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results) return;

  var INDEX_URL = input.getAttribute('data-index') || '/index.json';
  var docs = [];
  var fuse = null;
  var timer = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function rangesOf(text, query, limit) {
    // 返回查询词在文本中的匹配区间（用于 <mark> 高亮）
    var out = [];
    if (!text) return out;
    var lower = text.toLowerCase();
    var q = query.toLowerCase();
    if (!q) return out;
    var idx = 0;
    while (out.length < (limit || 3)) {
      idx = lower.indexOf(q, idx);
      if (idx === -1) break;
      out.push([idx, idx + q.length]);
      idx += q.length;
    }
    if (!out.length) {
      // 多词查询：逐词匹配
      var words = q.split(/\s+/).filter(function (w) { return w.length > 1; });
      words.forEach(function (w) {
        var i = lower.indexOf(w);
        if (i > -1 && out.length < (limit || 3)) out.push([i, i + w.length]);
      });
    }
    return out;
  }

  function highlight(text, ranges, maxLen) {
    if (!ranges.length) return esc((text || '').slice(0, maxLen || 240));
    // 以首个匹配为中心截取上下文片段
    var first = ranges[0][0];
    var span = maxLen || 160;
    var start = Math.max(0, first - Math.floor(span / 2));
    var end = Math.min(text.length, start + span);
    start = Math.max(0, end - span);
    var out = '';
    var pos = start;
    var prefix = start > 0 ? '…' : '';
    ranges.forEach(function (r) {
      if (r[1] < start || r[0] > end) return;
      var s = Math.max(r[0], start);
      var e = Math.min(r[1], end);
      if (s > pos) out += esc(text.slice(pos, s));
      out += '<mark>' + esc(text.slice(s, e)) + '</mark>';
      pos = e;
    });
    out += esc(text.slice(pos, end));
    return prefix + out + (end < text.length ? '…' : '');
  }

  function render(query) {
    if (!query) {
      results.innerHTML = '';
      return;
    }
    if (!docs.length) {
      results.innerHTML = '<div class="search-loading">' + (I18N.loading || 'Loading index…') + '</div>';
      return;
    }
    var hits;
    if (fuse) {
      hits = fuse.search(query, { limit: 30 }).map(function (r) { return r.item; });
    } else {
      // 内置打分器：标题 > 标签 > 摘要 > 正文
      var tokens = query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
      hits = docs.map(function (d) {
        var score = 0;
        tokens.forEach(function (t) {
          var title = (d.title || '').toLowerCase();
          var tags = (d.tags || []).join(' ').toLowerCase();
          var summary = (d.summary || '').toLowerCase();
          var content = (d.content || '').toLowerCase();
          if (title.indexOf(t) > -1) score += 10;
          if (tags.indexOf(t) > -1) score += 6;
          if (summary.indexOf(t) > -1) score += 3;
          var n = content.split(t).length - 1;
          score += Math.min(n, 4) * 1.5;
        });
        return { item: d, score: score };
      }).filter(function (r) { return r.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 30)
        .map(function (r) { return r.item; });
    }

    if (!hits.length) {
      results.innerHTML = '<div class="search-empty">' + (I18N.noResults || 'No results found.') + '</div>';
      return;
    }

    var html = hits.map(function (d) {
      var title = highlight(d.title, rangesOf(d.title, query), 160);
      var snippet = '';
      var contentRange = rangesOf(d.content, query, 3);
      if (contentRange.length) snippet = highlight(d.content, contentRange, 180);
      else if (d.summary) snippet = esc(d.summary).slice(0, 160) + '…';
      var meta = [];
      if (d.date) meta.push(esc(d.date.slice(0, 10)));
      if (d.section) meta.push(esc(d.section));
      if (d.tags && d.tags.length) meta.push(esc(d.tags.slice(0, 3).join(' · ')));
      return '<a class="search-result" href="' + esc(d.permalink) + '">' +
        '<div class="result-title">' + title + '</div>' +
        (snippet ? '<div class="result-snippet">' + snippet + '</div>' : '') +
        '<div class="result-meta">' + meta.map(function (m) { return '<span>' + m + '</span>'; }).join('') + '</div>' +
        '</a>';
    }).join('');
    results.innerHTML = html;
  }

  fetch(INDEX_URL, { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      docs = data || [];
      if (window.Fuse) {
        fuse = new Fuse(docs, {
          keys: [
            { name: 'title', weight: 0.5 },
            { name: 'tags', weight: 0.2 },
            { name: 'summary', weight: 0.1 },
            { name: 'content', weight: 0.2 }
          ],
          includeMatches: false,
          ignoreLocation: true,
          threshold: 0.42,
          minMatchCharLength: 2
        });
      }
      if (input.value.trim()) render(input.value.trim());
    })
    .catch(function () {
      results.innerHTML = '<div class="search-empty">' + (I18N.loadError || 'Failed to load search index.') + '</div>';
    });

  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { render(input.value.trim()); }, 150);
  });

  // 快捷键：/ 聚焦搜索，Esc 清空
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      render('');
      input.blur();
    }
  });
})();
