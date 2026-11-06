import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServerEnvStatus } from "@/lib/env/server";
import { safeLogger } from "@/lib/security/logger";

export async function GET() {
  // Fuerza evaluación en tiempo de solicitud bajo Next.js 16 Cache Components
  await headers();

  try {
    const envStatus = getServerEnvStatus();

    return NextResponse.json(
      {
        status: "ok",
        service: "ideal-plastic-surgery-chat",
        phase: 1,
        aiEnabled: false,
        timestamp: new Date().toISOString(),
        checks: {
          supabasePublicConfigured: envStatus.supabasePublicReady,
          supabaseSecretConfigured: envStatus.supabaseSecretReady,
          visitorHmacConfigured: envStatus.visitorHmacReady,
          allowedWidgetOriginsCount: envStatus.allowedWidgetOriginsCount,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    safeLogger.error("api.health.env_validation_error", { error });

    return NextResponse.json(
      {
        status: "misconfigured",
        service: "ideal-plastic-surgery-chat",
        phase: 1,
        aiEnabled: false,
        timestamp: new Date().toISOString(),
        message:
          "Error en validación de variables de entorno. Revisa los logs del servidor.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
