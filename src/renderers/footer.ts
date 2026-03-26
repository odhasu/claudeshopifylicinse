import escapeHtml from '../utils/escapeHtml';

export default function footer(settings: Record<string, unknown>, _products: unknown[] | null, colors: Record<string, string>): string {
  const brandName = (settings.brandName as string) || (settings.shopName as string) || '';
  const accent = (settings.accentColor as string) || colors.accent1 || '#39ff14';
  const year = (settings.year as number) || new Date().getFullYear();
  const socialLinks: { name: string; url: string }[] = [];
  if (settings.instagramUrl) socialLinks.push({ name: 'Instagram', url: settings.instagramUrl as string });
  if (settings.tiktokUrl) socialLinks.push({ name: 'TikTok', url: settings.tiktokUrl as string });
  if (settings.discordUrl) socialLinks.push({ name: 'Discord', url: settings.discordUrl as string });

  return `<div style="border-top:1px solid var(--color-border);padding:40px 20px;text-align:center;">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="font-family:var(--font-heading);font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;">${escapeHtml(brandName)}</div>
      ${socialLinks.length ? `<div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">${socialLinks.map(l => `<a href="${escapeHtml(l.url)}" style="color:var(--color-text-muted);font-size:13px;" target="_blank" rel="noopener">${escapeHtml(l.name)}</a>`).join('')}</div>` : ''}
      <p style="font-size:12px;color:var(--color-text-subtle);">&copy; ${year} ${escapeHtml(brandName)}. All rights reserved.</p>
    </div>
  </div>`;
}
