/* Lumen — 单文加密：前端 AES-GCM 加密 + 密码解锁（无感解密）
 * 触发条件：文章正文容器 #article-body 带有 data-password 属性
 *   - 明文密码：前端 SHA-256 派生密钥
 *   - 64 位小写 hex：视为已哈希密码，不在页面泄露明文
 * 依赖 Web Crypto API；不可用时降级为 XOR 混淆（仍校验哈希）。 */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  var I18N = (window.LUMEN_I18N || {}).encrypt || {};

  var SESSION_KEY = 'lumen-unlock';
  var HEX = /^[0-9a-f]{64}$/i;

  function bufToHex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }
  function hexToBuf(hex) {
    var out = new Uint8Array(hex.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }
  function b64encode(buf) {
    var bin = '';
    var bytes = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64decode(str) {
    var bin = atob(str);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function utf8(buf) { return new TextDecoder().decode(buf); }
  function bufOf(str) { return new TextEncoder().encode(str); }

  function sha256Hex(str) {
    return crypto.subtle.digest('SHA-256', bufOf(str)).then(bufToHex);
  }
  function importKey(hex) {
    return crypto.subtle.importKey('raw', hexToBuf(hex), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  function encryptAes(plain, key) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, bufOf(plain)).then(function (ct) {
      return b64encode(iv) + '.' + b64encode(ct);
    });
  }
  function decryptAes(data, key) {
    var parts = data.split('.');
    if (parts.length !== 2) return Promise.reject(new Error('bad data'));
    var iv = b64decode(parts[0]);
    var ct = b64decode(parts[1]);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct).then(function (pt) {
      return utf8(pt);
    });
  }

  /* XOR 降级（非加密标准，仅作兜底） */
  function xorData(str, hex) {
    var key = hexToBuf(hex);
    var bytes = bufOf(str);
    var out = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key[i % key.length];
    return b64encode(out);
  }
  function unxorData(b64, hex) {
    var bytes = b64decode(b64);
    var key = hexToBuf(hex);
    var out = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ key[i % key.length];
    return utf8(out);
  }

  function renderLock(container, verify) {
    var html =
      '<div class="article-lock">' +
      '  <div class="lock-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +
      '  <p>' + (I18N.title || 'This post is protected. Enter the password to continue.') + '</p>' +
      '  <form>' +
      '    <input type="password" name="password" autocomplete="current-password" placeholder="' + (I18N.placeholder || 'Password') + '" aria-label="Password" autofocus>' +
      '    <div class="lock-error" role="alert"></div>' +
      '    <button class="btn" type="submit">' + (I18N.submit || 'Unlock') + '</button>' +
      '  </form>' +
      '</div>';
    container.innerHTML = html;
    var form = container.querySelector('form');
    var input = container.querySelector('input');
    var error = container.querySelector('.lock-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = input.value;
      if (!val) return;
      sha256Hex(val).then(function (h) {
        verify(h, val);
      }).catch(function () {
        verify('', val);
      });
    });
  }

  function init() {
    var body = document.getElementById('article-body');
    if (!body || !body.getAttribute('data-password')) return;
    var pw = body.getAttribute('data-password');
    var originalHTML = body.innerHTML;

    var keyHexPromise = HEX.test(pw) ? Promise.resolve(pw.toLowerCase()) : sha256Hex(pw);
    keyHexPromise.then(function (keyHex) {
      var hasCrypto = window.crypto && crypto.subtle;

      // 会话内已解锁：直接恢复
      try {
        var saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        if (saved && saved.key === keyHex && saved.data) {
          var restore = function () {
            if (hasCrypto) {
              importKey(keyHex).then(function (key) {
                return decryptAes(saved.data, key).then(function (html) { body.innerHTML = html; });
              }).catch(function () { body.innerHTML = unxorData(saved.data, keyHex); });
            } else {
              body.innerHTML = unxorData(saved.data, keyHex);
            }
          };
          restore();
          return;
        }
      } catch (e) {}

      // 加密正文（无感：页面加载瞬间完成）
      var cipherPromise;
      if (hasCrypto) {
        cipherPromise = importKey(keyHex).then(function (key) {
          return encryptAes(originalHTML, key);
        });
      } else {
        cipherPromise = Promise.resolve(xorData(originalHTML, keyHex));
      }

      cipherPromise.then(function (cipher) {
        renderLock(body, function (guessHex, guessRaw) {
          if (guessHex !== keyHex) {
            body.querySelector('.lock-error').textContent = I18N.wrong || 'Incorrect password';
            return;
          }
          var show = function (html) { body.innerHTML = html; };
          if (hasCrypto) {
            importKey(keyHex).then(function (key) {
              decryptAes(cipher, key).then(show).catch(function () { show(originalHTML); });
            });
          } else {
            show(unxorData(cipher, keyHex));
          }
          try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ key: keyHex, data: cipher })); } catch (e) {}
        });
      });
    });
  }

  window.LumenEncrypt = { init: init };
})();
