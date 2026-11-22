import { getCliClient } from "sanity/cli";
import cities from "./data/cities.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const CHUNK = 100;

// Carga las ciudades de scripts/data/cities.json (se generan con prepare-cities.py). Es seguro
// repetirlo: cada ciudad tiene un _id fijo y se reemplaza. No toca países ni artículos.
async function main() {
  const documents = cities.map(({ id, ...city }) => ({ ...city, _id: id, _type: "place" }));
  for (let start = 0; start < documents.length; start += CHUNK) {
    const transaction = client.transaction();
    for (const document of documents.slice(start, start + CHUNK)) transaction.createOrReplace(document);
    await transaction.commit();
  }
  console.log(`Listo: ${documents.length} ciudades cargadas.`);
}

main().catch((error: unknown) => {
  console.error("No se pudieron cargar las ciudades.", error);
  process.exitCode = 1;
});
