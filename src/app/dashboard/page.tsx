import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ShieldAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPermissionsForRole, STAFF_ROLES } from "@/modules/auth/roles";

export const metadata: Metadata = {
  title: "Consola de Call Center",
};

const ROLE_LABELS = {
  admin: {
    title: "Administrador",
    summary:
      "Configuración general, gestión de usuarios/sitios, MFA obligatorio y métricas operativas.",
  },
  supervisor: {
    title: "Supervisor",
    summary:
      "Supervisión operativa de cola, asignaciones manuales, transferencias y disponibilidad de agentes.",
  },
  agent: {
    title: "Agente",
    summary:
      "Atención en tiempo real de conversaciones asignadas, notas internas y transferencia controlada.",
  },
} as const;

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Área B · Dashboard Privado</Badge>
            <Badge variant="secondary">Equipo 2–5 Agentes</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Consola de Atención — Ideal Plastic Surgery
          </h1>
          <p className="text-sm text-muted-foreground">
            Superficie protegida por cabeceras anti-clickjacking (
            <code>frame-ancestors &apos;none&apos;</code>) y preparada para
            Supabase Auth + RLS.
          </p>
        </div>

        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Volver al estado del sistema
        </Link>
      </header>

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <ShieldAlert className="size-5 shrink-0" aria-hidden="true" />
            <CardTitle className="text-base">
              Puerta de Seguridad Previa al Login (Fase 1 → Fase 2)
            </CardTitle>
          </div>
          <CardDescription className="text-foreground/80">
            Conforme al plan de seguridad del proyecto, la autenticación de
            agentes y el acceso a datos no se habilitan hasta configurar el
            proyecto en Supabase, aplicar las migraciones SQL con Row Level
            Security (RLS) y validar las decisiones de MFA y privacidad.
          </CardDescription>
        </CardHeader>
      </Card>

      <section aria-labelledby="rbac-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 id="rbac-heading" className="text-lg font-medium">
            Matriz de Roles y Permisos (RBAC + RLS)
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STAFF_ROLES.map((role) => {
            const permissions = getPermissionsForRole(role);
            const info = ROLE_LABELS[role];
            return (
              <Card key={role}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{info.title}</CardTitle>
                    <Lock
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <CardDescription>{info.summary}</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Permisos activos ({permissions.length})
                  </p>
                  <ul className="space-y-1 font-mono text-xs text-muted-foreground">
                    {permissions.map((perm) => (
                      <li key={perm}>• {perm}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
