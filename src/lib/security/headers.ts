export interface SecurityHeaderOptions {
  pathname: string;
  allowedWidgetOrigins: string[];
  supabaseUrl?: string;
  isProduction?: boolean;
}

export function isWidgetSurface(pathname: string): boolean {
  return pathname === "/widget" || pathname.startsWith("/widget/");
}

export function isAllowedWidgetOrigin(
  origin: string | null | undefined,
  allowedWidgetOrigins: string[]
): boolean {
  if (!origin) return false;
  try {
    const normalized = new URL(origin).origin;
    return allowedWidgetOrigins.includes(normalized);
  } catch {
    return false;
  }
}

export function buildSecurityHeaders({
  pathname,
  allowedWidgetOrigins,
  supabaseUrl,
  isProduction = process.env.NODE_ENV === "production",
}: SecurityHeaderOptions): Record<string, string> {
  const widgetRoute = isWidgetSurface(pathname);

  const connectSources = ["'self'"];
  if (supabaseUrl) {
    try {
      const parsedSupabase = new URL(supabaseUrl);
      connectSources.push(parsedSupabase.origin);
      const wsProtocol = parsedSupabase.protocol === "https:" ? "wss:" : "ws:";
      connectSources.push(`${wsProtocol}//${parsedSupabase.host}`);
    } catch {
      // Ignora URL malformada; el validador de entorno la reporta por separado.
    }
  }

  const frameAncestors = widgetRoute
    ? ["'self'", ...allowedWidgetOrigins].join(" ")
    : "'none'";

  const scriptSrc = isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const cspDirectives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    `frame-ancestors ${frameAncestors}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (isProduction) {
    cspDirectives.push("upgrade-insecure-requests");
  }

  const headers: Record<string, string> = {
    "Content-Security-Policy": cspDirectives.join("; "),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    "X-DNS-Prefetch-Control": "off",
  };

  // X-Frame-Options: DENY se aplica a Dashboard, API y raíz.
  // Se omite deliberadamente en /widget porque X-Frame-Options no soporta lista de dominios
  // cross-origin (WordPress/Framer), delegando el control estricto a CSP frame-ancestors.
  if (!widgetRoute) {
    headers["X-Frame-Options"] = "DENY";
  }

  if (isProduction) {
    headers["Strict-Transport-Security"] =
      "max-age=63072000; includeSubDomains; preload";
  }

  return headers;
}
