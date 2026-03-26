'use strict';

// Manual Jest mock for src/services/emailService.js
// Prevents real emails from being sent during tests.

const sendWelcomeEmail = jest.fn().mockResolvedValue({ id: 'mock-email-id' });
const sendTicketReply  = jest.fn().mockResolvedValue(undefined);

module.exports = { sendWelcomeEmail, sendTicketReply };
