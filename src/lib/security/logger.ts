const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g;
const SECRET_TOKEN_REGEX =
  /\b(?:sb_secret_[A-Za-z0-9_-]+|sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/g;

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "email",
  "phone",
  "content",
  "message",
  "visitor_token",
  "supabase_secret_key",
]);

export function redactSensitiveText(input: string): string {
  return input
    .replace(SECRET_TOKEN_REGEX, "[REDACTED_TOKEN]")
    .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
    .replace(PHONE_REGEX, "[REDACTED_PHONE]");
}

export function sanitizeLogMetadata(value: unknown, depth = 0): unknown {
  if (depth > 4) {
    return "[TRUNCATED_DEPTH]";
  }

  if (typeof value === "string") {
    return redactSensitiveText(value);
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactSensitiveText(value.message),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogMetadata(item, depth + 1));
  }

  if (typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeLogMetadata(entryValue, depth + 1);
      }
    }
    return sanitized;
  }

  return "[UNSERIALIZABLE]";
}

export const safeLogger = {
  info(event: string, metadata?: Record<string, unknown>) {
    console.info(
      JSON.stringify({
        level: "info",
        event,
        timestamp: new Date().toISOString(),
        ...(metadata ? { metadata: sanitizeLogMetadata(metadata) } : {}),
      })
    );
  },
  warn(event: string, metadata?: Record<string, unknown>) {
    console.warn(
      JSON.stringify({
        level: "warn",
        event,
        timestamp: new Date().toISOString(),
        ...(metadata ? { metadata: sanitizeLogMetadata(metadata) } : {}),
      })
    );
  },
  error(event: string, metadata?: Record<string, unknown>) {
    console.error(
      JSON.stringify({
        level: "error",
        event,
        timestamp: new Date().toISOString(),
        ...(metadata ? { metadata: sanitizeLogMetadata(metadata) } : {}),
      })
    );
  },
};
