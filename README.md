# Chat Ideal Plastic Surgery

Plataforma web propia de atención al cliente en tiempo real y consola operativa de call center (2 a 5 agentes), construida con **Next.js (App Router + TypeScript)**, **Tailwind CSS + shadcn/ui**, **Supabase (PostgreSQL + Auth + Realtime)** y **Vercel**.

> **Nota sobre Inteligencia Artificial:** En esta versión v1 **no se utiliza IA** (sin SDKs de OpenAI, sin claves de LLMs ni costos por tokens). Toda atención es humana con acuse automático determinístico predefinido, manteniendo una arquitectura modular preparada para futuras extensiones autorizadas.

---

## Arquitectura del proyecto

El sistema se divide en tres superficies independientes dentro de un único repositorio Next.js:

- **Área A — Widget público (`/widget`):** Interfaz ligera, responsive y embebible en **WordPress** y **Framer** mediante script + `iframe` con validación estricta de orígenes (`CSP frame-ancestors` y `postMessage`).
- **Área B — Dashboard privado (`/dashboard`):** Consola interna para **Administradores**, **Supervisores** y **Agentes** (protegida contra clickjacking con `frame-ancestors 'none'` y `X-Frame-Options: DENY`).
- **Área C — Backend (`/api/*`):** Endpoints validados con **Zod**, sesiones separadas para staff (Supabase Auth + RLS) y visitantes (token opaco de alta entropía), y PostgreSQL como fuente de verdad previa a Realtime.

Documentación adicional:
- [Resumen de Arquitectura](docs/architecture/overview.md)
- [Modelo de Amenazas y Privacidad (Ley 1581 de 2012)](docs/security/threat-model.md)
- [Guía de Migraciones SQL](supabase/migrations/README.md)

---

## Requisitos previos

- **Node.js** `>= 22` (probado en `v24.x`)
- **npm** `>= 10`

## Instalación y ejecución local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear archivo local de entorno a partir de la plantilla (nunca versionado en Git):
   ```bash
   cp .env.example .env.local
   ```
3. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador:
   - Portal de estado: `http://localhost:3000`
   - Vista base del widget: `http://localhost:3000/widget`
   - Vista base del dashboard: `http://localhost:3000/dashboard`
   - Health check del backend: `http://localhost:3000/api/health`

## Verificación de calidad y seguridad

```bash
npm run typecheck   # Verificación estricta de tipos TypeScript
npm run lint        # Análisis estático con ESLint
npm run test        # Pruebas unitarias y negativas de seguridad (Vitest)
npm run build       # Compilación de producción de Next.js
```
