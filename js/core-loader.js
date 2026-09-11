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

  // ── Configuration ────────────────────────────────────────────────
  var CDN_BASE = 'https://taplux-cdn.vercel.app/dist';
  var VERSION  = '0.1.5';
  var CACHE_PREFIX = 'taplux-core-cache_';
  var VERSION_KEY  = 'taplux-core-version';
  var STORAGE_FLAG = 'data-taplux-core';

  // ── Helper: resolve license context (key + github_repo) ──────────
  // Phase M5: для GitHub-Repo Binding нужно знать и ключ, и github_repo.
  // Возвращает { key: string, githubRepo: string }.
  function resolveLicenseContext() {
    try {
      var override = window.__TAPLUX_LICENSE_KEY__;
      if (override) {
        return fetch('data.json?t=' + Date.now(), { credentials: 'omit' })
          .then(function (r) { return r.ok ? r.json() : {}; })
          .then(function (data) {
            return { key: override, githubRepo: (data && data._meta && data._meta.github_repo) || '' };
          })
          .catch(function () { return { key: override, githubRepo: '' }; });
      }
      var p = new URLSearchParams(window.location.search);
      if (p.get('key') || p.get('license_key')) {
        return fetch('data.json?t=' + Date.now(), { credentials: 'omit' })
          .then(function (r) { return r.ok ? r.json() : {}; })
          .then(function (data) {
            return { key: p.get('key') || p.get('license_key'), githubRepo: (data && data._meta && data._meta.github_repo) || '' };
          })
          .catch(function () { return { key: p.get('key') || p.get('license_key') || '', githubRepo: '' }; });
      }
      var lk = window.localStorage.getItem('taplux_license_key');
      if (lk) {
        return fetch('data.json?t=' + Date.now(), { credentials: 'omit' })
          .then(function (r) { return r.ok ? r.json() : {}; })
          .then(function (data) {
            return { key: lk, githubRepo: (data && data._meta && data._meta.github_repo) || '' };
          })
          .catch(function () { return { key: lk, githubRepo: '' }; });
      }
    } catch (e) {}

    // Fallback: всё из data.json
    return fetch('data.json?t=' + Date.now(), { credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) return {};
        return r.json();
      })
      .then(function (data) {
        return {
          key: (data && data.license && data.license.key) || '',
          githubRepo: (data && data._meta && data._meta.github_repo) || ''
        };
      })
      .catch(function () {
        return { key: '', githubRepo: '' };
      });
  }

  // ── Cache helpers (offline fallback) ─────────────────────────────
  // Кеш привязан к (key, github_repo) — разные репо не делятся кешом.
  function getCache(licenseKey, githubRepo) {
    try {
      var v = window.localStorage.getItem(VERSION_KEY);
      var suffix = (licenseKey || 'anon') + '_' + (githubRepo || 'anon');
      var c = window.localStorage.getItem(CACHE_PREFIX + suffix);
      if (v === VERSION && c) return JSON.parse(c);
    } catch (e) { /* localStorage disabled or quota */ }
    return null;
  }

  function setCache(licenseKey, githubRepo, jsCode, cssCode) {
    try {
      var suffix = (licenseKey || 'anon') + '_' + (githubRepo || 'anon');
      window.localStorage.setItem(CACHE_PREFIX + suffix, JSON.stringify({ js: jsCode, css: cssCode }));
      window.localStorage.setItem(VERSION_KEY, VERSION);
    } catch (e) { /* quota exceeded, ignore */ }
  }

  // ── DOM injection ────────────────────────────────────────────────
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
        return r.text().then(function (text) {
          if (r.status === 403) {
            injectJS(text);
            throw new Error('HTTP 403: ' + text);
          }
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return text;
        });
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

  // ── DOMContentLoaded rescue ────────────────────────────────────────
  function fireDCLIfPast() {
    if (document.readyState === 'loading') return; // native will fire
    if (window.__taplux_dcl_rescued__) return;     // already done
    window.__taplux_dcl_rescued__ = true;
    setTimeout(function () {
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }, 0);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────
  function bootstrap() {
    resolveLicenseContext().then(function (ctx) {
      var licenseKey = (ctx.key || '').trim();
      var githubRepo = (ctx.githubRepo || '').trim();

      // Phase M5: /api/core требует github_repo. Используем абсолютный URL,
      // т.к. пользовательский Vercel-проект не имеет своей /api/* (живёт на taplux.vercel.app).
      var coreJsUrl = 'https://taplux.vercel.app/api/core?key=' + encodeURIComponent(licenseKey);
      if (githubRepo) {
        coreJsUrl += '&github_repo=' + encodeURIComponent(githubRepo);
      }
      var coreCssUrl = CDN_BASE + '/taplux-core.css?v=' + VERSION;

      var cached = getCache(licenseKey, githubRepo);
      if (cached) {
        try {
          injectCSS(cached.css);
          injectJS(cached.js);
          fireDCLIfPast();
        } catch (e) {
          console.warn('[Taplux] Cache injection failed:', e);
        }
      }

      Promise.all([
        fetchText(coreJsUrl),
        fetchText(coreCssUrl)
      ])
        .then(function (results) {
          var jsCode  = results[0];
          var cssCode = results[1];
          setCache(licenseKey, githubRepo, jsCode, cssCode);
          if (!cached) {
            injectCSS(cssCode);
            injectJS(jsCode);
            fireDCLIfPast();
            console.log('%c[Taplux]%c Core v' + VERSION + ' loaded via dynamic endpoint',
              'color:#ff5577;font-weight:bold', 'color:inherit');
          } else {
            console.log('[Taplux] Core v' + VERSION + ' cache up to date');
          }
        })
        .catch(function (e) {
          if (!cached) {
            var msg = e && e.message && e.message.indexOf('HTTP 403') !== -1
              ? 'Лицензия не привязана к этому репозиторию. Проверьте data.json: поле _meta.github_repo.'
              : 'Не удалось загрузить конструктор. Проверьте подключение к интернету или лицензию.';
            showError(msg);
            console.error('[Taplux] Bootstrap failed:', e);
          } else {
            console.warn('[Taplux] Core endpoint unreachable, using cache. Error:', e.message);
          }
        });
    });
  }

  // Run immediately. With `defer`, the parser has finished but DOMContentLoaded
  // may or may not have fired yet. fireDCLIfPast() handles both cases.
  bootstrap();
})();
