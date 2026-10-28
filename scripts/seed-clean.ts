import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

interface SeedArticle {
  _id: string;
  assetId?: string;
}

// Borra los artículos de prueba y las portadas que subió el seed. Los lugares se conservan.
async function main() {
  const articles = await client.fetch<SeedArticle[]>(
    `*[_type == "article" && isSeed == true]{_id, "assetId": cover.asset._ref}`,
  );
  const assetIds = [...new Set(articles.flatMap((article) => article.assetId ?? []))];

  if (articles.length > 0) {
    const transaction = client.transaction();
    for (const article of articles) transaction.delete(article._id);
    await transaction.commit();
  }

  // Solo se borran portadas que ya ningún documento usa.
  let removedAssets = 0;
  for (const assetId of assetIds) {
    const references = await client.fetch<number>(`count(*[references($id)])`, { id: assetId });
    if (references === 0) {
      await client.delete(assetId);
      removedAssets += 1;
    }
  }

  console.log(`Seed limpio: ${articles.length} artículos y ${removedAssets} imágenes eliminados.`);
}

main().catch((error: unknown) => {
  console.error("No se pudo limpiar el seed.", error);
  process.exitCode = 1;
});
