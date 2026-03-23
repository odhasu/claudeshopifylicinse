const fs = require('fs');
const path = require('path');

const script = `
<script>
  (function() {
    function fixBrand() {
      // 1. Replace Logo
      const svgs = document.querySelectorAll('svg[viewBox="0 0 18 18"]');
      for (let i = 0; i < svgs.length; i++) {
        const svg = svgs[i];
        if (svg.getAttribute('data-vxl')) continue;
        svg.style.display = 'none';
        svg.setAttribute('data-vxl', '1');
        
        const img = document.createElement('img');
        img.src = '/logo.png';
        img.style.height = '24px';
        img.style.width = 'auto';
        img.style.marginRight = '8px';
        svg.parentNode.insertBefore(img, svg);
        
        // Hide purple bg if it's the main header logo
        if (svg.parentNode && svg.parentNode.classList && svg.parentNode.classList.contains('bg-primary')) {
           svg.parentNode.style.background = 'transparent';
           img.style.height = '32px';
        }
      }
      
      // 2. Text Replace OGVendors -> Vexel Themes safely
      function walkText(node) {
        if (node.nodeType === 3) {
          if (node.nodeValue && node.nodeValue.includes('OGVendors')) {
            node.nodeValue = node.nodeValue.replace(/OGVendors/g, 'Vexel Themes');
          }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
          for (let i = 0; i < node.childNodes.length; i++) {
            walkText(node.childNodes[i]);
          }
        }
      }
      walkText(document.body);
    }
    
    // Catch hydration and client-side navigations
    setInterval(fixBrand, 50);
  })();
</script></body>`;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (full.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      if (!content.includes('fixBrand()')) {
        content = content.replace('</body>', script);
        fs.writeFileSync(full, content);
        console.log('Patched html:', full);
      }
    }
  }
}

processDir(path.join(__dirname, 'site'));
console.log('Done patching site HTML files.');
