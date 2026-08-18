/* Lumen — 主题切换（auto / light / dark 三态循环）
 * 与 head 内联脚本配合：内联脚本负责首帧无闪烁着色，
 * 本文件负责交互切换与系统偏好实时跟随。 */
(function () {
  'use strict';
  var STORAGE_KEY = 'lumen-theme';
  var MODES = ['auto', 'light', 'dark'];
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function applied(mode) {
    return mode === 'dark' || (mode === 'auto' && media.matches);
  }

  function apply(mode) {
    var theme = applied(mode) ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.dispatchEvent(new CustomEvent('lumen:theme', { detail: { mode: mode, theme: theme } }));
  }

  function current() {
    try {
      var m = localStorage.getItem(STORAGE_KEY);
      if (MODES.indexOf(m) > -1) return m;
    } catch (e) { /* 隐私模式降级 */ }
    return 'auto';
  }

  function set(mode) {
    if (MODES.indexOf(mode) < 0) mode = 'auto';
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    apply(mode);
  }

  function next() {
    set(MODES[(MODES.indexOf(current()) + 1) % MODES.length]);
  }

  media.addEventListener('change', function () {
    if (current() === 'auto') apply('auto');
  });

  window.LumenTheme = { current: current, set: set, next: next, apply: apply };
})();
