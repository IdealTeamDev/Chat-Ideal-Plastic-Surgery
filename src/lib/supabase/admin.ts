import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAdminEnv } from "@/lib/env/server";

/**
 * Cliente administrativo exclusivo de servidor (`SUPABASE_SECRET_KEY`).
 * ADVERTENCIA DE SEGURIDAD:
 * Este cliente omite Row Level Security (BYPASSRLS).
 * Solo debe invocarse en Route Handlers o acciones de backend tras verificar
 * explícitamente la autorización, el tenant (`organization_id`) y la sesión.
 */
export function createSupabaseAdminClient() {
  const { url, secretKey } = requireSupabaseAdminEnv();

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
