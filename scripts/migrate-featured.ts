import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

// Pasa el esquema anterior (`homeFeatured`: "large" | "small" | "none") al de interruptores:
// `homeLarge1`, `homeLarge2` y `perspectivesFeatured`, cada uno en un solo artículo (el más
// reciente que lo tenía). Los pequeños ya no se marcan: son los más recientes. Se puede repetir.
interface Doc { _id: string; publishedAt?: string; homeFeatured?: string; perspectivesFeatured?: boolean }

async function main() {
  const published = await client.fetch<Doc[]>(
    `*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc){_id, publishedAt, homeFeatured, perspectivesFeatured}`,
  );
  const large = published.filter((d) => d.homeFeatured === "large").slice(0, 2);
  const persp = published.find((d) => d.perspectivesFeatured === true);

  const tx = client.transaction();
  for (const doc of published) {
    const values = {
      homeLarge1: large[0]?._id === doc._id,
      homeLarge2: large[1]?._id === doc._id,
      perspectivesFeatured: persp?._id === doc._id,
    };
    for (const id of [doc._id, `drafts.${doc._id}`]) {
      const exists = id === doc._id || (await client.fetch<number>(`count(*[_id == $id])`, { id })) > 0;
      if (exists) tx.patch(id, (p) => p.set(values).unset(["homeFeatured", "featured", "featuredIn"]));
    }
  }
  await tx.commit();
  console.log(`${published.length} artículos migrados. Grandes: ${large.length}. Perspectives: ${persp ? 1 : 0}.`);
}
main().catch((e: unknown) => { console.error(e); process.exitCode = 1; });
