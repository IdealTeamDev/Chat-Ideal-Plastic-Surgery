import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerEnvStatus } from "@/lib/env/server";

async function RuntimeEnvironmentChecklist() {
  await headers();

  let statusResult:
    | { ok: true; data: ReturnType<typeof getServerEnvStatus> }
    | { ok: false };

  try {
    statusResult = { ok: true, data: getServerEnvStatus() };
  } catch {
    statusResult = { ok: false };
  }

  if (!statusResult.ok) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Error de formato en variables de entorno. Revisa los nombres y valores
        configurados frente a <code>.env.example</code>.
      </div>
    );
  }

  const { data } = statusResult;
  const items = [
    {
      label: "Supabase URL + Publishable Key (Cliente / SSR)",
      ready: data.supabasePublicReady,
    },
    {
      label: "Supabase Secret Key exclusiva de servidor",
      ready: data.supabaseSecretReady,
    },
    {
      label: "Secreto HMAC para sesiones anónimas de visitantes",
      ready: data.visitorHmacReady,
    },
    {
      label: `Orígenes autorizados del Widget (${data.allowedWidgetOriginsCount} configurados)`,
      ready: data.allowedWidgetOriginsCount > 0,
    },
  ];

  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm"
        >
          <span>{item.label}</span>
          {item.ready ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              <CheckCircle2 className="mr-1 size-3.5" aria-hidden="true" />
              Configurado
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="mr-1 size-3.5" aria-hidden="true" />
              Pendiente Fase 2
            </Badge>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Fase 1 Completada</Badge>
          <Badge variant="outline">Next.js 16 App Router + TypeScript</Badge>
          <Badge variant="secondary">IA Desactivada (100% Atención Humana)</Badge>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Plataforma de Chat en Vivo — Ideal Plastic Surgery
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Arquitectura propia, modular e independiente de terceros para atención
          en tiempo real de visitantes y operación de call center (2 a 5
          asesores), diseñada bajo estándares OWASP ASVS y Ley 1581 de 2012.
        </p>
      </header>

      <section
        aria-label="Áreas de la arquitectura"
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MessageSquare className="size-4" aria-hidden="true" />
              Área A · Público
            </div>
            <CardTitle className="mt-1 text-lg">Widget Embebible</CardTitle>
            <CardDescription>
              Interfaz aislada para WordPress y Framer mediante iframe seguro,
              consentimiento informado y minimización de datos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/widget"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ver vista base de /widget
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Área B · Privado
            </div>
            <CardTitle className="mt-1 text-lg">Dashboard Call Center</CardTitle>
            <CardDescription>
              Consola interna para Administradores, Supervisores y Agentes con
              control de carga, cola y notas privadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Abrir consola /dashboard
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="size-4" aria-hidden="true" />
              Área C · Backend
            </div>
            <CardTitle className="mt-1 text-lg">API y Reglas Seguras</CardTitle>
            <CardDescription>
              Validación Zod, sesiones separadas para staff y visitantes,
              persistencia previa a Realtime y auditoría sin PII.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/api/health"
              className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Consultar /api/health
            </a>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-lg">
              Estado de Integración y Controles de Entorno
            </CardTitle>
          </div>
          <CardDescription>
            Diagnóstico en vivo sin exponer secretos ni credenciales. Listo para
            despliegue inicial en Vercel antes de conectar Supabase en Fase 2.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">
                Verificando variables de entorno del servidor…
              </p>
            }
          >
            <RuntimeEnvironmentChecklist />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
