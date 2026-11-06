import { readField, sendMailRequest } from "./request";
import type { FetchLike, MailProvider } from "./types";

const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

export function createBrevoProvider(apiKey: string, listId: string, fetchImpl: FetchLike = fetch): MailProvider {
  return {
    subscribe: (email) =>
      sendMailRequest(fetchImpl, {
        url: BREVO_CONTACTS_URL,
        init: {
          method: "POST",
          headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
          // `updateEnabled` hace que un contacto existente se actualice en lugar de dar error.
          body: JSON.stringify({ email, listIds: [Number(listId)], updateEnabled: true }),
        },
        isAlreadyRegistered: (body) => readField(body, "code") === "duplicate_parameter",
      }),
  };
}
