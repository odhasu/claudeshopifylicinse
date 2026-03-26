const express = require('express');
const router = express.Router();

// GET /api/health
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0.0', timestamp: new Date().toISOString() });
});

module.exports = router;
