const { z } = require('zod');

const DOMAIN_PATTERN = /^(?:\*|(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63})$/i;
const domainSchema = z.string()
  .min(1)
  .max(253)
  .transform((value) => value.trim().toLowerCase())
  .refine((value) => DOMAIN_PATTERN.test(value), 'Invalid domain format');

const optionalDomainSchema = z.string()
  .max(253)
  .transform((value) => value.trim().toLowerCase())
  .refine((value) => value === '' || DOMAIN_PATTERN.test(value), 'Invalid domain format')
  .optional();

const schemas = {
  authLogin: z.object({
    licenseKey: z.string().min(1).max(80).transform((value) => value.trim()),
  }),
  adminCheck: z.object({
    adminKey: z.string().min(1).max(256).transform((value) => value.trim()),
  }),
  render: z.object({
    licenseKey: z.string().min(1).max(50),
    domain: domainSchema,
    permanentDomain: optionalDomainSchema,
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
  legacyLoad: z.object({
    licenseKey: z.string().min(1).max(50),
    domain: domainSchema,
    permanentDomain: optionalDomainSchema,
  }),
  createLicense: z.object({
    username: z.string().max(200).optional().default(''),
    domain: domainSchema,
    permanent_domain: optionalDomainSchema.default(''),
    store_name: z.string().max(200).optional().default(''),
    plan: z.enum(['LITE', 'PRO', 'standard', 'owner', 'unlimited']).optional().default('standard'),
    expires_at: z.string().datetime().optional().nullable(),
  }),
  remoteContent: z.object({
    domain: domainSchema,
    css: z.string().max(50000).optional().nullable(),
    html: z.string().max(50000).optional().nullable(),
    js: z.string().max(50000).optional().nullable(),
    redirect_url: z.string().url().max(2000).or(z.literal('')).optional().nullable(),
  }),
  ticketReply: z.object({
    message: z.string().min(1).max(5000).transform(s => s.trim()),
  }),
  ticketUpdate: z.object({
    status: z.enum(['open', 'in-progress', 'closed']).optional(),
    read: z.boolean().optional(),
  }).refine((value) => value.status !== undefined || value.read !== undefined, {
    message: 'At least one of status or read is required',
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
