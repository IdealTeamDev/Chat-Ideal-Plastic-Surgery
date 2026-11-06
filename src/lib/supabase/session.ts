import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabasePublicConfigured, parsePublicEnv } from "@/lib/env/public";

/**
 * Sincroniza de forma segura las cookies de sesión de Supabase Auth en `src/proxy.ts`.
 * Si Supabase aún no está configurado (Fase 1 previa a creación del proyecto),
 * retorna `NextResponse.next()` limpiamente sin bloquear la aplicación.
 */
export async function updateSupabaseSession(
  request: NextRequest
): Promise<NextResponse> {
  let response = NextResponse.next({
    request,
  });

  const env = parsePublicEnv();
  if (!isSupabasePublicConfigured(env)) {
    return response;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              httpOnly: options?.httpOnly ?? true,
              secure:
                options?.secure ?? process.env.NODE_ENV === "production",
              sameSite: options?.sameSite ?? "lax",
              path: options?.path ?? "/",
            })
          );
        },
      },
    }
  );

  // Valida el token contra Supabase Auth (nunca confiar únicamente en getSession() local).
  await supabase.auth.getUser();

  return response;
}
