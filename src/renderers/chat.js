const escapeHtml = require('../utils/escapeHtml');

module.exports = function(settings, products, colors) {
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
