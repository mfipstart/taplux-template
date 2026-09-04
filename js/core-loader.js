/*!
 * Taplux Core Loader v0.1.0
 * https://taplux.ru
 *
 * Thin async runtime that fetches the licensed core bundle from CDN
 * and bootstraps the page. The only code file in user repos.
 *
 * Loaded as: <script src="js/core-loader.js" defer></script>
 * (place it just before </body> in index.html and admin.html)
 *
 * Strategy:
 *   1. Try localStorage cache (instant render on repeat visits)
 *   2. Async-fetch from primary CDN (non-blocking)
 *   3. Save fresh copy to cache, fall back to cached if CDN unreachable
 *   4. If DOMContentLoaded already fired by the time core is injected,
 *      manually re-dispatch it so script.js/admin.js init handlers run
 *
 * Note: relies on `defer` so the loader runs after HTML parsing but
 * before native DOMContentLoaded. If CDN is fast, native DOMContentLoaded
 * fires naturally. If CDN is slow, our manual dispatch takes over.
 */
(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────
  var CDN_BASE = 'https://taplux-cdn.vercel.app/dist';
  var VERSION  = '0.1.1';
  var CACHE_KEY    = 'taplux-core-cache';
  var VERSION_KEY  = 'taplux-core-version';
  var STORAGE_FLAG = 'data-taplux-core';

  // ── Cache helpers (offline fallback) ──────────────────────────────
  function getCache() {
    try {
      var v = window.localStorage.getItem(VERSION_KEY);
      var c = window.localStorage.getItem(CACHE_KEY);
      if (v === VERSION && c) return JSON.parse(c);
    } catch (e) { /* localStorage disabled or quota */ }
    return null;
  }

  function setCache(jsCode, cssCode) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ js: jsCode, css: cssCode }));
      window.localStorage.setItem(VERSION_KEY, VERSION);
    } catch (e) { /* quota exceeded, ignore */ }
  }

  // ── DOM injection ─────────────────────────────────────────────────
  function injectCSS(cssCode) {
    var s = document.createElement('style');
    s.setAttribute(STORAGE_FLAG, 'v' + VERSION);
    s.textContent = cssCode;
    document.head.appendChild(s);
  }

  function injectJS(jsCode) {
    var s = document.createElement('script');
    s.setAttribute(STORAGE_FLAG, 'v' + VERSION);
    s.textContent = jsCode;
    document.head.appendChild(s);
  }

  // ── Async fetch ───────────────────────────────────────────────────
  function fetchText(url) {
    return fetch(url, { credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      });
  }

  // ── Error UI ──────────────────────────────────────────────────────
  function showError(message) {
    if (!document.body) return;
    document.body.innerHTML = ''
      + '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;'
      + 'background:#0a0a0a;color:#fff;font-family:system-ui,-apple-system,sans-serif;padding:20px;">'
      + '<div style="max-width:400px;text-align:center;">'
      + '<div style="font-size:56px;margin-bottom:16px;">⚠️</div>'
      + '<h1 style="color:#ff5577;margin:0 0 12px;font-size:22px;font-weight:600;">Taplux</h1>'
      + '<p style="color:#aaa;line-height:1.5;font-size:14px;margin:0;">' + message + '</p>'
      + '<button onclick="location.reload()" style="margin-top:24px;padding:12px 28px;background:#ff5577;'
      + 'color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;">'
      + 'Повторить</button>'
      + '</div></div>';
  }

  // ── DOMContentLoaded rescue ───────────────────────────────────────
  // If the native event already fired before we injected core, manually
  // dispatch it so script.js / admin.js can register and run their handlers.
  function fireDCLIfPast() {
    if (document.readyState === 'loading') return; // native will fire
    if (window.__taplux_dcl_rescued__) return;     // already done
    window.__taplux_dcl_rescued__ = true;
    // Defer to next tick so addEventListener handlers have a chance to register
    setTimeout(function () {
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }, 0);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────
  function bootstrap() {
    var cached = getCache();
    if (cached) {
      try {
        injectCSS(cached.css);
        injectJS(cached.js);
        fireDCLIfPast();
      } catch (e) {
        console.warn('[Taplux] Cache injection failed:', e);
      }
    }

    var cb = '?v=' + VERSION;
    Promise.all([
      fetchText(CDN_BASE + '/taplux-core.js'  + cb),
      fetchText(CDN_BASE + '/taplux-core.css' + cb),
    ])
      .then(function (results) {
        var jsCode  = results[0];
        var cssCode = results[1];
        setCache(jsCode, cssCode);
        if (!cached) {
          injectCSS(cssCode);
          injectJS(jsCode);
          fireDCLIfPast();
          console.log('%c[Taplux]%c Core v' + VERSION + ' loaded from CDN',
            'color:#ff5577;font-weight:bold', 'color:inherit');
        } else {
          console.log('[Taplux] Core v' + VERSION + ' cache up to date');
        }
      })
      .catch(function (e) {
        if (!cached) {
          showError('Не удалось загрузить конструктор. Проверьте подключение к интернету.');
          console.error('[Taplux] Bootstrap failed:', e);
        } else {
          console.warn('[Taplux] CDN unreachable, using cache. Error:', e.message);
        }
      });
  }

  // Run immediately. With `defer`, the parser has finished but DOMContentLoaded
  // may or may not have fired yet. fireDCLIfPast() handles both cases.
  bootstrap();
})();
