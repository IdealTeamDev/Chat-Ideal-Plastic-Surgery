# Migraciones SQL de Supabase

Este directorio almacena las migraciones SQL versionadas que definen el esquema PostgreSQL como **única fuente de verdad** del sistema.

## Convención de nombres

Cada migración debe nombrarse en orden cronológico UTC:

```text
YYYYMMDDHHMMSS_descripcion_corta.sql
```

Ejemplo (Fase 2):
- `20261106180000_init_core_schema.sql`
- `20261106180500_enable_rls_and_policies.sql`
- `20261106181000_atomic_assignment_functions.sql`

## Reglas obligatorias (Skills `chatbot-architecture` + `chatbot-security`)

1. **Claves primarias UUID (`gen_random_uuid()`)** y marcas de tiempo en UTC (`timestamptz`).
2. **Row Level Security (RLS) obligatorio** en toda tabla creada en el esquema `public` antes de exponer cualquier endpoint.
3. **Separación estricta de estado y modo en conversaciones:**
   - `status`: `open` | `pending` | `resolved`
   - `mode`: `queued` | `human` (preparado de forma extensible sin activar IA en v1)
4. **Operaciones atómicas:** la asignación automática/manual y la transferencia entre agentes se ejecutan en funciones transaccionales (`SELECT ... FOR UPDATE SKIP LOCKED`) para evitar condiciones de carrera.
5. **Cumplimiento Ley 1581 de 2012 (Colombia):** trazabilidad de consentimiento por finalidad y versión (`consent_records`), minimización de datos personales/sensibles y auditoría inmutable (`audit_logs`).
