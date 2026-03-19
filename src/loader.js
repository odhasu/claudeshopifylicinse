/**
 * Scaled Loader v3
 *
 * Reads all shell sections from the DOM, collects their settings and product data,
 * sends everything to the protection server, and injects the rendered HTML back
 * into each shell container.
 *
 * License States:
 * - No license key → Setup page (friendly instructions)
 * - Invalid license → Black blocked page (kill-switch)
 * - Valid license   → Normal theme rendering
 */
(function() {
  'use strict';

  var config = window.ScaledConfig || {};
  var apiUrl = config.apiUrl || '';
  var licenseKey = config.licenseKey || '';
  var shopDomain = config.shopDomain || window.location.hostname;
  var permanentDomain = config.permanentDomain || (window.Shopify && window.Shopify.shop ? window.Shopify.shop : '');

  // ─── Hide Loader Helper ─────────────────────────────────────
  function hideLoader() {
    document.body.classList.remove('is-loading');
    var loader = document.getElementById('scaled-loader');
    if (loader) {
      loader.classList.add('is-hidden');
      setTimeout(function(){ loader.remove(); }, 500);
    }
  }

  // ─── No API URL — show setup ────────────────────────────────
  if (!apiUrl) {
    document.addEventListener('DOMContentLoaded', function() {
      hideLoader();
      showSetupPage();
    });
    return;
  }

  // ─── No License Key — show setup page ───────────────────────
  if (!licenseKey || licenseKey.trim() === '') {
    document.addEventListener('DOMContentLoaded', function() {
      hideLoader();
      showSetupPage();
    });
    return;
  }

  // ─── Collect Shell Sections ─────────────────────────────────
  function collectSections() {
    var sections = [];
    var shells = document.querySelectorAll('[data-scaled-section]');

    shells.forEach(function(shell) {
      var sectionType = shell.getAttribute('data-scaled-section');
      var settings = {};
      var products = null;

      var settingsEl = document.querySelector('script[data-scaled-section-settings="' + sectionType + '"]');
      if (settingsEl) {
        try { settings = JSON.parse(settingsEl.textContent); } catch(e) {}
      }

      var productsEl = document.querySelector('script[data-scaled-products="' + sectionType + '"]');
      if (productsEl) {
        try { products = JSON.parse(productsEl.textContent); } catch(e) {}
      }

      sections.push({
        type: sectionType,
        elementId: shell.id,
        settings: settings,
        products: products
      });
    });

    return sections;
  }

  // ─── Inject Rendered HTML ───────────────────────────────────
  function injectSection(elementId, html) {
    var shell = document.getElementById(elementId);
    if (!shell) return;

    shell.innerHTML = html;
    shell.classList.remove('scaled-shell--loading');
    shell.classList.add('scaled-shell--loaded');

    var scripts = shell.querySelectorAll('script');
    scripts.forEach(function(oldScript) {
      var newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  // ─── CSS Injection ──────────────────────────────────────────
  function injectCSS(css) {
    if (!css) return;
    var style = document.createElement('style');
    style.setAttribute('data-scaled', 'critical');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── JS Injection ───────────────────────────────────────────
  function injectJS(js) {
    if (!js) return;
    try { new Function(js)(); } catch(e) {}
  }

  // ─── Setup Page (No License) ────────────────────────────────
  function showSetupPage() {
    var shells = document.querySelectorAll('[data-scaled-section]');
    shells.forEach(function(shell) {
      shell.classList.remove('scaled-shell--loading');
      shell.innerHTML = '';
    });

    document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;padding:20px">' +
      '<div style="max-width:460px;width:100%;text-align:center">' +
        '<div style="width:72px;height:72px;margin:0 auto 24px;border-radius:50%;background:rgba(59,130,246,0.1);display:flex;align-items:center;justify-content:center">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
        '</div>' +
        '<h1 style="color:#fff;font-size:24px;font-weight:700;margin-bottom:8px;letter-spacing:-0.5px">Theme Setup Required</h1>' +
        '<p style="color:#9ca3af;font-size:15px;line-height:1.6;margin-bottom:32px">Enter your license key to activate this theme and unlock all features.</p>' +
        '<div style="background:#111;border:1px solid #222;border-radius:12px;padding:24px;text-align:left;margin-bottom:24px">' +
          '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #1a1a1a">' +
            '<div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:rgba(57,255,20,0.1);color:#39ff14;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">1</div>' +
            '<div><div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:2px">Open Theme Settings</div><div style="color:#6b7280;font-size:13px">Click the gear icon in the theme editor sidebar</div></div>' +
          '</div>' +
          '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #1a1a1a">' +
            '<div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:rgba(57,255,20,0.1);color:#39ff14;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">2</div>' +
            '<div><div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:2px">Go to License & Protection</div><div style="color:#6b7280;font-size:13px">Scroll down to find the License & Protection section</div></div>' +
          '</div>' +
          '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0">' +
            '<div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:rgba(57,255,20,0.1);color:#39ff14;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">3</div>' +
            '<div><div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:2px">Enter Your License Key</div><div style="color:#6b7280;font-size:13px">Paste your XXXX-XXXX-XXXX-XXXX key, then click Save</div></div>' +
          '</div>' +
        '</div>' +
        '<div style="background:#0a0f1a;border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
          '<span style="color:#93c5fd;font-size:13px">Don\'t have a license? Contact the theme developer.</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ─── Invalid License Page (Kill Switch) ─────────────────────
  function showInvalidLicense(message) {
    var shells = document.querySelectorAll('[data-scaled-section]');
    shells.forEach(function(shell) {
      shell.classList.remove('scaled-shell--loading');
      shell.innerHTML = '';
    });

    document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;padding:20px">' +
      '<div style="max-width:420px;width:100%;text-align:center">' +
        '<div style="width:72px;height:72px;margin:0 auto 24px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
        '</div>' +
        '<h1 style="color:#fff;font-size:24px;font-weight:700;margin-bottom:8px;letter-spacing:-0.5px">License Invalid</h1>' +
        '<p style="color:#9ca3af;font-size:15px;line-height:1.6;margin-bottom:24px">' + (message || 'This theme license is not valid. Content cannot be displayed.') + '</p>' +
        '<div style="background:#110a0a;border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:10px">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
          '<span style="color:#fca5a5;font-size:13px">Check your license key in Theme Settings > License & Protection</span>' +
        '</div>' +
      '</div>' +
    '</div>';

    // Prevent content from being added back
    startIntegrityMonitor();
  }

  // ─── Integrity Monitor ──────────────────────────────────────
  function startIntegrityMonitor() {
    // Re-check every 2s that the page hasn't been tampered with
    setInterval(function() {
      var killEl = document.querySelector('[data-scaled-kill]');
      if (!killEl) {
        var s = document.createElement('style');
        s.setAttribute('data-scaled-kill', '1');
        s.textContent = '[data-scaled-section]{display:none!important}';
        document.head.appendChild(s);
      }
    }, 2000);
  }

  // ─── Main Render Request ────────────────────────────────────
  function loadContent() {
    var sections = collectSections();

    var payload = {
      licenseKey: licenseKey,
      domain: shopDomain,
      permanentDomain: permanentDomain,
      sections: sections,
      colors: config.colors || {},
      brandName: config.brandName || '',
      logoUrl: config.logoUrl || null,
      chatbot: config.chatbot || {},
      urgency: config.urgency || {}
    };

    fetch(apiUrl + '/api/v3/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(response) {
      if (response.status === 403) {
        return response.json().then(function(data) {
          hideLoader();
          showInvalidLicense(data.message);
          throw new Error('license_invalid');
        });
      }
      if (response.status === 400) {
        hideLoader();
        showSetupPage();
        throw new Error('missing_params');
      }
      if (response.status === 429) {
        hideLoader();
        showInvalidLicense('Too many requests. Please try again later.');
        throw new Error('rate_limited');
      }
      if (!response.ok) throw new Error('server_error');
      return response.json();
    })
    .then(function(data) {
      if (!data || data.status !== 'ok') {
        hideLoader();
        showInvalidLicense('Unexpected server response.');
        return;
      }

      // Inject global CSS
      if (data.css) injectCSS(data.css);

      // Inject global JS
      if (data.js) injectJS(data.js);

      // Inject each section
      if (data.sections && Array.isArray(data.sections)) {
        data.sections.forEach(function(section) {
          if (section.elementId && section.html) {
            injectSection(section.elementId, section.html);
          }
        });
      }

      // Hide loader after successful render
      hideLoader();
    })
    .catch(function(err) {
      if (err.message === 'license_invalid' || err.message === 'rate_limited' || err.message === 'missing_params') return;
      // Retry once after 2 seconds
      setTimeout(function() {
        fetch(apiUrl + '/api/v3/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function(r) {
          if (r.status === 403) {
            return r.json().then(function(data) {
              hideLoader();
              showInvalidLicense(data.message);
            });
          }
          return r.json();
        })
        .then(function(data) {
          if (data && data.status === 'ok') {
            if (data.css) injectCSS(data.css);
            if (data.js) injectJS(data.js);
            if (data.sections) {
              data.sections.forEach(function(s) {
                if (s.elementId && s.html) injectSection(s.elementId, s.html);
              });
            }
            hideLoader();
          }
        })
        .catch(function() {
          hideLoader();
          showInvalidLicense('Unable to connect to the theme server. Please check your Server URL in Theme Settings.');
        });
      }, 2000);
    });
  }

  // ─── Boot ───────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
