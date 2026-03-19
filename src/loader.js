/**
 * Scaled Loader v3
 *
 * Reads all shell sections from the DOM, collects their settings and product data,
 * sends everything to the protection server, and injects the rendered HTML back
 * into each shell container.
 *
 * Anti-Theft Features:
 * - Without this script, the theme is empty shells with no content
 * - License + domain validation on every page load
 * - Kill-switch overlay for invalid licenses
 * - Integrity monitor prevents DevTools removal of kill-switch
 * - debugProtection in obfuscated version crashes on DevTools
 * - selfDefending detects code modification/reformatting
 */
(function() {
  'use strict';

  var config = window.ScaledConfig || {};
  var apiUrl = config.apiUrl || '';
  var licenseKey = config.licenseKey || '';
  var shopDomain = config.shopDomain || window.location.hostname;
  var permanentDomain = config.permanentDomain || (window.Shopify && window.Shopify.shop ? window.Shopify.shop : '');

  if (!apiUrl) return;

  // ─── Collect Shell Sections ───────────────────────────────────
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

  // ─── Inject Rendered HTML ─────────────────────────────────────
  function injectSection(elementId, html) {
    var shell = document.getElementById(elementId);
    if (!shell) return;

    shell.innerHTML = html;
    shell.classList.remove('scaled-shell--loading');
    shell.classList.add('scaled-shell--loaded');

    // Execute inline scripts
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

  // ─── CSS Injection ────────────────────────────────────────────
  function injectCSS(css) {
    if (!css) return;
    var style = document.createElement('style');
    style.setAttribute('data-scaled', 'critical');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── JS Injection ─────────────────────────────────────────────
  function injectJS(js) {
    if (!js) return;
    try { new Function(js)(); } catch(e) {}
  }

  // ─── License Error ────────────────────────────────────────────
  function showLicenseError(message) {
    var shells = document.querySelectorAll('[data-scaled-section]');
    shells.forEach(function(shell) {
      shell.classList.remove('scaled-shell--loading');
    });

    var main = document.getElementById('main-content') || document.querySelector('main');
    if (main) {
      main.innerHTML = '<div class="scaled-license-notice-wrapper">' +
        '<div class="scaled-license-notice scaled-license-notice--error">' +
        '<div class="scaled-license-notice__icon">&#9888;</div>' +
        '<div class="scaled-license-notice__title">License Required</div>' +
        '<div class="scaled-license-notice__message">' + (message || 'This theme requires a valid license to display content.') + '</div>' +
        '<div class="scaled-license-notice__steps">' +
        '<div class="scaled-license-notice__step"><span class="scaled-license-notice__step-num">1</span>Go to Theme Settings</div>' +
        '<div class="scaled-license-notice__step"><span class="scaled-license-notice__step-num">2</span>Enter your license key</div>' +
        '<div class="scaled-license-notice__step"><span class="scaled-license-notice__step-num">3</span>Save and refresh</div>' +
        '</div>' +
        '<div class="scaled-license-notice__help">Need help? Contact the theme developer.</div>' +
        '</div></div>';
    }

    // Inject kill-switch CSS
    if (!document.querySelector('[data-scaled="kill"]')) {
      var killStyle = document.createElement('style');
      killStyle.setAttribute('data-scaled', 'kill');
      killStyle.textContent = 'body>*:not(.scaled-license-notice-wrapper):not(.scaled-license-notice){opacity:0.1!important;pointer-events:none!important;filter:blur(4px)!important}';
      document.head.appendChild(killStyle);
    }

    startIntegrityMonitor();
  }

  // ─── Integrity Monitor ────────────────────────────────────────
  function startIntegrityMonitor() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.removedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.getAttribute && node.getAttribute('data-scaled') === 'kill') {
            document.head.appendChild(node);
          }
          if (node.nodeType === 1 && node.classList && node.classList.contains('scaled-license-notice')) {
            document.body.appendChild(node);
          }
        });
      });
    });
    observer.observe(document.head, { childList: true });
    observer.observe(document.body, { childList: true });
  }

  // ─── Main Render Request ──────────────────────────────────────
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
          if (data.killCSS) injectCSS(data.killCSS);
          showLicenseError(data.message);
          throw new Error('license_invalid');
        });
      }
      if (response.status === 429) {
        showLicenseError('Too many requests. Please try again later.');
        throw new Error('rate_limited');
      }
      if (!response.ok) throw new Error('server_error');
      return response.json();
    })
    .then(function(data) {
      if (!data || data.status !== 'ok') {
        showLicenseError('Unexpected server response.');
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
    })
    .catch(function(err) {
      if (err.message === 'license_invalid' || err.message === 'rate_limited') return;
      // Retry once after 2 seconds
      setTimeout(function() {
        fetch(apiUrl + '/api/v3/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.status === 'ok') {
            if (data.css) injectCSS(data.css);
            if (data.js) injectJS(data.js);
            if (data.sections) {
              data.sections.forEach(function(s) {
                if (s.elementId && s.html) injectSection(s.elementId, s.html);
              });
            }
          }
        })
        .catch(function() {
          showLicenseError('Unable to connect to the theme server. Please check your settings.');
        });
      }, 2000);
    });
  }

  // ─── Boot ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
