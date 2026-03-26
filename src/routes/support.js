const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validate');
const rateLimit = require('../middleware/rateLimit');
const { kvGetTickets, kvSaveTickets } = require('../services/kvService');

function getRequestIp(req) {
  return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
}

function buildTicket({ name, email, message }, now) {
  return {
    // Add entropy to reduce collision risk during bursts.
    id: now * 1000 + Math.floor(Math.random() * 1000),
    name,
    email,
    message,
    status: 'open',
    read: false,
    replies: [],
    created_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString(),
  };
}

router.post('/ticket', validate(schemas.supportTicket), async (req, res) => {
  try {
    const ip = getRequestIp(req);
    const allowed = await rateLimit(ip, 'support', 5, 60 * 60 * 1000);
    if (!allowed) return res.status(429).json({ error: 'Too many tickets. Please try again later.' });

    const { name, email, message } = req.body;
    const now = Date.now();
    const ticket = buildTicket({ name, email, message }, now);

    const tickets = await kvGetTickets();
    tickets.push(ticket);
    await kvSaveTickets(tickets);

    return res.json({ success: true, ticket_id: ticket.id, message: 'Ticket submitted successfully' });
  } catch (error) {
    console.error('[Support] Failed to create ticket:', error.message);
    return res.status(500).json({ error: 'Unable to submit ticket at this time' });
  }
});

module.exports = router;
