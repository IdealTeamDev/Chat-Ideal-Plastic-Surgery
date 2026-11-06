import type { Metadata } from "next";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_AUTO_ACK_MESSAGE } from "@/modules/conversations/types";
import { CURRENT_PRIVACY_POLICY_VERSION } from "@/modules/privacy/consent";

export const metadata: Metadata = {
  title: "Widget de Atención al Paciente",
};

export default function WidgetPage() {
  return (
    <main className="flex min-h-dvh w-full items-end justify-end bg-transparent p-3 sm:p-5">
      <Card className="w-full max-w-md overflow-hidden border-border/80 shadow-xl">
        <CardHeader className="bg-slate-900 text-slate-50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold">
                  Ideal Plastic Surgery
                </CardTitle>
                <p className="text-xs text-slate-300">
                  Atención personalizada con asesores humanos
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-500/20 text-emerald-200"
            >
              Fase 1 Base
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 text-sm">
          <div className="rounded-lg border bg-muted/50 p-3 text-muted-foreground">
            <p className="font-medium text-foreground">
              ¡Bienvenido(a) a nuestro canal oficial de orientación!
            </p>
            <p className="mt-1 text-xs leading-relaxed">
              Este canal brinda orientación administrativa e informativa. No
              reemplaza una valoración médica presencial ni constituye historia
              clínica.
            </p>
          </div>

          <div className="rounded-lg border border-dashed p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mensaje automático predefinido (sin IA)
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">
              “{DEFAULT_AUTO_ACK_MESSAGE}”
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">
                Protección de Datos Personales (Ley 1581 de 2012)
              </p>
              <p className="mt-0.5">
                Consentimiento separado de atención y marketing · Versión de
                política base:{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  {CURRENT_PRIVACY_POLICY_VERSION}
                </code>
                . La sesión interactiva de visitante se activa en Fase 3 tras
                conectar Supabase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
