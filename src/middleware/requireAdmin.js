const logger = require('../utils/logger');

const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY && process.env.NODE_ENV === 'production') {
  logger.fatal('ADMIN_KEY environment variable is required in production. Exiting.');
  process.exit(1);
}
if (!ADMIN_KEY) {
  logger.warn('ADMIN_KEY not set — using insecure default. Set ADMIN_KEY env var before deploying.');
}
const EFFECTIVE_ADMIN_KEY = ADMIN_KEY || 'change-me-in-production';

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== EFFECTIVE_ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}

module.exports = { requireAdmin, EFFECTIVE_ADMIN_KEY };
