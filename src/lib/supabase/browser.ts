import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseEnv } from "@/lib/env/public";

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = requirePublicSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
