const escapeHtml = require('../utils/escapeHtml');

module.exports = function(settings) {
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
