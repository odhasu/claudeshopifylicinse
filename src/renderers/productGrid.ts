import escapeHtml from '../utils/escapeHtml';
import type { RendererConfig } from '../types';

interface Product {
  variantId: number;
  url: string;
  image?: string;
  imageAlt?: string;
  title: string;
  price: number;
  comparePrice?: number;
}

export default function productGrid(settings: Record<string, unknown>, products: unknown[] | null, colors: Record<string, string>, _cfg: RendererConfig): string {
  const typedProducts = products as Product[] | null;
  if (!typedProducts || !typedProducts.length) return '<p style="text-align:center;color:var(--color-text-muted);padding:40px;">No products found.</p>';

  const accent = colors.accent1 || '#39ff14';
  const headline = (settings.hero_headline as string) || '';
  const highlightWord = (settings.highlight_word as string) || '';
  const heroImage = (settings.hero_image as string) || '';
  const cols = (settings.products_per_row as number) || 4;
  const btnText = (settings.primary_button_text as string) || 'buy now';
  const btnAction = (settings.primary_button_action as string) || 'checkout';
  const badgeText = (settings.sale_badge_text as string) || 'SALE';

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

  const formatPrice = (cents: number): string => '$' + (cents / 100).toFixed(2);

  const cardsHtml = typedProducts.map(p => {
    const hasCompare = p.comparePrice && p.comparePrice > p.price;
    let btnHtml: string;
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
            ${hasCompare ? `<span class="price-compare">${formatPrice(p.comparePrice!)}</span>` : ''}
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
}
