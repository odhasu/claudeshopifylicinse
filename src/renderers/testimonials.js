const escapeHtml = require('../utils/escapeHtml');

module.exports = function(settings) {
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
