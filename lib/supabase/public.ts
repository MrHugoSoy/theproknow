import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { requireSupabaseEnv } from "./env";

/**
 * Cliente anónimo sin cookies ni sesión, para datos públicos (sitemap, imágenes OG).
 * Sigue sujeto a RLS: solo ve lo que ve un visitante.
 */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
