import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

// Pasa los campos viejos (`featured`, `featuredIn`) a `homeFeatured` (uno solo) y
// `perspectivesFeatured`. Antes de esto un destacado salía grande en la Home y en Perspectives.
// Se puede repetir sin problema.
async function main() {
  const docs = await client.fetch<{ _id: string; featured?: boolean; featuredIn?: string[] }[]>(
    `*[_type == "article" && (defined(featured) || defined(featuredIn))]{_id, featured, featuredIn}`,
  );
  const tx = client.transaction();
  for (const doc of docs) {
    const inHome = doc.featuredIn?.includes("home-large") ?? doc.featured === true;
    const small = doc.featuredIn?.includes("home-small") ?? false;
    const inPerspectives = doc.featuredIn?.includes("perspectives") ?? doc.featured === true;
    tx.patch(
      client
        .patch(doc._id)
        .set({ homeFeatured: inHome ? "large" : small ? "small" : "none", perspectivesFeatured: inPerspectives })
        .unset(["featured", "featuredIn"]),
    );
  }
  await tx.commit();
  console.log(`${docs.length} documentos migrados.`);
}
main().catch((e: unknown) => { console.error(e); process.exitCode = 1; });
