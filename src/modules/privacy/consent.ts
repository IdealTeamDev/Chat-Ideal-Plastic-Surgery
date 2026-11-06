import { z } from "zod";

/**
 * Finalidades separadas conforme a la Ley 1581 de 2012 (Colombia):
 * - `customer_support`: gestión y atención de la solicitud iniciada por el visitante.
 * - `commercial_contact`: envío posterior de información promocional/comercial (opcional).
 */
export const CONSENT_PURPOSES = [
  "customer_support",
  "commercial_contact",
] as const;
export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

/**
 * Versión inicial en borrador técnico; debe actualizarse con la versión oficial
 * aprobada por revisión jurídica antes de salir a producción.
 */
export const CURRENT_PRIVACY_POLICY_VERSION = "1.0.0-draft";

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined));

export const visitorConsentAndIntakeSchema = z.object({
  name: optionalTrimmedString(80),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined))
    .refine((val) => !val || z.email().safeParse(val).success, {
      message: "Ingresa un correo electrónico válido.",
    }),
  phone: optionalTrimmedString(25),
  supportConsentAccepted: z.literal(true, {
    error:
      "Debes aceptar la política de tratamiento de datos para atender tu consulta.",
  }),
  commercialConsentAccepted: z.boolean().default(false),
  policyVersion: z.string().trim().min(1).default(CURRENT_PRIVACY_POLICY_VERSION),
});

export type VisitorConsentAndIntakeInput = z.infer<
  typeof visitorConsentAndIntakeSchema
>;
