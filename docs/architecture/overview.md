# Arquitectura de la Plataforma — Chat Ideal Plastic Surgery

## 1. Visión general

Aplicación monolítica modular en **Next.js (App Router + TypeScript)** desplegada en **Vercel**, respaldada por **Supabase (PostgreSQL + Auth + Realtime)** como sistema de persistencia, identidad de agentes y notificación en tiempo real.

> **Estado de IA (v1):** Desactivada por diseño. No se incluyen SDKs, claves ni llamadas a proveedores de IA. El modelo de dominio conserva `conversation.mode` (`queued` | `human`) desacoplado de `conversation.status` (`open` | `pending` | `resolved`) para permitir evolución futura sin deuda técnica.

## 2. Tres áreas independientes en un único repositorio

```text
src/
├── app/
│   ├── (marketing-or-root)/page.tsx  # Estado general / portal interno de verificación
│   ├── widget/                       # ÁREA A: Widget público embebible (WordPress / Framer)
│   ├── dashboard/                    # ÁREA B: Consola privada para Agentes, Supervisores y Admins
│   └── api/                          # ÁREA C: Backend (Route Handlers validados con Zod)
│       └── health/route.ts           # Endpoint de salud sin exposición de secretos
├── components/
│   ├── ui/                           # Primitivas reutilizables (shadcn/ui)
│   ├── widget/                       # Componentes exclusivos del widget público
│   └── dashboard/                    # Componentes exclusivos del call center
├── modules/                          # Reglas de negocio y contratos de dominio desacoplados
│   ├── conversations/                # Estados, modos, asignaciones y validaciones
│   ├── auth/                         # Roles (admin, supervisor, agent) y matriz de permisos
│   └── privacy/                      # Consentimiento Ley 1581, minimización y retención
├── lib/
│   ├── env/                          # Validación Zod de variables públicas y de servidor
│   ├── security/                     # Cabeceras CSP/CORS, orígenes permitidos y logger sin PII
│   └── supabase/                     # Clientes Browser, Server SSR y Admin (server-only)
└── proxy.ts                          # Frontera de red Next.js 16 (cabeceras CSP y sesión SSR)
```

## 3. Principios arquitectónicos invariables

1. **PostgreSQL es la fuente de verdad:** Todo mensaje, evento o cambio de asignación se confirma primero en PostgreSQL antes de emitir notificaciones por Supabase Realtime.
2. **Desacoplamiento total del CMS:** El widget se integrará en WordPress y posteriormente en Framer mediante un script ligero (`loader.js`) que monta un `iframe` aislado apuntando a `/widget`, validando orígenes con `frame-ancestors` y `postMessage`.
3. **Autenticación separada para Staff y Visitantes:**
   - **Staff:** Supabase Auth + MFA (obligatorio para Administradores) + RLS por organización y rol.
   - **Visitantes:** Sesión anónima con token opaco firmado/hasheado validado en el servidor; nunca se usa el UUID de la conversación como credencial.
4. **Asignación atómica:** Selección del agente disponible con menor carga activa dentro de una transacción PostgreSQL para impedir colisiones entre múltiples asesores simultáneos.
