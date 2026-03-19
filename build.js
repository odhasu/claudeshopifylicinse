/**
 * Build Pipeline — Obfuscates the loader script.
 *
 * Usage: node build.js
 *
 * Takes the loader source from src/loader.js, obfuscates it
 * with anti-debugging, self-defending code, and string encoding,
 * then writes it to dist/scaled-loader.js.
 *
 * The obfuscated loader is what gets deployed to the Shopify theme.
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

fs.mkdirSync(DIST_DIR, { recursive: true });

// ─── Read Source Files ──────────────────────────────────────────
const loaderSrc = fs.readFileSync(path.join(SRC_DIR, 'loader.js'), 'utf8');

// ─── Obfuscation Config ────────────────────────────────────────
// Level: Maximum protection
const obfuscationConfig = {
  // Core obfuscation
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,

  // Anti-debugging
  debugProtection: true,          // Crashes if DevTools are opened
  debugProtectionInterval: 2000,  // Keeps checking every 2s
  disableConsoleOutput: false,    // Don't disable console (breaks Shopify)

  // Self-defending
  selfDefending: true,            // Code detects if it's been reformatted/modified

  // String encoding
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersType: 'function',
  splitStrings: true,
  splitStringsChunkLength: 5,

  // Identifier renaming
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,           // Don't rename globals (breaks Shopify integration)
  renameProperties: false,

  // Transform
  transformObjectKeys: true,
  unicodeEscapeSequence: false,

  // Target
  target: 'browser',
  seed: 0,
};

// ─── Obfuscate ──────────────────────────────────────────────────
console.log('═══ OGVendors Build Pipeline ═══\n');
console.log('⚙ Obfuscating loader...');

const startTime = Date.now();
const result = JavaScriptObfuscator.obfuscate(loaderSrc, obfuscationConfig);
const obfuscatedCode = result.getObfuscatedCode();
const elapsed = Date.now() - startTime;

// Write output
const outputPath = path.join(DIST_DIR, 'scaled-loader.js');
fs.writeFileSync(outputPath, obfuscatedCode);

const srcSize = Buffer.byteLength(loaderSrc, 'utf8');
const outSize = Buffer.byteLength(obfuscatedCode, 'utf8');

console.log(`✅ Done in ${elapsed}ms`);
console.log(`   Source:     ${(srcSize / 1024).toFixed(1)} KB`);
console.log(`   Obfuscated: ${(outSize / 1024).toFixed(1)} KB (${(outSize / srcSize * 100).toFixed(0)}% of original)`);
console.log(`   Output:     ${outputPath}`);
console.log('\n📋 Next steps:');
console.log('   1. Copy dist/scaled-loader.js to your Shopify theme assets/ folder');
console.log('   2. Or host it on your Railway server at /api/loader/scaled-loader.js');
console.log('');
