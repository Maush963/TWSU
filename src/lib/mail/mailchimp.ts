import { readField, sendMailRequest } from "./request";
import type { FetchLike, MailProvider } from "./types";

export function createMailchimpProvider(
  apiKey: string,
  listId: string,
  serverPrefix: string,
  fetchImpl: FetchLike = fetch,
): MailProvider {
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${encodeURIComponent(listId)}/members`;
  return {
    subscribe: (email) =>
      sendMailRequest(fetchImpl, {
        url,
        init: {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`twsu:${apiKey}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_address: email, status: "subscribed" }),
        },
        isAlreadyRegistered: (body) => readField(body, "title") === "Member Exists",
      }),
  };
}
