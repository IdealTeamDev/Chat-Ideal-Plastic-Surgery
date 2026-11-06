import { z } from "zod";

const FORBIDDEN_SECRET_PATTERNS = [
  /^sb_secret_/i,
  /service_role/i,
  /^sk-/i,
];

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined))
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Debe ser una URL HTTP/HTTPS válida." }
  );

const publishableKeySchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined))
  .refine(
    (val) => {
      if (!val) return true;
      return !FORBIDDEN_SECRET_PATTERNS.some((pattern) => pattern.test(val));
    },
    {
      message:
        "ALERTA DE SEGURIDAD: Se detectó una clave secreta en NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Usa únicamente la Publishable Key pública.",
    }
  );

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrlSchema,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrlSchema,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKeySchema,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(
  rawEnv: Record<string, string | undefined> = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }
): PublicEnv {
  return publicEnvSchema.parse({
    ...rawEnv,
    NEXT_PUBLIC_SUPABASE_URL:
      rawEnv.NEXT_PUBLIC_SUPABASE_URL || rawEnv.SUPABASE_URL,
  });
}

export function isSupabasePublicConfigured(env?: PublicEnv): boolean {
  const resolved = env ?? parsePublicEnv();
  return Boolean(
    resolved.NEXT_PUBLIC_SUPABASE_URL &&
      resolved.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function requirePublicSupabaseEnv(): {
  url: string;
  publishableKey: string;
} {
  const env = parsePublicEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase aún no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en las variables de entorno."
    );
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
