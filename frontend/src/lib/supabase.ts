// Mocked supabase to satisfy build requirements without actual env vars

export interface ThemeLicense {
  id: string;
  api_key: string;
  secret_key: string;
  label: string | null;
  owner_email: string | null;
  user_id: string | null;
  plan: 'LITE' | 'PRO' | null;
  allowed_stores: number;
  registered_domains: string[];
  is_active: boolean;
  created_at: string;
}

export interface Lead {
  id?: number;
  email: string;
  plan: 'LITE' | 'PRO';
  source?: string;
  created_at?: string;
}

export interface SupportMessage {
  id?: number;
  name: string;
  email: string;
  message: string;
  created_at?: string;
}

export interface WaitlistEntry {
  id?: number;
  email: string;
  created_at?: string;
}

export const supabase = {
  auth: {
    signInWithPassword: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      order: async () => ({ data: [], error: null })
    }),
    insert: () => ({
      select: async () => ({ data: [], error: null })
    })
  })
} as any;

export function createServiceRoleClient() {
  return supabase;
}

export async function insertLead(email: string, plan: 'LITE' | 'PRO', source?: string) {
  return [{ email, plan, source }];
}

export async function insertSupportMessage(name: string, email: string, message: string) {
  return [{ name, email, message }];
}

export async function insertWaitlistEntry(email: string) {
  return [{ email }];
}
