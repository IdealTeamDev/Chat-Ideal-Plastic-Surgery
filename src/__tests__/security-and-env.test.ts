import { describe, expect, it } from "vitest";
import {
  isSupabasePublicConfigured,
  parsePublicEnv,
} from "@/lib/env/public";
import { parseAllowedOrigins } from "@/lib/env/server";
import {
  buildSecurityHeaders,
  isAllowedWidgetOrigin,
} from "@/lib/security/headers";
import { redactSensitiveText, sanitizeLogMetadata } from "@/lib/security/logger";
import { hasPermission } from "@/modules/auth/roles";
import {
  DEFAULT_AUTO_ACK_MESSAGE,
  incomingVisitorMessageSchema,
} from "@/modules/conversations/types";
import { visitorConsentAndIntakeSchema } from "@/modules/privacy/consent";

describe("Seguridad de variables de entorno (OWASP ASVS)", () => {
  it("permite compilación limpia cuando Supabase aún no está configurado", () => {
    const parsed = parsePublicEnv({
      NEXT_PUBLIC_APP_URL: "",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    });

    expect(isSupabasePublicConfigured(parsed)).toBe(false);
  });

  it("rechaza claves secretas expuestas accidentalmente en NEXT_PUBLIC_", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_1234567890",
      })
    ).toThrow(/ALERTA DE SEGURIDAD/);

    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "legacy_service_role_jwt",
      })
    ).toThrow(/ALERTA DE SEGURIDAD/);
  });

  it("acepta una Publishable Key válida de Supabase", () => {
    const parsed = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_public_key",
    });

    expect(isSupabasePublicConfigured(parsed)).toBe(true);
  });
});

describe("Validación de orígenes permitidos para el Widget (WordPress / Framer)", () => {
  it("rechaza el comodín '*' y rutas con path o protocolo inseguro en producción", () => {
    expect(() => parseAllowedOrigins("*", "production")).toThrow(/comodín/);
    expect(() =>
      parseAllowedOrigins("https://idealplasticsurgery.com/contacto", "production")
    ).toThrow(/sin rutas/);
    expect(() =>
      parseAllowedOrigins("http://idealplasticsurgery.com", "production")
    ).toThrow(/HTTPS/);
  });

  it("normaliza orígenes HTTPS válidos y verifica igualdad exacta", () => {
    const origins = parseAllowedOrigins(
      "https://idealplasticsurgery.com, https://www.idealplasticsurgery.com",
      "production"
    );

    expect(origins).toEqual([
      "https://idealplasticsurgery.com",
      "https://www.idealplasticsurgery.com",
    ]);
    expect(isAllowedWidgetOrigin("https://idealplasticsurgery.com", origins)).toBe(
      true
    );
    expect(isAllowedWidgetOrigin("https://evil-idealplasticsurgery.com", origins)).toBe(
      false
    );
  });
});

describe("Cabeceras HTTP de seguridad diferenciadas por superficie", () => {
  it("bloquea iframes por completo en /dashboard mediante X-Frame-Options DENY y frame-ancestors 'none'", () => {
    const headers = buildSecurityHeaders({
      pathname: "/dashboard",
      allowedWidgetOrigins: ["https://idealplasticsurgery.com"],
      supabaseUrl: "https://project.supabase.co",
      isProduction: true,
    });

    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).toContain(
      "wss://project.supabase.co"
    );
    expect(headers["Strict-Transport-Security"]).toBeDefined();
  });

  it("permite embeber /widget únicamente en los dominios autorizados omitiendo X-Frame-Options", () => {
    const headers = buildSecurityHeaders({
      pathname: "/widget",
      allowedWidgetOrigins: ["https://idealplasticsurgery.com"],
      isProduction: true,
    });

    expect(headers["X-Frame-Options"]).toBeUndefined();
    expect(headers["Content-Security-Policy"]).toContain(
      "frame-ancestors 'self' https://idealplasticsurgery.com"
    );
  });
});

describe("Redacción de PII y secretos en logs", () => {
  it("redacta correos, teléfonos, claves secretas y campos sensibles", () => {
    const text =
      "Contacto paciente@correo.com tel +57 300 123 4567 token sb_secret_abcdef123";
    const redacted = redactSensitiveText(text);

    expect(redacted).not.toContain("paciente@correo.com");
    expect(redacted).not.toContain("300 123 4567");
    expect(redacted).not.toContain("sb_secret_abcdef123");

    const sanitizedObj = sanitizeLogMetadata({
      email: "paciente@correo.com",
      visitor_token: "opaque-token-value",
      status: "queued",
    }) as Record<string, unknown>;

    expect(sanitizedObj.email).toBe("[REDACTED]");
    expect(sanitizedObj.visitor_token).toBe("[REDACTED]");
    expect(sanitizedObj.status).toBe("queued");
  });
});

describe("Reglas de dominio: RBAC, mensajería sin IA y consentimiento Ley 1581", () => {
  it("aplica principio de mínimo privilegio entre admin, supervisor y agent", () => {
    expect(hasPermission("agent", "users:manage")).toBe(false);
    expect(hasPermission("agent", "conversations:read:all")).toBe(false);
    expect(hasPermission("agent", "conversations:reply")).toBe(true);
    expect(hasPermission("supervisor", "conversations:assign:any")).toBe(true);
    expect(hasPermission("supervisor", "settings:manage")).toBe(false);
    expect(hasPermission("admin", "settings:manage")).toBe(true);
  });

  it("conserva el mensaje automático exacto sin IA y exige UUID idempotente", () => {
    expect(DEFAULT_AUTO_ACK_MESSAGE).toBe(
      "¡Gracias por escribirnos! Hemos recibido tu mensaje. Uno de nuestros asesores te atenderá en cuanto esté disponible."
    );

    const validMsg = incomingVisitorMessageSchema.safeParse({
      content: "Hola, quisiera información sobre valoración.",
      clientMessageId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(validMsg.success).toBe(true);

    const invalidMsg = incomingVisitorMessageSchema.safeParse({
      content: "   ",
      clientMessageId: "no-es-uuid",
    });
    expect(invalidMsg.success).toBe(false);
  });

  it("separa consentimiento de atención (obligatorio) y comercial (opcional)", () => {
    const validConsent = visitorConsentAndIntakeSchema.safeParse({
      supportConsentAccepted: true,
    });
    expect(validConsent.success).toBe(true);
    if (validConsent.success) {
      expect(validConsent.data.commercialConsentAccepted).toBe(false);
    }

    const rejectedConsent = visitorConsentAndIntakeSchema.safeParse({
      supportConsentAccepted: false,
      commercialConsentAccepted: true,
    });
    expect(rejectedConsent.success).toBe(false);
  });
});
