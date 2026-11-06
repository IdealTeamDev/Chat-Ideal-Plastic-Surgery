import "server-only";
import { z } from "zod";
import { parsePublicEnv } from "./public";

const secretKeySchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined))
  .refine(
    (val) => {
      if (!val) return true;
      return !/^sb_publishable_/i.test(val);
    },
    {
      message:
        "SUPABASE_SECRET_KEY no puede ser una clave publicable (sb_publishable_).",
    }
  );

const hmacSecretSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined))
  .refine((val) => !val || val.length >= 32, {
    message:
      "VISITOR_SESSION_HMAC_SECRET debe tener al menos 32 caracteres de alta entropía.",
  });

export function parseAllowedOrigins(
  rawOrigins: string | undefined,
  nodeEnv: string = process.env.NODE_ENV ?? "development"
): string[] {
  if (!rawOrigins || rawOrigins.trim().length === 0) {
    return [];
  }

  const entries = rawOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const normalizedOrigins: string[] = [];

  for (const entry of entries) {
    if (entry === "*") {
      throw new Error(
        "WIDGET_ALLOWED_ORIGINS no permite el comodín '*'. Especifica dominios exactos."
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(entry);
    } catch {
      throw new Error(`Origen inválido en WIDGET_ALLOWED_ORIGINS: "${entry}"`);
    }

    if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
      throw new Error(
        `WIDGET_ALLOWED_ORIGINS debe contener solo el origen (esquema + host + puerto opcional), sin rutas: "${entry}"`
      );
    }

    const isLocalhost =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

    if (nodeEnv === "production" && parsed.protocol !== "https:") {
      throw new Error(
        `En producción, WIDGET_ALLOWED_ORIGINS exige HTTPS: "${entry}"`
      );
    }

    if (
      nodeEnv !== "production" &&
      parsed.protocol !== "https:" &&
      !(parsed.protocol === "http:" && isLocalhost)
    ) {
      throw new Error(
        `Origen inseguro no permitido en WIDGET_ALLOWED_ORIGINS: "${entry}"`
      );
    }

    if (!normalizedOrigins.includes(parsed.origin)) {
      normalizedOrigins.push(parsed.origin);
    }
  }

  return normalizedOrigins;
}

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: secretKeySchema,
  VISITOR_SESSION_HMAC_SECRET: hmacSecretSchema,
  WIDGET_ALLOWED_ORIGINS: z.string().optional(),
});

export interface ServerEnvStatus {
  supabasePublicReady: boolean;
  supabaseSecretReady: boolean;
  visitorHmacReady: boolean;
  allowedWidgetOriginsCount: number;
}

export function getServerEnv(
  rawEnv: Record<string, string | undefined> = process.env
) {
  const publicEnv = parsePublicEnv({
    NEXT_PUBLIC_APP_URL: rawEnv.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: rawEnv.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      rawEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  const serverEnv = serverEnvSchema.parse({
    SUPABASE_SECRET_KEY: rawEnv.SUPABASE_SECRET_KEY,
    VISITOR_SESSION_HMAC_SECRET: rawEnv.VISITOR_SESSION_HMAC_SECRET,
    WIDGET_ALLOWED_ORIGINS: rawEnv.WIDGET_ALLOWED_ORIGINS,
  });
  const allowedWidgetOrigins = parseAllowedOrigins(
    serverEnv.WIDGET_ALLOWED_ORIGINS,
    rawEnv.NODE_ENV ?? process.env.NODE_ENV
  );

  return {
    ...publicEnv,
    ...serverEnv,
    allowedWidgetOrigins,
  };
}

export function getServerEnvStatus(): ServerEnvStatus {
  const env = getServerEnv();
  return {
    supabasePublicReady: Boolean(
      env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    supabaseSecretReady: Boolean(env.SUPABASE_SECRET_KEY),
    visitorHmacReady: Boolean(env.VISITOR_SESSION_HMAC_SECRET),
    allowedWidgetOriginsCount: env.allowedWidgetOrigins.length,
  };
}

export function requireSupabaseAdminEnv(): {
  url: string;
  secretKey: string;
} {
  const env = getServerEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error(
      "Configuración incompleta de servidor: requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY."
    );
  }
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    secretKey: env.SUPABASE_SECRET_KEY,
  };
}
