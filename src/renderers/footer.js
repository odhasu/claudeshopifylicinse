const escapeHtml = require('../utils/escapeHtml');

module.exports = function(settings, products, colors) {
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
