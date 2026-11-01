/// <reference types="vite/client" />
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type OfficerRole = 'scrutiny_officer' | 'evc_officer';

export interface OfficerProfile {
  id: string;
  full_name: string | null;
  role: OfficerRole;
  created_at?: string;
}

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
