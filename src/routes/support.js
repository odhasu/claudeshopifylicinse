const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validate');
const rateLimit = require('../middleware/rateLimit');
const { kvGetTickets, kvSaveTickets } = require('../services/kvService');

router.post('/ticket', validate(schemas.supportTicket), async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  if (!rateLimit(ip, 'support', 5)) return res.status(429).json({ error: 'Too many tickets. Please try again later.' });
  const { name, email, message } = req.body;
  const ticket = {
    id: Date.now(),
    name,
    email,
    message,
    status: 'open',
    read: false,
    replies: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const tickets = await kvGetTickets();
  tickets.push(ticket);
  await kvSaveTickets(tickets);
  res.json({ success: true, ticket_id: ticket.id, message: 'Ticket submitted successfully' });
});

module.exports = router;
