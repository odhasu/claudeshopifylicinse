import type { Request, Response, NextFunction } from 'express';

// ─── Express Augmentation ────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// ─── License ─────────────────────────────────────────────────────
export interface License {
  id: number;
  license_key: string;
  username?: string;
  domain: string;
  permanent_domain?: string;
  store_name?: string;
  plan: string;
  active: number | boolean;
  created_at: string;
  expires_at: string | null;
  last_verified_at: string | null;
  request_count: number;
  email?: string | null;
  customer_name?: string | null;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  notes?: string;
  [key: string]: unknown;
}

export interface LicenseCreateData {
  username?: string;
  domain: string;
  permanent_domain?: string;
  store_name?: string;
  plan?: string;
  expires_at?: string | null;
  email?: string | null;
  customer_name?: string | null;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  notes?: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  license?: License;
  expected?: string;
}

// ─── Ticket ──────────────────────────────────────────────────────
export interface TicketReply {
  id: number;
  message: string;
  sent_at: string;
}

export interface Ticket {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  read: boolean;
  replies: TicketReply[];
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// ─── Store ───────────────────────────────────────────────────────
export interface RemoteContent {
  id: number;
  domain: string;
  css: string | null;
  html: string | null;
  js: string | null;
  redirect_url: string | null;
  active: number | boolean;
  created_at: string;
}

export interface RequestLogEntry {
  id: number;
  license_key: string;
  domain: string;
  ip: string;
  user_agent: string;
  status: string;
  created_at: string;
}

export interface Store {
  licenses: License[];
  request_log: RequestLogEntry[];
  remote_content: RemoteContent[];
  tickets: Ticket[];
  _nextId: number;
}

// ─── KV Service ──────────────────────────────────────────────────
export interface KvCache<T> {
  data: T | null;
  expiresAt: number;
}

export interface RateLimitResult {
  count: number;
  ttlMs: number;
}

export interface CacheState {
  warm: boolean;
  ttl_remaining_ms: number;
}

export interface KvRuntimeStatus {
  enabled: boolean;
  timeout_ms: number;
  retry_count: number;
  cache_ttl_ms: number;
  caches: {
    tickets: CacheState;
    licenses: CacheState;
  };
}

// ─── Renderers ───────────────────────────────────────────────────
export interface RendererConfig {
  brandName: string;
  logoUrl: string | null;
  chatbot: Record<string, unknown>;
  urgency: Record<string, unknown>;
}

export type RendererFunction = (
  settings: Record<string, unknown>,
  products: unknown[] | null,
  colors: Record<string, string>,
  cfg: RendererConfig,
) => string;

// ─── Stripe ──────────────────────────────────────────────────────
export interface PlanPrice {
  amount: number;
  name: string;
  plan: string;
}

// ─── Middleware ───────────────────────────────────────────────────
export type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;
export type AsyncExpressMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;
