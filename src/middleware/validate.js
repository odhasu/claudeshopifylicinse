const { z } = require('zod');

const schemas = {
  render: z.object({
    licenseKey: z.string().min(1).max(50),
    domain: z.string().min(1).max(253),
    permanentDomain: z.string().max(253).optional(),
    sections: z.array(z.object({
      type: z.string().min(1).max(50),
      elementId: z.string().max(100).optional(),
      settings: z.record(z.unknown()).optional(),
      products: z.array(z.unknown()).optional(),
    })).max(50).optional(),
    colors: z.record(z.string()).optional(),
    brandName: z.string().max(200).optional(),
    logoUrl: z.string().url().max(2000).or(z.literal('')).optional().nullable(),
    chatbot: z.record(z.unknown()).optional(),
    urgency: z.record(z.unknown()).optional(),
  }),
  supportTicket: z.object({
    name: z.string().min(1).max(100).transform(s => s.trim()),
    email: z.string().email().max(200).transform(s => s.trim().toLowerCase()),
    message: z.string().min(1).max(5000).transform(s => s.trim()),
  }),
  createPaymentIntent: z.object({
    plan: z.enum(['LITE', 'PRO']),
    email: z.string().email().max(200).optional(),
    customerName: z.string().max(200).optional(),
  }),
  checkout: z.object({
    plan: z.enum(['LITE', 'PRO']),
  }),
  createLicense: z.object({
    username: z.string().max(200).optional().default(''),
    domain: z.string().min(1).max(253),
    permanent_domain: z.string().max(253).optional().default(''),
    store_name: z.string().max(200).optional().default(''),
    plan: z.enum(['LITE', 'PRO', 'standard', 'owner', 'unlimited']).optional().default('standard'),
    expires_at: z.string().datetime().optional().nullable(),
  }),
  remoteContent: z.object({
    domain: z.string().min(1).max(253),
    css: z.string().max(50000).optional().nullable(),
    html: z.string().max(50000).optional().nullable(),
    js: z.string().max(50000).optional().nullable(),
    redirect_url: z.string().url().max(2000).or(z.literal('')).optional().nullable(),
  }),
  ticketReply: z.object({
    message: z.string().min(1).max(5000).transform(s => s.trim()),
  }),
};

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return res.status(400).json({ error: 'validation_error', details: errors });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { schemas, validate };
