/**
 * build-static.mjs
 * Standard Next.js build script (GitHub Pages support removed).
 */
import { execSync } from 'child_process';

try {
  execSync('next build', { stdio: 'inherit', env: process.env });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
