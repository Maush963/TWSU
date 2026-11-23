import { getCliClient } from "sanity/cli";
import { TITLE_MAX_LENGTH } from "../src/lib/constants";

const client = getCliClient({ apiVersion: "2025-01-01" });

// Lista los artículos cuyo título pasa del límite. No modifica nada.
async function main() {
  const articles = await client.fetch<{ _id: string; title: string }[]>(
    `*[_type == "article" && !(_id in path("drafts.**"))]{ _id, title }`,
  );
  const long = articles.filter((a) => a.title.length > TITLE_MAX_LENGTH);
  console.log(`${articles.length} artículos, ${long.length} con título de más de ${TITLE_MAX_LENGTH} caracteres.`);
  for (const a of long) console.log(`  ${a.title.length}: ${a.title}`);
}
main().catch((e: unknown) => { console.error(e); process.exitCode = 1; });
