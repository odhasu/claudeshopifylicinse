/**
 * OGVendors Theme Protection Server — v3 Architecture
 *
 * The "Brain" — renders section HTML, serves critical CSS/JS,
 * and validates licenses. Shell sections on Shopify are empty containers;
 * this server fills them with content for licensed stores only.
 *
 * Uses JSON file storage (Vercel-compatible, no native modules).
 * Data persists in /tmp on Vercel (survives warm instances).
 *
 * Endpoints:
 *   POST /api/v3/render         — Main: validates license, renders all sections
 *   GET  /api/remote-content    — Returns CSS/HTML/JS patches per domain
 *   GET  /api/loader/v3/scaled-loader.js — Serves the loader script
 *   GET  /api/health            — Health check
 *   Admin routes under /api/admin/*
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// ─── Vercel KV (persistent tickets storage) ─────────────────────
// Falls back gracefully if KV env vars not set (local dev)
let kv = null;
const KV_ENABLED = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
if (KV_ENABLED) {
  try { kv = require('@vercel/kv').kv; } catch(e) { console.log('[KV] package not found, using file fallback'); }
}

async function kvGetTickets() {
  if (kv) { try { return (await kv.get('vexel_tickets')) || []; } catch(e) {} }
  return store.tickets || [];
}
async function kvSaveTickets(tickets) {
  if (kv) { try { await kv.set('vexel_tickets', tickets); return; } catch(e) {} }
  store.tickets = tickets;
  saveStore();
}

const app = express();
const PORT = process.env.PORT || 3000;

// ─── JSON Store (Vercel-compatible) ─────────────────────────────
// Persists to /tmp on Vercel, or ./data locally
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {}

let store = { licenses: [], request_log: [], remote_content: [], tickets: [], _nextId: 1 };

function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      store = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch(e) { console.log('[Store] Fresh start — no saved data'); }
}

function saveStore() {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2)); } catch(e) {}
}

loadStore();

// Migrate old stores that don't have tickets array
if (!store.tickets) { store.tickets = []; saveStore(); }

// ─── Seed "og" universal license if it doesn't exist ────────────
if (!store.licenses.find(l => l.license_key === 'og')) {
  store.licenses.push({
    id: store._nextId++,
    license_key: 'og',
    domain: '*',
    permanent_domain: '*',
    plan: 'unlimited',
    active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
    notes: 'Universal owner license — works on all stores'
  });
  saveStore();
  console.log('[Scaled] Seeded universal "og" license');
}

// ─── Middleware ──────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => { callback(null, true); },
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key'],
}));

app.use(express.json({ limit: '1mb' }));

// ─── Serve Next.js static site from /site ───────────────────────
const siteDir = path.join(__dirname, 'site');

// Next.js exports e.g. /theme as theme.html but also creates a /theme directory for subpages.
// Express static favors directories, causing 404s when it looks for /theme/index.html.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path === '/') return next(); // Let static handle index.html

  const cleanPath = req.path.replace(/\/$/, ''); // Remove trailing slash
  const htmlPath = path.join(siteDir, cleanPath + '.html');
  
  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }
  next();
});

app.use(express.static(siteDir, { extensions: ['html'] }));


// /admin is handled by Next.js static export (site/admin.html)


// Rate limiting
const rateLimiter = {};
function rateLimit(ip, maxPerMinute = 60) {
  const now = Date.now();
  if (!rateLimiter[ip]) rateLimiter[ip] = [];
  rateLimiter[ip] = rateLimiter[ip].filter(t => now - t < 60000);
  if (rateLimiter[ip].length >= maxPerMinute) return false;
  rateLimiter[ip].push(now);
  return true;
}

// ─── License Helpers ────────────────────────────────────────────
function generateLicenseKey() {
  // Generate 3 random segments
  const segments = [];
  for (let i = 0; i < 3; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  // 4th segment = checksum of first 3 + secret salt
  const checksum = vxChecksum(segments[0], segments[1], segments[2]);
  segments.push(checksum);
  return segments.join('-');
}

// Checksum function — must match the one in theme.js
function vxChecksum(a, b, c) {
  const combined = a + b + c + 'VXL9';
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    hash = hash & 0xFFFF;
  }
  return hash.toString(16).toUpperCase().padStart(4, '0');
}

function validateLicense(licenseKey, domain) {
  const license = store.licenses.find(l => l.license_key === licenseKey && l.active);
  if (!license) return { valid: false, reason: 'invalid_key' };
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return { valid: false, reason: 'expired' };
  }

  const norm = d => (d || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
  
  // Auto-bind wildcard keys to the first domain that uses them
  if (license.domain === '*') {
    if (domain && norm(domain) !== '') {
      license.domain = norm(domain);
      license.permanent_domain = norm(domain);
      // It passes validation and locks to this domain
    } else {
      // If no domain was provided in the request, still allow but don't bind yet
    }
  } else {
    const normalizedDomain = norm(domain);
    const licenseDomain = norm(license.domain);
    const permanentDomain = norm(license.permanent_domain);

    if (normalizedDomain !== licenseDomain && normalizedDomain !== permanentDomain) {
      return { valid: false, reason: 'domain_mismatch', expected: licenseDomain };
    }
  }

  license.last_verified_at = new Date().toISOString();
  license.request_count = (license.request_count || 0) + 1;
  saveStore();
  return { valid: true, license };
}

function logRequest(licenseKey, domain, ip, userAgent, status) {
  store.request_log.unshift({
    id: store._nextId++,
    license_key: licenseKey,
    domain: domain,
    ip: ip,
    user_agent: userAgent,
    status: status,
    created_at: new Date().toISOString()
  });
  // Keep last 1000 logs
  if (store.request_log.length > 1000) store.request_log = store.request_log.slice(0, 1000);
  saveStore();
}

// ─── Section Renderers ──────────────────────────────────────────
const renderers = {};

renderers['header-minimal'] = function(settings, products, colors, cfg) {
  const logo = settings.logo || cfg.logoUrl || '';
  const links = [];
  for (let i = 1; i <= 6; i++) {
    const text = settings['nav_link_' + i + '_text'];
    const url = settings['nav_link_' + i + '_url'];
    if (text) links.push({ text, url: url || '#' });
  }

  return `<div class="header-pill-wrapper">
  <div class="header-pill">
    <button class="header-icon-btn" id="menu-toggle" aria-label="Menu">
      <svg class="menu-toggle-icon" id="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <div class="header-brand">
      <a href="/">${logo ? `<img src="${logo}" alt="${cfg.brandName || ''}" style="height:28px;width:auto;">` : escapeHtml(cfg.brandName || 'STORE')}</a>
    </div>
    <a href="/cart" class="header-icon-btn" aria-label="Cart" style="position:relative;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
      <span class="cart-count-badge" id="cart-count-badge">0</span>
    </a>
  </div>
  <div class="header-dropdown" id="header-dropdown">
    <nav><ul>${links.map(l => `<li><a href="${escapeHtml(l.url)}">${escapeHtml(l.text)}</a></li>`).join('')}</ul></nav>
  </div>
</div>
<script>
(function(){
  var toggle=document.getElementById('menu-toggle'),dropdown=document.getElementById('header-dropdown'),icon=document.getElementById('menu-icon'),isOpen=false;
  function toggleMenu(){isOpen=!isOpen;if(dropdown)dropdown.classList.toggle('open',isOpen);if(icon)icon.classList.toggle('active',isOpen);}
  if(toggle)toggle.addEventListener('click',toggleMenu);
  document.addEventListener('click',function(e){if(isOpen&&!e.target.closest('.header-pill-wrapper')){isOpen=false;if(dropdown)dropdown.classList.remove('open');if(icon)icon.classList.remove('active');}});
  fetch('/cart.js').then(function(r){return r.json()}).then(function(c){var b=document.getElementById('cart-count-badge');if(b&&c.item_count>0){b.textContent=c.item_count;b.classList.add('has-items');}}).catch(function(){});
})();
</script>`;
};

renderers['urgency'] = function(settings, products, colors) {
  const accent = colors.accent1 || '#39ff14';
  const viewers = Math.floor(Math.random() * 30) + 20;

  return `<div class="urgency-bar" style="background:var(--color-bg);border-bottom:1px solid var(--color-border);overflow:hidden;white-space:nowrap;">
  <div class="urgency-track" style="display:flex;animation:urgencyScroll 30s linear infinite;">
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span class="urgency-dot" style="width:6px;height:6px;border-radius:50%;background:#22c55e;animation:urgencyPulse 2s infinite;"></span>
      <strong style="color:${accent}">${viewers}</strong> people viewing right now
    </div>
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span style="color:${accent}">★</span> Rated 4.96/5 by 2,400+ customers
    </div>
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span style="color:${accent}">✓</span> Fully verified suppliers
    </div>
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span style="color:${accent}">🔒</span> Private suppliers not found anywhere else
    </div>
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span class="urgency-dot" style="width:6px;height:6px;border-radius:50%;background:#22c55e;animation:urgencyPulse 2s infinite;"></span>
      <strong style="color:${accent}">${viewers}</strong> people viewing right now
    </div>
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span style="color:${accent}">★</span> Rated 4.96/5 by 2,400+ customers
    </div>
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span style="color:${accent}">✓</span> Fully verified suppliers
    </div>
    <div class="urgency-item" style="display:inline-flex;align-items:center;gap:6px;padding:8px 24px;font-size:13px;color:var(--color-text);">
      <span style="color:${accent}">🔒</span> Private suppliers not found anywhere else
    </div>
  </div>
</div>`;
};

renderers['product-grid'] = function(settings, products, colors, cfg) {
  if (!products || !products.length) return '<p style="text-align:center;color:var(--color-text-muted);padding:40px;">No products found.</p>';

  const accent = colors.accent1 || '#39ff14';
  const headline = settings.hero_headline || '';
  const highlightWord = settings.highlight_word || '';
  const heroImage = settings.hero_image || '';
  const cols = settings.products_per_row || 4;
  const btnText = settings.primary_button_text || 'buy now';
  const btnAction = settings.primary_button_action || 'checkout';
  const badgeText = settings.sale_badge_text || 'SALE';

  let heroHtml = '';
  if (headline) {
    let displayHeadline = headline;
    if (highlightWord) {
      displayHeadline = headline.replace(
        new RegExp('(' + highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'),
        `<span style="color:${accent}">$1</span>`
      );
    }
    heroHtml = `<div style="text-align:center;padding:0 16px 32px;">
      <h1 style="font-family:var(--font-heading);font-size:clamp(2rem,6vw,3.5rem);font-weight:400;text-transform:uppercase;letter-spacing:-1px;line-height:1.1;color:var(--color-text);margin:0;">${displayHeadline}</h1>
      ${heroImage ? `<img src="${heroImage}" alt="" style="display:block;max-width:450px;width:100%;height:auto;margin:24px auto 0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.5);">` : ''}
    </div>`;
  }

  const formatPrice = (cents) => '$' + (cents / 100).toFixed(2);

  const cardsHtml = products.map(p => {
    const hasCompare = p.comparePrice && p.comparePrice > p.price;
    let btnHtml;
    if (btnAction === 'checkout') {
      btnHtml = `<button class="btn-buy" onclick="(function(){fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:${p.variantId},quantity:1}]})}).then(function(){window.location.href='/checkout'}).catch(function(e){console.error(e)})})()">${escapeHtml(btnText.toUpperCase())}</button>`;
    } else if (btnAction === 'add_to_cart') {
      btnHtml = `<button class="btn-buy" onclick="window.ScaledCart&&window.ScaledCart.add(${p.variantId})">${escapeHtml(btnText.toUpperCase())}</button>`;
    } else {
      btnHtml = `<a href="${escapeHtml(p.url)}" class="btn-buy">${escapeHtml(btnText.toUpperCase())}</a>`;
    }

    return `<div class="product-card">
      <div class="product-card-inner">
        <a href="${escapeHtml(p.url)}" class="product-card-image">
          ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.imageAlt || p.title)}" loading="lazy" width="500" height="500">` : ''}
          ${hasCompare ? `<span class="product-card-badge">${escapeHtml(badgeText)}</span>` : ''}
        </a>
        <div class="product-card-info">
          <h3 class="product-card-title"><a href="${escapeHtml(p.url)}">${escapeHtml(p.title)}</a></h3>
          <div class="product-card-prices">
            <span class="price-sale">${formatPrice(p.price)}</span>
            ${hasCompare ? `<span class="price-compare">${formatPrice(p.comparePrice)}</span>` : ''}
          </div>
          <div class="product-card-actions">
            <button class="btn-cart-icon" onclick="(function(btn){fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:${p.variantId},quantity:1}]})}).then(function(){btn.classList.add('in-cart');btn.querySelector('.icon-cart').style.display='none';btn.querySelector('.icon-check').style.display='block';if(window.ScaledCart)window.ScaledCart.get().then(function(c){var b=document.getElementById('cart-count-badge');if(b){b.textContent=c.item_count;b.classList.toggle('has-items',c.item_count>0);}})}).catch(function(e){console.error(e)})})(this)" aria-label="Add to cart">
              <svg class="icon-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            ${btnHtml}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="product-grid-section"${settings.show_background_gradient ? ` style="position:relative;overflow:hidden;"` : ''}>
    ${settings.show_background_gradient ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 1200px 800px at 10% 15%,rgba(57,255,20,0.15) 0%,transparent 60%),radial-gradient(ellipse 1000px 700px at 80% 25%,rgba(57,255,20,0.12) 0%,transparent 65%),radial-gradient(ellipse 1400px 900px at 90% 85%,rgba(57,255,20,0.15) 0%,transparent 70%);pointer-events:none;z-index:0;"></div>` : ''}
    <div style="position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:20px 20px 60px;">
      ${heroHtml}
      <div class="product-grid" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px;">
        ${cardsHtml}
      </div>
    </div>
  </div>`;
};

renderers['testimonials'] = function(settings) {
  const images = settings.images || [];
  if (!images.length) return '';
  const headline = settings.headline || 'What Our Customers Say';
  const speed = settings.animationSpeed || 20;
  const imgHeight = settings.imageHeight || 250;
  const allImages = [...images, ...images];
  const imgsHtml = allImages.map(img =>
    `<img src="${img.url}" alt="${escapeHtml(img.alt || '')}" style="height:${imgHeight}px;width:auto;border-radius:12px;object-fit:cover;flex-shrink:0;" loading="lazy">`
  ).join('');

  return `<div style="padding:60px 0;overflow:hidden;">
    <h2 style="text-align:center;font-family:var(--font-heading);font-size:clamp(24px,4vw,36px);text-transform:uppercase;letter-spacing:-0.5px;margin-bottom:32px;color:#fff;">${escapeHtml(headline)}</h2>
    <div style="-webkit-mask:linear-gradient(90deg,transparent,#000 80px,#000 calc(100% - 80px),transparent);mask:linear-gradient(90deg,transparent,#000 80px,#000 calc(100% - 80px),transparent);">
      <div style="display:flex;gap:16px;animation:testimonialScroll ${speed}s linear infinite;">${imgsHtml}</div>
    </div>
  </div>`;
};

renderers['faq'] = function(settings) {
  const heading = settings.heading || 'Frequently Asked Questions';
  const faqs = settings.faqs || [];
  if (!faqs.length) return '';
  const faqsHtml = faqs.map((faq, i) =>
    `<div class="faq-item" id="faq-item-${i}">
      <div class="faq-question" onclick="(function(){var item=document.getElementById('faq-item-${i}');var wasOpen=item.classList.contains('open');document.querySelectorAll('.faq-item.open').forEach(function(i){i.classList.remove('open')});if(!wasOpen)item.classList.add('open');})()">
        <span>${escapeHtml(faq.question)}</span>
        <div class="faq-toggle"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="faq-answer"><p style="color:var(--color-text-muted);font-size:14px;line-height:1.6;">${escapeHtml(faq.answer)}</p></div>
    </div>`
  ).join('');

  return `<div class="faq-section" style="max-width:700px;margin:0 auto;padding:60px 20px;">
    <h2 style="text-align:center;font-family:var(--font-heading);font-size:clamp(24px,4vw,36px);text-transform:uppercase;letter-spacing:-0.5px;margin-bottom:32px;color:#fff;">${escapeHtml(heading)}</h2>
    ${faqsHtml}
  </div>`;
};

renderers['chat'] = function(settings, products, colors) {
  const name = settings.name || 'Support';
  const greeting = settings.greeting || 'Hey! How can I help?';
  const accent = colors.accent1 || '#39ff14';

  return `<div class="chat-fab" id="chat-fab" onclick="document.getElementById('chat-window').classList.toggle('open')" style="position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:${accent};color:#000;display:flex;align-items:center;justify-content:center;z-index:998;box-shadow:0 4px 20px ${accent}66;cursor:pointer;">
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  ${settings.showPulse ? `<span style="position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:${accent};animation:chatPulse 2s infinite;"></span>` : ''}
</div>
<div class="chat-window" id="chat-window" style="position:fixed;bottom:96px;right:24px;width:380px;max-height:500px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:16px;z-index:999;display:none;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
  <div style="padding:16px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:32px;height:32px;border-radius:50%;background:${accent};color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">${name.charAt(0).toUpperCase()}</div>
      <div><div style="font-weight:600;font-size:14px;">${escapeHtml(name)}</div><div style="font-size:11px;color:var(--color-text-muted);">Online</div></div>
    </div>
    <button onclick="document.getElementById('chat-window').classList.remove('open')" style="color:var(--color-text-muted);font-size:20px;background:none;border:none;cursor:pointer;">&times;</button>
  </div>
  <div style="flex:1;padding:16px;overflow-y:auto;min-height:200px;" id="chat-messages">
    <div style="background:var(--color-bg-elevated,#1a1a1a);border-radius:12px 12px 12px 4px;padding:10px 14px;max-width:85%;font-size:14px;color:var(--color-text);margin-bottom:8px;">${escapeHtml(greeting)}</div>
  </div>
  <div style="padding:12px;border-top:1px solid var(--color-border);display:flex;gap:8px;">
    <input type="text" id="chat-input" placeholder="Ask me anything..." style="flex:1;background:var(--color-bg-elevated,#1a1a1a);border:1px solid var(--color-border);border-radius:8px;padding:10px 12px;color:var(--color-text);font-size:14px;outline:none;" onkeydown="if(event.key==='Enter')document.getElementById('chat-send').click()">
    <button id="chat-send" style="background:${accent};color:#000;border:none;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;" onclick="(function(){var i=document.getElementById('chat-input'),m=document.getElementById('chat-messages');if(!i.value.trim())return;var d=document.createElement('div');d.style.cssText='background:${accent};color:#000;border-radius:12px 12px 4px 12px;padding:10px 14px;max-width:85%;font-size:14px;margin-left:auto;margin-bottom:8px;font-weight:500;';d.textContent=i.value;m.appendChild(d);i.value='';m.scrollTop=m.scrollHeight;setTimeout(function(){var r=document.createElement('div');r.style.cssText='background:var(--color-bg-elevated,#1a1a1a);border-radius:12px 12px 12px 4px;padding:10px 14px;max-width:85%;font-size:14px;color:var(--color-text);margin-bottom:8px;';r.textContent='Thanks for your message! We will get back to you soon.';m.appendChild(r);m.scrollTop=m.scrollHeight;},1000);})()">Send</button>
  </div>
</div>`;
};

renderers['reviews'] = function(settings, products, colors) {
  const title = settings.title || 'Customer Reviews';
  const subtitle = settings.subtitle || '';
  const accent = colors.accent1 || '#39ff14';
  const names = ['Alex M.', 'Sarah K.', 'Mike R.', 'Jordan T.', 'Emily W.', 'Chris B.'];
  const texts = [
    'Best vendor list I\'ve ever purchased. Made my money back in the first week!',
    'Incredible value. The suppliers are legit and the prices are unbeatable.',
    'Was skeptical at first but these vendors are 100% real. Already made sales!',
    'The quality of suppliers is amazing. Highly recommend to anyone starting out.',
    'Great customer service and the vendor list exceeded my expectations.',
    'This is exactly what I needed to start my reselling journey. Thank you!'
  ];
  const reviewsHtml = names.map((name, i) =>
    `<div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:12px;padding:20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${accent};color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">${name.charAt(0)}</div>
        <div><div style="font-weight:600;font-size:14px;">${escapeHtml(name)}</div><div style="font-size:12px;color:var(--color-text-muted);">${i + 1} week${i > 0 ? 's' : ''} ago</div></div>
      </div>
      <div style="color:#fbbf24;margin-bottom:8px;">★★★★★</div>
      <p style="font-size:14px;color:var(--color-text-muted);line-height:1.5;">${escapeHtml(texts[i])}</p>
    </div>`
  ).join('');

  return `<div style="max-width:1200px;margin:0 auto;padding:60px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="font-family:var(--font-heading);font-size:clamp(24px,4vw,36px);text-transform:uppercase;letter-spacing:-0.5px;color:#fff;margin-bottom:8px;">${escapeHtml(title)}</h2>
      ${subtitle ? `<p style="color:var(--color-text-muted);font-size:15px;">${escapeHtml(subtitle)}</p>` : ''}
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;">
        <span style="color:#fbbf24;font-size:20px;">★★★★★</span>
        <span style="color:var(--color-text);font-weight:600;">4.9</span>
        <span style="color:var(--color-text-muted);font-size:14px;">(${names.length} reviews)</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">${reviewsHtml}</div>
  </div>`;
};

renderers['live-sales'] = function(settings, products, colors) {
  if (!settings.enabled || !products || !products.length) return '';
  const nameColor = settings.name_color || '#cc3d3d';
  const duration = (settings.display_duration || 7) * 1000;
  const minDelay = (settings.min_delay || 8) * 1000;
  const maxDelay = (settings.max_delay || 20) * 1000;
  const initialDelay = (settings.initial_delay || 5) * 1000;
  const position = settings.position || 'bottom-left';
  const isLeft = position === 'bottom-left';
  const productsJson = JSON.stringify(products);
  const namesJson = JSON.stringify(['Alex','Jordan','Sarah','Mike','Emily','Chris','Taylor','Sam','Morgan','Casey']);

  return `<div class="live-sales-toast" id="live-sales-toast" style="position:fixed;bottom:24px;${isLeft ? 'left' : 'right'}:24px;max-width:340px;background:rgba(99,99,99,0.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:14px 18px;z-index:997;transform:translateX(${isLeft ? '-120%' : '120%'});transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1);font-size:14px;color:#fff;">
  <span id="live-sales-text"></span>
</div>
<script>
(function(){var products=${productsJson};var names=${namesJson};var toast=document.getElementById('live-sales-toast');var text=document.getElementById('live-sales-text');if(!toast||!products.length)return;function show(){var name=names[Math.floor(Math.random()*names.length)];var product=products[Math.floor(Math.random()*products.length)];text.innerHTML='<strong style="color:${nameColor}">'+name+'</strong> just purchased <strong>'+product+'</strong>';toast.style.transform='translateX(0)';setTimeout(function(){toast.style.transform='translateX(${isLeft ? '-120%' : '120%'})';},${duration});}setTimeout(function(){show();setInterval(show,${Math.round((minDelay + maxDelay) / 2)});},${initialDelay});})();
</script>`;
};

renderers['footer'] = function(settings, products, colors) {
  const brandName = settings.brandName || settings.shopName || '';
  const accent = settings.accentColor || colors.accent1 || '#39ff14';
  const year = settings.year || new Date().getFullYear();
  const socialLinks = [];
  if (settings.instagramUrl) socialLinks.push({ name: 'Instagram', url: settings.instagramUrl });
  if (settings.tiktokUrl) socialLinks.push({ name: 'TikTok', url: settings.tiktokUrl });
  if (settings.discordUrl) socialLinks.push({ name: 'Discord', url: settings.discordUrl });

  return `<div style="border-top:1px solid var(--color-border);padding:40px 20px;text-align:center;">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="font-family:var(--font-heading);font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">${escapeHtml(brandName)}</div>
      ${socialLinks.length ? `<div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">${socialLinks.map(l => `<a href="${escapeHtml(l.url)}" style="color:var(--color-text-muted);font-size:13px;" target="_blank" rel="noopener">${escapeHtml(l.name)}</a>`).join('')}</div>` : ''}
      <p style="font-size:12px;color:var(--color-text-subtle);">&copy; ${year} ${escapeHtml(brandName)}. All rights reserved.</p>
    </div>
  </div>`;
};

// ─── Helper ─────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── Critical CSS ───────────────────────────────────────────────
function getCriticalCSS() {
  return `
.header-pill-wrapper{position:fixed;top:var(--header-top,16px);left:0;right:0;z-index:999;display:flex;flex-direction:column;align-items:center;padding:0 20px;background:transparent;pointer-events:none;transition:top 0.25s ease-out}
.header-pill{display:flex;align-items:center;justify-content:space-between;max-width:95vw;background:rgba(0,0,0,0.85);border:1px solid rgba(42,42,42,0.8);border-radius:999px;padding:6px;pointer-events:all;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.header-icon-btn{width:40px;height:40px;border-radius:50%;background:rgba(26,26,26,0.9);border:1px solid rgba(42,42,42,0.8);display:flex;align-items:center;justify-content:center;color:#fff;transition:background 0.2s,border-color 0.2s;flex-shrink:0}
.header-icon-btn:hover{background:rgba(42,42,42,0.9);border-color:#444}
.header-icon-btn svg{width:18px;height:18px}
.header-brand{font-family:var(--font-heading);font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#fff;white-space:nowrap;padding:0 12px}
.header-brand a{color:inherit;display:flex;align-items:center}
.header-brand img{height:28px;width:auto}
.cart-count-badge{position:absolute;top:-4px;right:-4px;background:var(--color-accent);color:#000;font-size:10px;font-weight:800;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;padding:0 4px}
.cart-count-badge.has-items{display:flex}
.header-dropdown{max-width:95vw;background:rgba(10,10,10,0.95);border:1px solid rgba(42,42,42,0.8);border-radius:16px;margin-top:8px;padding:8px 0;pointer-events:all;opacity:0;visibility:hidden;transform:translateY(-8px);transition:opacity 0.25s,transform 0.25s,visibility 0.25s}
.header-dropdown.open{opacity:1;visibility:visible;transform:translateY(0)}
.header-dropdown nav ul{list-style:none}
.header-dropdown nav a{display:block;padding:14px 20px;font-family:var(--font-heading);font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff;transition:color 0.2s;text-align:center}
.header-dropdown nav a:hover{color:var(--color-accent)}
.menu-toggle-icon{transition:transform 0.3s}
.menu-toggle-icon.active{transform:rotate(90deg)}
.product-grid-section{position:relative;overflow:hidden}
.product-card{background:rgba(17,17,17,0.95);border:1px solid rgba(42,42,42,0.8);border-radius:var(--radius-md,12px);overflow:hidden;transition:transform 0.3s,border-color 0.3s,box-shadow 0.3s;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.03),inset 1.8px 3px 0 -2px rgba(255,255,255,0.15),0 2px 8px rgba(0,0,0,0.4)}
.product-card:hover{transform:translateY(-3px);border-color:var(--color-accent);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06),0 8px 32px rgba(57,255,20,0.15)}
.product-card-inner{border-radius:calc(var(--radius-md,12px) - 1px);overflow:hidden}
.product-card-image{position:relative;aspect-ratio:1;background:rgba(10,10,10,0.9);overflow:hidden;display:block;cursor:pointer}
.product-card-image img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s}
.product-card:hover .product-card-image img{transform:scale(1.03)}
.product-card-badge{position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.5);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;padding:4px 12px;border-radius:999px;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);z-index:2}
.product-card-info{padding:14px}
.product-card-title{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.02em;color:#fff;margin-bottom:8px;line-height:1.3}
.product-card-title a{color:inherit}
.product-card-prices{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.price-sale{color:var(--color-accent);font-weight:800;font-size:16px}
.price-compare{color:rgba(107,114,128,0.9);text-decoration:line-through;font-size:14px}
.product-card-actions{display:flex;gap:8px}
.btn-cart-icon{width:44px;height:44px;border-radius:var(--radius-sm,8px);background:rgba(26,26,26,0.9);border:1px solid rgba(42,42,42,0.8);display:flex;align-items:center;justify-content:center;color:#fff;transition:background 0.2s,border-color 0.2s;flex-shrink:0;cursor:pointer}
.btn-cart-icon:hover{border-color:#fff}
.btn-cart-icon.in-cart{background:rgba(34,197,94,0.9);border-color:rgba(34,197,94,0.9)}
.btn-cart-icon svg{width:18px;height:18px}
.btn-buy{flex:1;height:44px;border-radius:28px;background:var(--color-accent);color:#1a1a1a;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;display:flex;align-items:center;justify-content:center;border:none;box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 2px 12px rgba(57,255,20,0.35);transition:box-shadow 0.3s,transform 0.2s;cursor:pointer}
.btn-buy:hover{box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 4px 24px rgba(57,255,20,0.55);transform:translateY(-1px)}
@keyframes urgencyScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes urgencyPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
@keyframes testimonialScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.faq-item{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:12px;margin-bottom:12px;overflow:hidden}
.faq-question{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;cursor:pointer;font-weight:600;font-size:15px;color:var(--color-text)}
.faq-toggle{width:30px;height:30px;border-radius:50%;background:var(--color-accent);color:#000;display:flex;align-items:center;justify-content:center;transition:transform 0.3s}
.faq-item.open .faq-toggle{transform:rotate(180deg)}
.faq-answer{max-height:0;overflow:hidden;transition:max-height 0.4s ease,padding 0.4s ease}
.faq-item.open .faq-answer{max-height:500px;padding:0 20px 18px}
.chat-window.open{display:flex!important}
@keyframes chatPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.85)}}
@media(max-width:768px){.chat-window{position:fixed!important;inset:0!important;width:100%!important;max-height:none!important;border-radius:0!important}.product-grid{grid-template-columns:repeat(2,1fr)!important}}
`;
}

function getKillSwitchCSS() {
  return 'body>*:not([data-scaled-section="footer"]):not(.scaled-license-notice-wrapper):not(footer):not([id*="footer"]):not(#shopify-section-footer){display:none!important}body{background:#000!important}[data-scaled-section]:not([data-scaled-section="footer"]){display:none!important}[data-scaled-section="footer"]{display:block!important}';
}

// ─── API Routes ─────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0.0', timestamp: new Date().toISOString() });
});

// User login with license key
app.post('/api/auth/login', (req, res) => {
  const { licenseKey } = req.body;
  if (!licenseKey) return res.status(400).json({ error: 'License key required' });
  const license = store.licenses.find(l => l.license_key === licenseKey && l.active);
  if (!license) return res.status(401).json({ error: 'Invalid license key' });
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return res.status(401).json({ error: 'License expired' });
  }
  res.json({
    success: true,
    license: {
      key: license.license_key,
      domain: license.domain,
      permanent_domain: license.permanent_domain,
      plan: license.plan,
      active: license.active,
      created_at: license.created_at,
      expires_at: license.expires_at,
      last_verified_at: license.last_verified_at,
      request_count: license.request_count || 0,
      notes: license.notes || '',
      store_name: license.store_name || ''
    }
  });
});

// Check if key is admin
app.post('/api/auth/check-admin', (req, res) => {
  const { adminKey } = req.body;
  res.json({ isAdmin: adminKey === ADMIN_KEY });
});

// Remote content
app.get('/api/remote-content', (req, res) => {
  const domain = req.query.domain;
  if (!domain) return res.json([]);
  const norm = d => (d || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
  const patches = store.remote_content.filter(r => r.active && (norm(r.domain) === norm(domain)));
  res.json(patches.map(p => ({ css: p.css, html: p.html, js: p.js, redirect_url: p.redirect_url })));
});

// V3 Render
app.post('/api/v3/render', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  if (!rateLimit(ip)) return res.status(429).json({ error: 'rate_limited' });

  const { licenseKey, domain, permanentDomain, sections, colors, brandName, logoUrl, chatbot, urgency } = req.body;

  if (!licenseKey || !domain) {
    logRequest(licenseKey || 'none', domain || 'none', ip, userAgent, 'missing_params');
    return res.status(400).json({ error: 'missing_params' });
  }

  let result = validateLicense(licenseKey, domain);
  if (!result.valid && permanentDomain) result = validateLicense(licenseKey, permanentDomain);

  if (!result.valid) {
    logRequest(licenseKey, domain, ip, userAgent, result.reason);

    // Still render the footer even on invalid license
    let footerHtml = '';
    const cfg = { brandName: brandName || '', logoUrl: logoUrl || null, chatbot: chatbot || {}, urgency: urgency || {} };
    if (sections && Array.isArray(sections)) {
      const footerSection = sections.find(s => s.type === 'footer');
      if (footerSection && renderers['footer']) {
        try { footerHtml = renderers['footer'](footerSection.settings || {}, null, colors || {}, cfg); } catch(e) {}
      }
    }

    return res.status(403).json({
      error: result.reason,
      killCSS: getKillSwitchCSS(),
      footerHtml: footerHtml,
      message: result.reason === 'domain_mismatch' ? 'This license is not authorized for this domain.'
        : result.reason === 'expired' ? 'License has expired.' : 'Invalid license key.'
    });
  }

  logRequest(licenseKey, domain, ip, userAgent, 'success');

  const renderedSections = [];
  const cfg = { brandName: brandName || '', logoUrl: logoUrl || null, chatbot: chatbot || {}, urgency: urgency || {} };

  if (sections && Array.isArray(sections)) {
    for (const section of sections) {
      const renderer = renderers[section.type];
      if (renderer) {
        try {
          const html = renderer(section.settings || {}, section.products || null, colors || {}, cfg);
          renderedSections.push({ type: section.type, elementId: section.elementId, html });
        } catch (e) {
          renderedSections.push({ type: section.type, elementId: section.elementId, html: '' });
        }
      }
    }
  }

  res.json({ status: 'ok', css: getCriticalCSS(), js: '', sections: renderedSections, version: '3.0.0', plan: result.license.plan });
});

// Legacy V1
app.post('/api/v1/load', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  if (!rateLimit(ip)) return res.status(429).json({ error: 'rate_limited' });
  const { licenseKey, domain, permanentDomain } = req.body;
  if (!licenseKey || !domain) return res.status(400).json({ error: 'missing_params' });
  let result = validateLicense(licenseKey, domain);
  if (!result.valid && permanentDomain) result = validateLicense(licenseKey, permanentDomain);
  if (!result.valid) return res.status(403).json({ error: result.reason, killCSS: getKillSwitchCSS() });
  res.json({ status: 'ok', css: getCriticalCSS(), js: '', version: '3.0.0', plan: result.license.plan });
});

// Loader
app.get('/api/loader/v3/scaled-loader.js', (req, res) => {
  const srcPath = path.join(__dirname, 'src', 'loader.js');
  const distPath = path.join(__dirname, 'dist', 'scaled-loader.js');
  res.setHeader('Content-Type', 'application/javascript');
  if (fs.existsSync(distPath)) { res.setHeader('Cache-Control', 'public, max-age=3600'); res.sendFile(distPath); }
  else if (fs.existsSync(srcPath)) { res.setHeader('Cache-Control', 'no-cache'); res.sendFile(srcPath); }
  else res.status(404).send('// Loader not found');
});
app.get('/api/loader/scaled-loader.js', (req, res) => res.redirect(301, '/api/loader/v3/scaled-loader.js'));

// ─── Support Tickets ────────────────────────────────────────────

// Public: submit a support ticket
app.post('/api/support/ticket', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'name, email, and message are required' });
  if (typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ error: 'invalid email' });
  if (message.length > 5000) return res.status(400).json({ error: 'message too long' });
  const ticket = {
    id: Date.now(),
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 200),
    message: message.trim().slice(0, 5000),
    status: 'open',
    read: false,
    replies: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const tickets = await kvGetTickets();
  tickets.push(ticket);
  await kvSaveTickets(tickets);
  res.json({ success: true, ticket_id: ticket.id, message: 'Ticket submitted successfully' });
});

// ─── Admin Routes ───────────────────────────────────────────────
const ADMIN_KEY = process.env.ADMIN_KEY || 'og';

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}

app.post('/api/admin/licenses', requireAdmin, (req, res) => {
  const { username, domain, permanent_domain, store_name, plan, expires_at } = req.body;
  if (!domain) return res.status(400).json({ error: 'domain is required' });
  const licenseKey = generateLicenseKey();
  const license = {
    id: store._nextId++,
    license_key: licenseKey,
    username: username || '',
    domain,
    permanent_domain: permanent_domain || '',
    store_name: store_name || '',
    plan: plan || 'standard',
    active: 1,
    created_at: new Date().toISOString(),
    expires_at: expires_at || null,
    last_verified_at: null,
    request_count: 0
  };
  store.licenses.push(license);
  saveStore();
  res.json({ license_key: licenseKey, domain, plan: plan || 'standard', message: 'License created successfully' });
});

app.get('/api/admin/licenses', requireAdmin, (req, res) => {
  res.json({ licenses: store.licenses.slice().reverse() });
});

app.delete('/api/admin/licenses/:key', requireAdmin, (req, res) => {
  const license = store.licenses.find(l => l.license_key === req.params.key);
  if (license) { license.active = 0; saveStore(); res.json({ message: 'License revoked' }); }
  else res.status(404).json({ error: 'License not found' });
});

app.get('/api/admin/logs', requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  res.json({ logs: store.request_log.slice(0, limit) });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const totalLicenses = store.licenses.length;
  const activeLicenses = store.licenses.filter(l => l.active).length;
  const todayRequests = store.request_log.filter(l => l.created_at && l.created_at.startsWith(today)).length;
  const failedToday = store.request_log.filter(l => l.created_at && l.created_at.startsWith(today) && l.status !== 'success').length;
  res.json({ licenses: { total: totalLicenses, active: activeLicenses }, requests: { today: todayRequests, failed_today: failedToday } });
});

// Remote content admin
app.post('/api/admin/remote-content', requireAdmin, (req, res) => {
  const { domain, css, html, js, redirect_url } = req.body;
  if (!domain) return res.status(400).json({ error: 'domain is required' });
  store.remote_content.push({ id: store._nextId++, domain, css: css||null, html: html||null, js: js||null, redirect_url: redirect_url||null, active: 1, created_at: new Date().toISOString() });
  saveStore();
  res.json({ message: 'Remote content added' });
});

app.get('/api/admin/remote-content', requireAdmin, (req, res) => {
  res.json({ content: store.remote_content });
});

app.delete('/api/admin/remote-content/:id', requireAdmin, (req, res) => {
  store.remote_content = store.remote_content.filter(r => r.id !== parseInt(req.params.id));
  saveStore();
  res.json({ message: 'Remote content deleted' });
});

// Admin: tickets
app.get('/api/admin/tickets', requireAdmin, async (req, res) => {
  const tickets = await kvGetTickets();
  const unread = tickets.filter(t => !t.read).length;
  res.json({ tickets: tickets.slice().reverse(), unread });
});

app.put('/api/admin/tickets/:id', requireAdmin, async (req, res) => {
  const tickets = await kvGetTickets();
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { status, read } = req.body;
  if (status && ['open', 'in-progress', 'closed'].includes(status)) ticket.status = status;
  if (typeof read === 'boolean') ticket.read = read;
  ticket.updated_at = new Date().toISOString();
  await kvSaveTickets(tickets);
  res.json({ ticket });
});

app.post('/api/admin/tickets/:id/reply', requireAdmin, async (req, res) => {
  const tickets = await kvGetTickets();
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'reply message is required' });
  const reply = {
    id: Date.now(),
    message: message.trim().slice(0, 5000),
    sent_at: new Date().toISOString(),
  };
  ticket.replies.push(reply);
  if (ticket.status === 'open') ticket.status = 'in-progress';
  ticket.updated_at = new Date().toISOString();
  await kvSaveTickets(tickets);
  // TODO: wire up Resend email when API key is set
  res.json({ success: true, reply });
});

app.get('/api/admin/tickets/unread-count', requireAdmin, async (req, res) => {
  const tickets = await kvGetTickets();
  res.json({ unread: tickets.filter(t => !t.read).length });
});

// Theme ZIP download
app.get('/api/admin/download-theme', requireAdmin, (req, res) => {
  try {
    const archiver = require('archiver');
    const themePath = path.join(__dirname, 'theme-dist');
    if (!fs.existsSync(themePath)) return res.status(404).json({ error: 'Theme files not found' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="scaled-theme-v3.zip"');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => res.status(500).json({ error: err.message }));
    archive.pipe(res);
    archive.directory(themePath, false);
    archive.finalize();
  } catch(e) {
    res.status(500).json({ error: 'archiver not installed — run npm install' });
  }
});

// ─── Fallback 404 ────────────────────────────────────────────────
app.use((req, res) => {
  if (req.method === 'GET') {
    const notFoundPath = path.join(siteDir, '404.html');
    if (fs.existsSync(notFoundPath)) {
      return res.status(404).sendFile(notFoundPath);
    }
  }
  res.status(404).json({ error: 'not_found' });
});

// ─── Start Server ───────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Scaled] Theme protection server v3 running on port ${PORT}`);
    console.log(`[Scaled] Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`[Scaled] Admin key: ${ADMIN_KEY === 'change-me-in-production' ? '⚠️  USING DEFAULT KEY' : '✓ Custom key set'}`);
  });
}

module.exports = app;
