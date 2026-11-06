# Modelo de Amenazas y Privacidad Inicial (Fase 1)

Referencias normativas y técnicas aplicadas:
- **OWASP Application Security Verification Standard (ASVS v4.0.3 / v5)**
- **Ley Estatutaria 1581 de 2012 (Colombia)**, Decreto 1377 de 2013 y lineamientos de la Superintendencia de Industria y Comercio (SIC) sobre datos sensibles relativos a la salud.

---

## 1. Activos críticos a proteger

| Activo | Clasificación | Impacto en caso de compromiso |
| :--- | :--- | :--- |
| Consultas y mensajes de visitantes/pacientes | **Alto / Sensible** (potenciales datos de salud estética/cirugía plástica) | Exposición de intimidad del titular, sanciones regulatorias SIC, daño reputacional. |
| Datos de contacto de visitantes (`name`, `email`, `phone`) | **Medio-Alto (PII)** | Suplantación, spam no autorizado, incumplimiento de finalidad aceptada. |
| Credenciales y sesiones del staff (Admin, Supervisor, Agente) | **Crítico** | Acceso total a bandeja de conversaciones, reasignación maliciosa o fuga masiva de historiales. |
| Clave secreta de servidor (`SUPABASE_SECRET_KEY`) | **Crítico** | Omisión total de RLS (`BYPASSRLS`) en PostgreSQL. |
| Registros de consentimiento y auditoría (`consent_records`, `audit_logs`) | **Alto (Evidencia legal)** | Pérdida de prueba de autorización previa, expresa e informada ante auditorías. |

---

## 2. Actores y fronteras de confianza

1. **Visitante anónimo (Internet público -> `/widget` y `/api/widget/*`):**
   - *No confiable.* Nunca se confía en `conversation_id`, `visitor_id` ni en el encabezado `Origin`/`Referer` como prueba de identidad.
   - Se autentica exclusivamente mediante un **token de sesión opaco de alta entropía** emitido y verificado por el servidor, con expiración definida y rotación.
2. **Sitio anfitrión externo (WordPress / Framer -> `iframe /widget`):**
   - *Frontera cross-origin controlada.* Solo los dominios listados explícitamente en `WIDGET_ALLOWED_ORIGINS` pueden embeber `/widget` vía `Content-Security-Policy: frame-ancestors` y enviar eventos validados con igualdad estricta de `event.origin` en `postMessage`.
3. **Personal del Call Center (Agente / Supervisor / Administrador -> `/dashboard` y `/api/dashboard/*`):**
   - Autenticado con **Supabase Auth** mediante cookies `HttpOnly`, `Secure`, `SameSite=Lax`.
   - Autorizado en **doble capa**: verificación explícita en servidor (endpoint/acción) + **Row Level Security (RLS)** en PostgreSQL por `organization_id`, `role` y asignación.
   - Prohibido que un usuario modifique su propio `role` o `organization_id`.
4. **Backend Next.js (Route Handlers / Server Components):**
   - Único entorno autorizado para leer `SUPABASE_SECRET_KEY` y `VISITOR_SESSION_HMAC_SECRET`, aislado mediante el paquete `server-only`.

---

## 3. Controles implementados desde Fase 1

- **Aislamiento de secretos en tiempo de compilación:** `src/lib/supabase/admin.ts` y `src/lib/env/server.ts` importan `server-only` e impiden cualquier empaquetado accidental en el bundle del navegador.
- **Guardia anti-fuga en variables públicas:** el validador Zod rechaza automáticamente cualquier configuración donde `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` contenga prefijos de clave secreta (`sb_secret_` o `service_role`).
- **Cabeceras de seguridad diferenciadas por superficie (`src/proxy.ts` y `src/lib/security/headers.ts`):**
  - `/dashboard` y rutas generales: `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva.
  - `/widget`: `frame-ancestors 'self' <WIDGET_ALLOWED_ORIGINS>` (sin `X-Frame-Options` que bloquearía el embed legítimo en WordPress/Framer).
- **Cero IA / Cero transferencia a LLMs externos:** en v1 no existe integración con OpenAI ni envío de conversaciones o PII a proveedores de IA.
- **Sanitización de logs:** utilidad de registro seguro que redacta correos, teléfonos, tokens y claves antes de escribir en consola de servidor.

---

## 4. Riesgos específicos del sector (Cirugía Plástica — Datos Sensibles)

En el contexto de **Ideal Plastic Surgery**, los visitantes pueden mencionar voluntariamente antecedentes médicos, procedimientos quirúrgicos o condiciones de salud en el chat libre. Conforme al **Artículo 5 y 6 de la Ley 1581 de 2012**:
- Los datos relativos a la salud son **datos sensibles**.
- Ninguna actividad de atención inicial puede condicionarse a que el titular suministre datos sensibles si no son estrictamente indispensables.
- El widget debe advertir claramente que el chat es un canal informativo/orientativo y **no constituye consulta ni historia clínica médica**, solicitando autorización previa, expresa e informada separando:
  1. **Finalidad de atención de la consulta.**
  2. **Finalidad comercial/marketing (opcional y separada).**
