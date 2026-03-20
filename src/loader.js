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
  // Hides everything except the footer — shows an error notice above the footer
  function showInvalidLicense(message) {
    // Hide all non-footer sections
    var shells = document.querySelectorAll('[data-scaled-section]');
    shells.forEach(function(shell) {
      shell.classList.remove('scaled-shell--loading');
      if (shell.getAttribute('data-scaled-section') === 'footer') {
        // Keep footer visible — still try to render it
        return;
      }
      shell.style.display = 'none';
    });

    // Hide all direct children of body except footer-related and our notice
    var killCSS = document.createElement('style');
    killCSS.setAttribute('data-scaled-kill', '1');
    killCSS.textContent = [
      'body > *:not([data-scaled-section="footer"]):not(.scaled-license-notice-wrapper):not(#shopify-section-footer):not([id*="footer"]):not(footer) {',
      '  display: none !important;',
      '}',
      '[data-scaled-section]:not([data-scaled-section="footer"]) {',
      '  display: none !important;',
      '}',
      'body { background: #000 !important; color: #fff !important; }',
      '[data-scaled-section="footer"] { display: block !important; }',
      'footer, [id*="footer"], #shopify-section-footer { display: block !important; }',
    ].join('\n');
    document.head.appendChild(killCSS);

    // Insert a license error notice above the footer
    var notice = document.createElement('div');
    notice.className = 'scaled-license-notice-wrapper';
    notice.style.cssText = 'min-height:85vh;display:flex;align-items:center;justify-content:center;background:#000;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;padding:20px';
    notice.innerHTML =
      '<div style="max-width:420px;width:100%;text-align:center">' +
        '<div style="width:72px;height:72px;margin:0 auto 24px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
        '</div>' +
        '<h1 style="color:#fff;font-size:24px;font-weight:700;margin-bottom:8px;letter-spacing:-0.5px">License Invalid</h1>' +
        '<p style="color:#9ca3af;font-size:15px;line-height:1.6;margin-bottom:24px">' + (message || 'This theme license is not valid. Content cannot be displayed.') + '</p>' +
        '<div style="background:#110a0a;border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:10px">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
          '<span style="color:#fca5a5;font-size:13px">Check your license key in Theme Settings &gt; License &amp; Protection</span>' +
        '</div>' +
      '</div>';

    // Try to render the footer even on invalid license
    var footerShell = document.querySelector('[data-scaled-section="footer"]');
    if (footerShell) {
      footerShell.parentNode.insertBefore(notice, footerShell);
    } else {
      document.body.insertBefore(notice, document.body.firstChild);
    }

    // Prevent content from being added back
    startIntegrityMonitor();
  }

  // ─── Integrity Monitor ──────────────────────────────────────
  // Continuously checks that footer and license elements haven't been tampered with
  function startIntegrityMonitor() {
    setInterval(function() {
      // Re-inject kill CSS if removed
      var killEl = document.querySelector('[data-scaled-kill]');
      if (!killEl) {
        var s = document.createElement('style');
        s.setAttribute('data-scaled-kill', '1');
        s.textContent = '[data-scaled-section]:not([data-scaled-section="footer"]){display:none!important}body>*:not([data-scaled-section="footer"]):not(.scaled-license-notice-wrapper):not(footer):not([id*="footer"]):not(#shopify-section-footer){display:none!important}body{background:#000!important}';
        document.head.appendChild(s);
      }
    }, 2000);
  }

  // ─── Footer & License Protection Monitor ───────────────────
  // Runs on valid license too — ensures footer is never removed/hidden
  function startFooterProtection() {
    var footerSignature = null;

    function checkFooter() {
      var footer = document.querySelector('[data-scaled-section="footer"]');
      if (!footer) {
        // Footer was removed — kill the entire site
        nukeContent('Footer section was removed. This theme requires the footer to function.');
        return;
      }

      // Check footer hasn't been hidden via inline style
      var computedDisplay = window.getComputedStyle(footer).display;
      if (computedDisplay === 'none') {
        footer.style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important;';
      }

      // Store signature on first run, then verify it wasn't emptied
      if (!footerSignature) {
        if (footer.innerHTML.trim().length > 10) {
          footerSignature = footer.innerHTML.length;
        }
      } else {
        // If footer content is gutted (reduced by > 80%), nuke the site
        if (footer.innerHTML.length < footerSignature * 0.2) {
          nukeContent('Footer content was tampered with. This theme requires an intact footer.');
        }
      }
    }

    // Run every 3 seconds
    setInterval(checkFooter, 3000);
    // Also watch for DOM mutations on footer
    try {
      var footer = document.querySelector('[data-scaled-section="footer"]');
      if (footer) {
        var observer = new MutationObserver(function(mutations) {
          // Slight delay to allow legitimate renders
          setTimeout(checkFooter, 500);
        });
        observer.observe(footer, { childList: true, subtree: true, attributes: true });
      }
    } catch(e) {}
  }

  function nukeContent(reason) {
    // Kill everything — show a tamper notice
    document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:20px">' +
      '<div style="max-width:420px;width:100%;text-align:center">' +
        '<div style="width:72px;height:72px;margin:0 auto 24px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
        '</div>' +
        '<h1 style="color:#fff;font-size:24px;font-weight:700;margin-bottom:8px">Theme Protection Triggered</h1>' +
        '<p style="color:#9ca3af;font-size:15px;line-height:1.6;margin-bottom:24px">' + reason + '</p>' +
        '<p style="color:#6b7280;font-size:13px">Please restore the theme to its original state and reload the page.</p>' +
      '</div>' +
    '</div>';
    // Prevent any further modifications
    setInterval(function() {
      if (!document.querySelector('[data-scaled-tamper]')) {
        var s = document.createElement('style');
        s.setAttribute('data-scaled-tamper', '1');
        s.textContent = 'body>*:not(:first-child){display:none!important}';
        document.head.appendChild(s);
      }
    }, 1000);
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
          // Inject footer HTML from server before showing invalid license
          if (data.footerHtml) {
            var footerShell = document.querySelector('[data-scaled-section="footer"]');
            if (footerShell) {
              footerShell.innerHTML = data.footerHtml;
              footerShell.classList.remove('scaled-shell--loading');
            }
          }
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

      // Start footer protection — prevents removal/tampering of footer
      startFooterProtection();
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
              if (data.footerHtml) {
                var footerShell = document.querySelector('[data-scaled-section="footer"]');
                if (footerShell) {
                  footerShell.innerHTML = data.footerHtml;
                  footerShell.classList.remove('scaled-shell--loading');
                }
              }
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
