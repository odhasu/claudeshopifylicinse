import escapeHtml from '../utils/escapeHtml';

export default function reviews(settings: Record<string, unknown>, _products: unknown[] | null, colors: Record<string, string>): string {
  const title = (settings.title as string) || 'Customer Reviews';
  const subtitle = (settings.subtitle as string) || '';
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
}
