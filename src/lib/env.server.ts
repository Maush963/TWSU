import "server-only";
import { z } from "zod";
import { parseEnv } from "@/lib/parse-env";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optional = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const serverSchema = z.object({
  SANITY_API_READ_TOKEN: optional,
  SANITY_REVALIDATE_SECRET: z.string().min(1),
  MAIL_API_KEY: optional,
  MAIL_LIST_ID: optional,
  // Solo hace falta si se elige Mailchimp.
  MAIL_SERVER_PREFIX: optional,
  // Destino del formulario de Join, por confirmar.
  CONTACT_TO_EMAIL: optional,
});

export const serverEnv = parseEnv(serverSchema, process.env, "serverEnv");
