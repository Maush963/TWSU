/** Por qué no se pudo registrar un correo. Nunca lleva datos del proveedor. */
export type MailFailureReason = "rejected" | "unavailable" | "timeout";

export type MailResult = { ok: true } | { ok: false; reason: MailFailureReason };

/** Lo único que el resto del código sabe del servicio de correo. */
export interface MailProvider {
  subscribe(email: string): Promise<MailResult>;
}

export type FetchLike = typeof fetch;

/** Variables del servidor que definen el proveedor. Todas son opcionales. */
export interface MailConfig {
  apiKey?: string;
  listId?: string;
  /** Solo Mailchimp, p. ej. `us21`. */
  serverPrefix?: string;
}
