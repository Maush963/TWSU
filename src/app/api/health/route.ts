import { connection } from "next/server";
import { NextResponse } from "next/server";

const VARIABLES = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_READ_TOKEN",
  "SANITY_REVALIDATE_SECRET",
  "MAIL_API_KEY",
  "MAIL_LIST_ID",
  "MAIL_SERVER_PREFIX",
  "CONTACT_TO_EMAIL",
  "NEXT_PUBLIC_GOOGLE_TAG_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
] as const;

// Solo informa si cada variable existe; nunca devuelve valores.
export async function GET() {
  await connection();
  const variables = Object.fromEntries(
    VARIABLES.map((name) => [name, Boolean(process.env[name])]),
  );
  return NextResponse.json({ ok: true, node: process.version, variables });
}
