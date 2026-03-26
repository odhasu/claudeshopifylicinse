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

module.exports = { getCriticalCSS, getKillSwitchCSS };
