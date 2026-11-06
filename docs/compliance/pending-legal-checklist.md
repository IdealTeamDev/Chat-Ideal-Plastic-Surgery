# Registro Permanente de Pendientes Jurídicos y Privacidad (Ley 1581 de 2012 — Colombia)

> [!IMPORTANT]
> **BLOQUEADOR PREVIO A PRODUCCIÓN (FASE 9):**
> Por acuerdo del proyecto, el desarrollo técnico avanza con textos y parámetros provisionales claramente marcados (`1.0.0-draft`), pero **no se debe salir a producción con pacientes reales** sin completar y reemplazar todos los puntos de esta lista con el documento validado por asesoría jurídica.

## Estado actual de decisiones ya definidas

- [x] **Creación cerrada de usuarios internos:** Registro público deshabilitado; cuentas creadas únicamente por invitación administrativa.
- [x] **Minimización de datos al iniciar chat:** El visitante puede escribir su consulta aceptando la autorización de tratamiento de datos personales para atención, sin obligarlo a entregar teléfono/correo salvo que sea necesario para seguimiento.
- [x] **Separación de finalidades:** Casilla obligatoria para *Atención de la solicitud* separada de la casilla opcional para *Contacto comercial / marketing* (desmarcada por defecto).
- [x] **Cero transferencia a IA en v1:** No se envían conversaciones ni datos personales a OpenAI ni otros proveedores de modelos de lenguaje.

## Elementos pendientes de entrega por el área jurídica (revisar antes de Fase 8 / Fase 9)

- [ ] **1. Razón social exacta, NIT, domicilio y datos de contacto del Responsable del Tratamiento** (Ideal Plastic Surgery).
- [ ] **2. URL pública definitiva y versión oficial de la Política de Tratamiento de Datos Personales** (para reemplazar `CURRENT_PRIVACY_POLICY_VERSION = "1.0.0-draft"` en `src/modules/privacy/consent.ts`).
- [ ] **3. Texto definitivo del Aviso de Privacidad y de la cláusula de autorización previa, expresa e informada** en el widget.
- [ ] **4. Cláusula específica sobre datos sensibles relativos a la salud** (Art. 5 y 6 Ley 1581 de 2012 y Decreto 1377 de 2013), advirtiendo que el chat es orientativo/administrativo, no constituye consulta médica ni historia clínica, y que suministrar datos sensibles es facultativo.
- [ ] **5. Canal oficial para ejercicio de derechos de Habeas Data** (consulta, actualización, rectificación, revocatoria de autorización y supresión).
- [ ] **6. Plazo oficial de conservación/retención y anonimización o borrado seguro de conversaciones** (ej. 12, 24 o 36 meses tras el cierre).
- [ ] **7. Revisión de transferencia/transmisión internacional de datos** hacia los encargados tecnológicos de infraestructura (**Supabase Inc.** y **Vercel Inc.** en EE. UU.).
