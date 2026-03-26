const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const rootDir = path.join(__dirname, '..', '..');

router.get('/v3/scaled-loader.js', (req, res) => {
  const srcPath = path.join(rootDir, 'src', 'loader.js');
  const distPath = path.join(rootDir, 'dist', 'scaled-loader.js');
  res.setHeader('Content-Type', 'application/javascript');
  if (fs.existsSync(distPath)) { res.setHeader('Cache-Control', 'public, max-age=3600'); res.sendFile(distPath); }
  else if (fs.existsSync(srcPath)) { res.setHeader('Cache-Control', 'no-cache'); res.sendFile(srcPath); }
  else res.status(404).send('// Loader not found');
});

router.get('/scaled-loader.js', (req, res) => res.redirect(301, '/api/loader/v3/scaled-loader.js'));

module.exports = router;
