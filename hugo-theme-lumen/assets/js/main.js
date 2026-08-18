/* ==========================================================================
   main.js —— 全局交互脚本（方案一·脚本策略：极简原生 JS，总体 <20KB）
   功能：阅读进度条 / TOC 高亮折叠 / 移动端导航 / 代码块复制 / 公告关闭
          单文 AES 解密 / 懒加载增强 / 评论区懒加载
   设计：90% 视觉交互由 CSS 实现，JS 仅做渐进增强；无 JS 也可浏览全站。
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* —— 顶部阅读进度条（方案二·阅读进度条）—— */
  function initReadingProgress() {
    var bar = $(".reading-progress");
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var total = h.scrollHeight - h.clientHeight;
      var pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct.toFixed(2) + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* —— 智能自动目录：滚动实时高亮当前章节（方案二·智能自动目录）—— */
  function initToc() {
    var toc = $(".toc");
    if (!toc) return;
    var links = $$("a[href^=\"#\"]", toc);
    if (!links.length) return;
    var headings = links.map(function (a) {
      var id = a.getAttribute("href").slice(1);
      return document.getElementById(id);
    }).filter(Boolean);

    function setActive(id) {
      links.forEach(function (a) {
        var match = a.getAttribute("href") === "#" + id;
        a.classList.toggle("is-active", match);
        if (match) {
          var parent = a.parentElement ? a.parentElement.parentElement : null;
          while (parent && parent.tagName === "OL" && parent.parentElement && parent.parentElement.classList.contains("toc")) {
            // 保留父级可见
            parent = parent.parentElement;
          }
        }
      });
    }

    if (!("IntersectionObserver" in window)) return;
    var visibleIds = [];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var idx = visibleIds.indexOf(e.target.id);
        if (e.isIntersecting && idx === -1) visibleIds.push(e.target.id);
        else if (!e.isIntersecting && idx > -1) visibleIds.splice(idx, 1);
      });
      if (visibleIds.length) {
        var topId = visibleIds.sort(function (a, b) {
          var ea = document.getElementById(a), eb = document.getElementById(b);
          return ea.getBoundingClientRect().top - eb.getBoundingClientRect().top;
        })[0];
        setActive(topId);
      }
    }, { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] });
    headings.forEach(function (h) { observer.observe(h); });
  }

  /* —— TOC 折叠 / 展开（移动端悬浮入口）—— */
  function initTocFab() {
    var fab = $(".toc-fab");
    var toc = $(".toc");
    if (!fab || !toc) return;
    fab.addEventListener("click", function () {
      toc.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* —— 移动端导航 —— */
  function initNavToggle() {
    var toggle = $(".nav-toggle");
    var nav = $(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* —— 高级代码高亮：一键复制（方案二·高级代码高亮）—— */
  function initCopyCode() {
    if (!("clipboard" in navigator)) return;
    $$(".code-block").forEach(function (block) {
      if (block.querySelector(".code-block__copy")) return;
      var header = $(".code-block__header", block) || block;
      var lang = (block.getAttribute("data-lang") || "").toUpperCase() || "CODE";
      var btn = document.createElement("button");
      btn.className = "code-block__copy";
      btn.type = "button";
      btn.setAttribute("aria-label", "复制代码");
      btn.innerHTML = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2v1H4a2 2 0 0 1-2-2V4zm6 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8zm2 0v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1z"/></svg><span>复制</span>';
      btn.addEventListener("click", function () {
        var pre = $("pre", block);
        var text = pre ? pre.innerText : block.innerText;
        navigator.clipboard.writeText(text).then(function () {
          btn.classList.add("is-copied");
          btn.querySelector("span").textContent = "已复制";
          setTimeout(function () {
            btn.classList.remove("is-copied");
            btn.querySelector("span").textContent = "复制";
          }, 1800);
        });
      });
      if (!header.classList.contains("code-block__header")) {
        // 若无 header，创建一个
        var h = document.createElement("div");
        h.className = "code-block__header";
        h.innerHTML = '<span class="code-block__lang">' + lang + "</span>";
        block.insertBefore(h, block.firstChild);
        h.appendChild(btn);
      } else {
        if (!header.querySelector(".code-block__lang")) {
          var s = document.createElement("span");
          s.className = "code-block__lang";
          s.textContent = lang;
          header.insertBefore(s, header.firstChild);
        }
        header.appendChild(btn);
      }
    });
  }

  /* —— 全站公告关闭（方案二进阶功能）—— */
  function initAnnouncement() {
    var bar = $(".announcement");
    if (!bar) return;
    var key = "lumen-announcement-" + (bar.getAttribute("data-id") || "default");
    var close = $(".announcement__close", bar);
    if (!close) return;
    try {
      if (localStorage.getItem(key) === "closed") bar.style.display = "none";
    } catch (e) {}
    close.addEventListener("click", function () {
      bar.style.display = "none";
      try { localStorage.setItem(key, "closed"); } catch (e) {}
    });
  }

  /* —— 单文 AES 解密（方案二进阶·单文加密保护）—— */
  function initEncrypted() {
    var form = $(".encrypt-form");
    if (!form) return;
    var cipher = form.getAttribute("data-cipher") || "";
    var target = $(".content--encrypted");
    if (!cipher || !target) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var pwd = $('input[type="password"]', form);
      if (!pwd || !pwd.value) return;
      try {
        // 简单 AES：基于 CryptoJS 等价实现（如需更强可引入 Web Crypto）
        // 此处使用内置 AES-GCM via WebCrypto（密码经 PBKDF2 派生密钥）
        decryptAESGCM(cipher, pwd.value).then(function (plain) {
          target.innerHTML = plain;
          target.classList.remove("content--encrypted");
          form.style.display = "none";
          // 解密后初始化交互组件
          initCopyCode();
          initToc();
        }).catch(function () {
          var err = $(".encrypt-form__error", form);
          if (err) err.textContent = "密码错误，请重试";
        });
      } catch (e) {
        var err = $(".encrypt-form__error", form);
        if (err) err.textContent = "解密失败";
      }
    });
  }

  function base64ToBuf(b64) {
    var raw = atob(b64);
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes.buffer;
  }
  function deriveKey(password, salt) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey(
      "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
    ).then(function (baseKey) {
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        baseKey, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
      );
    });
  }
  function decryptAESGCM(payload, password) {
    var parts = payload.split(":");
    var saltB64 = parts[0], ivB64 = parts[1], dataB64 = parts[2];
    var salt = new Uint8Array(base64ToBuf(saltB64));
    var iv = new Uint8Array(base64ToBuf(ivB64));
    var data = base64ToBuf(dataB64);
    return deriveKey(password, salt).then(function (key) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
    }).then(function (buf) {
      return new TextDecoder().decode(buf);
    });
  }

  /* —— 第三方脚本懒加载：评论区滚动至可视区域后再初始化（方案五·第三方资源优化）—— */
  function initLazyComments() {
    var holder = $("[data-lazy-comments]");
    if (!holder) return;
    var src = holder.getAttribute("data-src");
    if (!src) return;
    if (!("IntersectionObserver" in window)) {
      loadScript(src); return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          loadScript(src);
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: "200px" });
    io.observe(holder);
  }
  function loadScript(src) {
    var s = document.createElement("script");
    s.src = src; s.async = true;
    s.setAttribute("data-lazy-loaded", "1");
    document.body.appendChild(s);
  }

  function init() {
    initReadingProgress();
    initToc();
    initTocFab();
    initNavToggle();
    initCopyCode();
    initAnnouncement();
    initEncrypted();
    initLazyComments();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  // 暴露以便解密后二次调用
  window.LumenMain = {
    initCopyCode: initCopyCode,
    initToc: initToc
  };
})();
