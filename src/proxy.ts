import { NextResponse, type NextRequest } from "next/server";
import { parseAllowedOrigins } from "@/lib/env/server";
import { buildSecurityHeaders } from "@/lib/security/headers";
import { safeLogger } from "@/lib/security/logger";
import { updateSupabaseSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  let response: NextResponse;

  try {
    response = await updateSupabaseSession(request);
  } catch (error) {
    safeLogger.error("proxy.session_refresh_failed", { error });
    response = NextResponse.next({ request });
  }

  let allowedWidgetOrigins: string[] = [];
  try {
    allowedWidgetOrigins = parseAllowedOrigins(
      process.env.WIDGET_ALLOWED_ORIGINS,
      process.env.NODE_ENV
    );
  } catch (error) {
    safeLogger.error("proxy.invalid_widget_allowed_origins", { error });
  }

  const securityHeaders = buildSecurityHeaders({
    pathname: request.nextUrl.pathname,
    allowedWidgetOrigins,
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    isProduction: process.env.NODE_ENV === "production",
  });

  for (const [headerName, headerValue] of Object.entries(securityHeaders)) {
    response.headers.set(headerName, headerValue);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
