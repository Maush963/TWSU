import { getCliClient } from "sanity/cli";
import { ATLAS_SLOTS_PER_CATEGORY } from "../src/lib/constants";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");

interface AtlasArticle {
  _id: string;
  title: string;
  year: number;
  publishedAt: string | null;
  categories: string[] | null;
}

// Deja como máximo ATLAS_SLOTS_PER_CATEGORY artículos por categoría y año en el atlas. Los que
// sobran (los más antiguos) pasan a inAtlas = false: el artículo se conserva, solo sale del mapa.
// Sin `--apply` solo muestra qué haría.
async function main() {
  const articles = await client.fetch<AtlasArticle[]>(
    `*[_type == "article" && inAtlas == true && !(_id in path("drafts.**"))]{_id, title, year, publishedAt, categories}`,
  );
  const removed = new Map<string, AtlasArticle>();
  const years = [...new Set(articles.map((article) => article.year))];

  for (const year of years) {
    const inYear = articles
      .filter((article) => article.year === year)
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    const categories = [...new Set(inYear.flatMap((article) => article.categories ?? []))];
    // Se repite hasta que ninguna categoría pase del límite: quitar un artículo de dos llaves libera las dos.
    for (let changed = true; changed; ) {
      changed = false;
      for (const category of categories) {
        const kept = inYear.filter((article) => !removed.has(article._id) && article.categories?.includes(category));
        const extra = kept.slice(ATLAS_SLOTS_PER_CATEGORY);
        for (const article of extra) removed.set(article._id, article);
        if (extra.length > 0) changed = true;
      }
    }
  }

  for (const article of removed.values()) console.log(`${article.year}  ${article.title}  (${(article.categories ?? []).join(", ")})`);
  console.log(`${removed.size} artículos saldrían del atlas.`);
  if (!APPLY) return void console.log("Simulación. Corre de nuevo con -- --apply para aplicar.");

  const transaction = client.transaction();
  for (const article of removed.values()) transaction.patch(article._id, (patch) => patch.set({ inAtlas: false }));
  await transaction.commit();
  console.log("Listo.");
}

main().catch((error: unknown) => {
  console.error("No se pudo ajustar el atlas.", error);
  process.exitCode = 1;
});
