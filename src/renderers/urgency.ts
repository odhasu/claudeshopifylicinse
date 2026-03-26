export default function urgency(_settings: Record<string, unknown>, _products: unknown[] | null, colors: Record<string, string>): string {
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
}
