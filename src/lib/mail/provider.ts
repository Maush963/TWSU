import { createBrevoProvider } from "./brevo";
import { createMailchimpProvider } from "./mailchimp";
import type { FetchLike, MailConfig, MailProvider } from "./types";

/** Sin configuración no envía nada ni rompe el sitio; solo avisa, y solo en desarrollo. */
export function createNoopProvider(warn: (message: string) => void = console.warn): MailProvider {
  return {
    async subscribe() {
      if (process.env.NODE_ENV === "development") {
        warn("[mail] Sin MAIL_API_KEY y MAIL_LIST_ID: la suscripción no se envió a ningún lado.");
      }
      return { ok: true };
    },
  };
}

/** Elige el proveedor según las variables: con prefijo de servidor es Mailchimp, sin él Brevo. */
export function selectMailProvider(config: MailConfig, fetchImpl: FetchLike = fetch): MailProvider {
  const { apiKey, listId, serverPrefix } = config;
  if (!apiKey || !listId) return createNoopProvider();
  if (serverPrefix) return createMailchimpProvider(apiKey, listId, serverPrefix, fetchImpl);
  return createBrevoProvider(apiKey, listId, fetchImpl);
}
