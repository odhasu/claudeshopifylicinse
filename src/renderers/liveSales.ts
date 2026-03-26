export default function liveSales(settings: Record<string, unknown>, products: unknown[] | null, _colors: Record<string, string>): string {
  if (!settings.enabled || !products || !products.length) return '';
  const nameColor = (settings.name_color as string) || '#cc3d3d';
  const duration = ((settings.display_duration as number) || 7) * 1000;
  const minDelay = ((settings.min_delay as number) || 8) * 1000;
  const maxDelay = ((settings.max_delay as number) || 20) * 1000;
  const initialDelay = ((settings.initial_delay as number) || 5) * 1000;
  const position = (settings.position as string) || 'bottom-left';
  const isLeft = position === 'bottom-left';
  const productsJson = JSON.stringify(products);
  const namesJson = JSON.stringify(['Alex','Jordan','Sarah','Mike','Emily','Chris','Taylor','Sam','Morgan','Casey']);

  return `<div class="live-sales-toast" id="live-sales-toast" style="position:fixed;bottom:24px;${isLeft ? 'left' : 'right'}:24px;max-width:340px;background:rgba(99,99,99,0.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:14px 18px;z-index:997;transform:translateX(${isLeft ? '-120%' : '120%'});transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1);font-size:14px;color:#fff;">
  <span id="live-sales-text"></span>
</div>
<script>
(function(){var products=${productsJson};var names=${namesJson};var toast=document.getElementById('live-sales-toast');var text=document.getElementById('live-sales-text');if(!toast||!products.length)return;function show(){var name=names[Math.floor(Math.random()*names.length)];var product=products[Math.floor(Math.random()*products.length)];text.innerHTML='<strong style="color:${nameColor}">'+name+'</strong> just purchased <strong>'+product+'</strong>';toast.style.transform='translateX(0)';setTimeout(function(){toast.style.transform='translateX(${isLeft ? '-120%' : '120%'})';},${duration});}setTimeout(function(){show();setInterval(show,${Math.round((minDelay + maxDelay) / 2)});},${initialDelay});})();
</script>`;
}
