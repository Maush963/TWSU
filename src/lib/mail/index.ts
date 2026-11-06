import "server-only";
import { serverEnv } from "@/lib/env.server";
import { selectMailProvider } from "./provider";
import type { MailProvider } from "./types";

export type { MailProvider, MailResult } from "./types";

/** Proveedor de correo configurado con las variables del servidor. */
export function getMailProvider(): MailProvider {
  return selectMailProvider({
    apiKey: serverEnv.MAIL_API_KEY,
    listId: serverEnv.MAIL_LIST_ID,
    serverPrefix: serverEnv.MAIL_SERVER_PREFIX,
  });
}
