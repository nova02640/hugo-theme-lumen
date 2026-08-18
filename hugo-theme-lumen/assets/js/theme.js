/* ==========================================================================
   theme.js —— 明暗双主题三态切换（方案二·明暗双主题）
   特性：亮/暗/自动三态；跟随系统；页面刷新无闪烁（前置内联脚本）
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "lumen-theme";     // 用户显式选择
  var RESOLVED_KEY = "lumen-resolved";   // 实际生效（light/dark）缓存，避免首屏闪烁

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY) || "auto"; }
    catch (e) { return "auto"; }
  }
  function setStored(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  // 解析最终生效主题：auto → 跟随系统；否则取 light/dark
  function resolve(pref) {
    if (pref === "light" || pref === "dark") return pref;
    return systemPrefersDark() ? "dark" : "light";
  }
  function apply(theme) {
    var pref = theme || getStored();
    var resolved = resolve(pref);
    document.documentElement.setAttribute("data-theme", pref);
    document.documentElement.setAttribute("data-resolved", resolved);
    try { localStorage.setItem(RESOLVED_KEY, resolved); } catch (e) {}
    // 同步按钮 aria 状态
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.setAttribute("aria-label", "切换主题（当前：" + resolved + "）");
    document.dispatchEvent(new CustomEvent("lumen:theme", { detail: { resolved: resolved, pref: pref } }));
  }

  // 切换顺序：auto → light → dark → auto（循环三态）
  function cycle() {
    var cur = getStored();
    var next = cur === "auto" ? "light" : cur === "light" ? "dark" : "auto";
    setStored(next);
    apply(next);
  }

  // 跟随系统实时变化（仅 auto 模式下生效）
  function bindSystemChange() {
    if (!window.matchMedia) return;
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var handler = function () {
      if (getStored() === "auto") apply("auto");
    };
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  function init() {
    apply(getStored());
    bindSystemChange();
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.addEventListener("click", cycle);
  }

  // 暴露给 main.js / search.js
  window.LumenTheme = { apply: apply, cycle: cycle, getStored: getStored };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
