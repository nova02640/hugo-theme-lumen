/* Lumen — 全局交互：渐进增强，无 JS 亦可完整浏览
 * 界面文案来自模板注入的 window.LUMEN_I18N，缺省回退英文 */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  var I18N = window.LUMEN_I18N || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 主题切换按钮 ---------- */
    var themeToggle = $('#theme-toggle');
    if (themeToggle && window.LumenTheme) {
      themeToggle.addEventListener('click', function () { window.LumenTheme.next(); });
    }

    /* ---------- 移动端导航 ---------- */
    var navToggle = $('#nav-toggle');
    if (navToggle) {
      navToggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', document.body.classList.contains('nav-open'));
      });
      document.addEventListener('click', function (e) {
        if (document.body.classList.contains('nav-open') && !e.target.closest('.site-header')) {
          document.body.classList.remove('nav-open');
        }
      });
    }

    /* ---------- 阅读进度条 ---------- */
    var progress = $('#reading-progress');
    if (progress) {
      var ticking = false;
      var update = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
        ticking = false;
      };
      document.addEventListener('scroll', function () {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    }

    /* ---------- 返回顶部 ---------- */
    var backTop = $('#back-to-top');
    if (backTop) {
      document.addEventListener('scroll', function () {
        backTop.classList.toggle('visible', (document.documentElement.scrollTop || document.body.scrollTop) > 480);
      }, { passive: true });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---------- 代码块：工具条（复制 / 行号开关） ---------- */
    var copyText = function (text, btn) {
      var done = function () {
        btn.classList.add('copied');
        var label = $('.copy-label', btn);
        var old = label ? label.textContent : '';
        if (label) label.textContent = I18N.copied || 'Copied!';
        setTimeout(function () {
          btn.classList.remove('copied');
          if (label) label.textContent = old;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    };

    $$('.highlight').forEach(function (hl) {
      var block = document.createElement('div');
      block.className = 'code-block';
      hl.parentNode.insertBefore(block, hl);
      block.appendChild(hl);

      var toolbar = document.createElement('div');
      toolbar.className = 'code-toolbar';

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
        '<span class="copy-label">' + (I18N.copy || 'Copy') + '</span>';
      copyBtn.addEventListener('click', function () {
        var codeEl = hl.querySelector('table td:last-child code') || hl.querySelector('code');
        copyText(codeEl ? codeEl.innerText : hl.innerText, copyBtn);
      });

      if (hl.querySelector('.lnt')) {
        var lineBtn = document.createElement('button');
        lineBtn.type = 'button';
        lineBtn.className = 'line-btn';
        lineBtn.textContent = I18N.lineNumbers || '#';
        lineBtn.setAttribute('aria-pressed', 'false');
        lineBtn.addEventListener('click', function () {
          var on = block.classList.toggle('show-line-numbers');
          lineBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        toolbar.appendChild(lineBtn);
      }
      toolbar.appendChild(copyBtn);
      block.appendChild(toolbar);
    });

    /* ---------- 目录：折叠 / 滚动高亮 / 移动端抽屉 ---------- */
    var tocNav = $('#toc');
    var tocCollapse = $('#toc-collapse');
    if (tocNav && tocCollapse) {
      tocCollapse.addEventListener('click', function () {
        var collapsed = tocNav.classList.toggle('collapsed');
        tocCollapse.textContent = collapsed
          ? (I18N.expand || '+')
          : (I18N.collapse || '−');
      });
      try {
        if (localStorage.getItem('lumen-toc-collapsed') === '1') {
          tocNav.classList.add('collapsed');
          tocCollapse.textContent = I18N.expand || '+';
        }
      } catch (e) {}
    }

    var tocFab = $('#toc-fab');
    var tocClose = $('#toc-close');
    if (tocFab && tocNav) {
      document.body.classList.add('has-toc');
      var closeDrawer = function () { document.body.classList.remove('toc-open'); };
      tocFab.addEventListener('click', function () { document.body.classList.add('toc-open'); });
      if (tocClose) tocClose.addEventListener('click', closeDrawer);
      var mask = $('#toc-mask');
      if (mask) mask.addEventListener('click', closeDrawer);
    }

    // 滚动高亮当前章节
    var headings = $$('.article-content h2[id], .article-content h3[id], .article-content h4[id]');
    var tocLinks = $$('#toc a[href^="#"]');
    if (headings.length && tocLinks.length) {
      var activeId = null;
      var activate = function (id) {
        if (activeId === id) return;
        activeId = id;
        tocLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + id;
          a.classList.toggle('active', on);
          if (on) {
            var c = a.closest('#toc');
            if (c && (c.scrollTop > a.offsetTop || c.scrollTop + c.clientHeight < a.offsetTop)) {
              a.scrollIntoView({ block: 'nearest' });
            }
          }
        });
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) activate(en.target.id);
        });
      }, { rootMargin: '-80px 0px -68% 0px', threshold: 0 });
      headings.forEach(function (h) { io.observe(h); });
    }

    /* ---------- 公告栏关闭 ---------- */
    var annClose = $('#announcement-close');
    if (annClose) {
      var ann = $('#announcement');
      annClose.addEventListener('click', function () {
        if (ann) ann.style.display = 'none';
        try { sessionStorage.setItem('lumen-announcement-closed', '1'); } catch (e) {}
      });
      try {
        if (sessionStorage.getItem('lumen-announcement-closed') === '1' && ann) ann.style.display = 'none';
      } catch (e) {}
    }

    /* ---------- 评论区懒加载（滚动至可视区域后初始化） ---------- */
    var comments = $('#comments');
    if (comments) {
      var engine = comments.getAttribute('data-engine');
      var initComments = function () {
        if (comments.classList.contains('loaded')) return;
        comments.classList.add('loaded');
        if (engine === 'giscus') initGiscus(comments);
        else if (engine === 'waline') initWaline(comments);
        else if (engine === 'disqus') initDisqus(comments);
      };
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { initComments(); cio.disconnect(); }
        }, { rootMargin: '200px' });
        cio.observe(comments);
      } else {
        initComments();
      }
    }

    function initGiscus(el) {
      var attrs = {
        'data-repo': el.getAttribute('data-repo'),
        'data-repo-id': el.getAttribute('data-repo-id'),
        'data-category': el.getAttribute('data-category'),
        'data-category-id': el.getAttribute('data-category-id'),
        'data-mapping': el.getAttribute('data-mapping') || 'pathname',
        'data-strict': el.getAttribute('data-strict') || '0',
        'data-reactions-enabled': el.getAttribute('data-reactions') || '1',
        'data-emit-metadata': el.getAttribute('data-emit-metadata') || '0',
        'data-input-position': el.getAttribute('data-input-position') || 'top',
        'data-theme': document.documentElement.getAttribute('data-theme'),
        'data-lang': el.getAttribute('data-lang') || 'zh-CN'
      };
      var s = document.createElement('script');
      s.src = 'https://giscus.app/client.js';
      s.async = true;
      s.crossOrigin = 'anonymous';
      Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      el.appendChild(s);
      // 主题切换时同步 Giscus 配色
      document.addEventListener('lumen:theme', function () {
        var frame = $('.giscus iframe');
        if (frame) {
          frame.contentWindow.postMessage({
            giscus: { setConfig: { theme: document.documentElement.getAttribute('data-theme') } }
          }, 'https://giscus.app');
        }
      });
    }

    function initWaline(el) {
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/@waline/client@v3/dist/waline.js';
      s.async = true;
      s.onload = function () {
        if (window.Waline) {
          window.Waline.init({
            el: '#waline',
            serverURL: el.getAttribute('data-serverurl'),
            lang: el.getAttribute('data-lang') || 'zh-CN',
            dark: document.documentElement.getAttribute('data-theme') === 'dark'
          });
        }
      };
      document.body.appendChild(s);
      document.addEventListener('lumen:theme', function () {
        var w = $('#waline');
        if (w) w.setAttribute('data-theme', document.documentElement.getAttribute('data-theme'));
      });
    }

    function initDisqus(el) {
      var shortname = el.getAttribute('data-shortname');
      if (!shortname) return;
      window.disqus_config = function () { this.page.url = location.href; this.page.identifier = location.pathname; };
      var s = document.createElement('script');
      s.src = 'https://' + shortname + '.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      document.body.appendChild(s);
    }

    /* ---------- PWA：注册 Service Worker ---------- */
    if (document.body.getAttribute('data-pwa') === 'true' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
      });
    }

    /* ---------- 相册灯箱 ---------- */
    var lightboxItems = $$('[data-lightbox]');
    if (lightboxItems.length) {
      var lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', I18N.lightbox || 'Image viewer');
      lb.innerHTML =
        '<button class="lightbox-close" aria-label="' + (I18N.close || 'Close') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
        '<button class="lightbox-prev" aria-label="' + (I18N.prev || 'Previous') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
        '<img alt="">' +
        '<button class="lightbox-next" aria-label="' + (I18N.next || 'Next') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>' +
        '<div class="lightbox-caption"></div>';
      document.body.appendChild(lb);
      var lbImg = $('img', lb);
      var lbCaption = $('.lightbox-caption', lb);
      var idx = -1;
      var open = function (i) {
        idx = (i + lightboxItems.length) % lightboxItems.length;
        var item = lightboxItems[idx];
        var inner = item.querySelector('img');
        var full = item.getAttribute('data-lightbox');
        lbImg.src = full || (item.tagName === 'A' ? item.href : (inner ? inner.src : ''));
        lbImg.alt = inner ? inner.getAttribute('alt') : '';
        lbCaption.textContent = item.getAttribute('data-caption') || lbImg.alt || '';
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      };
      var close = function () {
        lb.classList.remove('open');
        document.body.style.overflow = '';
      };
      lightboxItems.forEach(function (item, i) {
        item.addEventListener('click', function (e) { e.preventDefault(); open(i); });
      });
      $('.lightbox-close', lb).addEventListener('click', close);
      $('.lightbox-prev', lb).addEventListener('click', function () { open(idx - 1); });
      $('.lightbox-next', lb).addEventListener('click', function () { open(idx + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') open(idx - 1);
        if (e.key === 'ArrowRight') open(idx + 1);
      });
    }

    /* ---------- 表格横向滚动容器 ---------- */
    $$('.article-content table').forEach(function (t) {
      if (t.parentNode.classList.contains('table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      wrap.style.overflowX = 'auto';
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });

    /* ---------- 单文加密 ---------- */
    if (window.LumenEncrypt) window.LumenEncrypt.init();
  });
})();
