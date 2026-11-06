import { z } from "zod";

/**
 * Separación arquitectónica obligatoria (`chatbot-architecture`):
 * - `status`: ciclo de vida administrativo de la conversación.
 * - `mode`: estado operativo de enrutamiento (en v1 solo humano/cola, SIN IA).
 */
export const CONVERSATION_STATUSES = ["open", "pending", "resolved"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const CONVERSATION_MODES = ["queued", "human"] as const;
export type ConversationMode = (typeof CONVERSATION_MODES)[number];

export const MESSAGE_SENDER_TYPES = ["visitor", "agent", "system"] as const;
export type MessageSenderType = (typeof MESSAGE_SENDER_TYPES)[number];

/**
 * Respuesta automática determinística predefinida (sin IA) requerida en Sección 6.
 */
export const DEFAULT_AUTO_ACK_MESSAGE =
  "¡Gracias por escribirnos! Hemos recibido tu mensaje. Uno de nuestros asesores te atenderá en cuanto esté disponible.";

export const incomingVisitorMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío.")
    .max(2000, "El mensaje supera el límite permitido de 2000 caracteres."),
  clientMessageId: z.uuid({
    message: "clientMessageId debe ser un UUID válido para garantizar idempotencia.",
  }),
});

export type IncomingVisitorMessageInput = z.infer<
  typeof incomingVisitorMessageSchema
>;
