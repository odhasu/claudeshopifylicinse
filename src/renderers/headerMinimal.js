const escapeHtml = require('../utils/escapeHtml');

module.exports = function(settings, products, colors, cfg) {
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
