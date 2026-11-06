import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicSupabaseEnv } from "@/lib/env/public";

export async function createSupabaseServerClient() {
  const { url, publishableKey } = requirePublicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: options?.httpOnly ?? true,
              secure:
                options?.secure ?? process.env.NODE_ENV === "production",
              sameSite: options?.sameSite ?? "lax",
              path: options?.path ?? "/",
            });
          });
        } catch {
          // En Server Components de solo lectura, Next.js impide mutar cookies;
          // la renovación de sesión se gestiona en `src/proxy.ts`.
        }
      },
    },
  });
}
