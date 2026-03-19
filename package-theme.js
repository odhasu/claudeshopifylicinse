/**
 * Package Theme — copies shell theme files into theme-dist/ for ZIP download
 *
 * Run this from the server directory:
 *   node package-theme.js
 *
 * It copies the relevant theme files from the parent directory (the Shopify theme)
 * into server/theme-dist/ which the dashboard uses for the Download Theme feature.
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.join(__dirname, '..');
const DIST = path.join(__dirname, 'theme-dist');

// Directories to copy
const DIRS = ['layout', 'sections', 'snippets', 'templates', 'config', 'assets', 'locales'];

// Clean and recreate dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

let fileCount = 0;

for (const dir of DIRS) {
  const srcDir = path.join(THEME_ROOT, dir);
  const destDir = path.join(DIST, dir);

  if (!fs.existsSync(srcDir)) {
    console.log(`  Skip: ${dir}/ (not found)`);
    continue;
  }

  fs.mkdirSync(destDir, { recursive: true });

  // Copy all files recursively
  function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDir(srcPath, destPath);
      } else {
        // Skip files we don't want in the theme ZIP
        if (entry.name.startsWith('.')) continue;
        if (entry.name === 'theme.js' && dir === 'assets') continue; // JS comes from server

        fs.copyFileSync(srcPath, destPath);
        fileCount++;
      }
    }
  }

  copyDir(srcDir, destDir);
  console.log(`  ✓ ${dir}/`);
}

console.log(`\n✓ Packaged ${fileCount} files into theme-dist/`);
console.log('  The dashboard Download button will now serve this as a ZIP.');
