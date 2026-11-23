import { readFileSync, writeFileSync } from "node:fs";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const FILE = "scripts/data/places.json";
const names = new Intl.DisplayNames(["en"], { type: "region" });
// Nombres más comunes en inglés que difieren de los de Intl.
const OVERRIDES: Record<string, string> = {
  CD: "DR Congo", CG: "Republic of the Congo", CZ: "Czechia", MM: "Myanmar", HK: "Hong Kong", MO: "Macau",
  BQ: "Caribbean Netherlands", VA: "Vatican City", PS: "Palestine", FK: "Falkland Islands", TL: "Timor-Leste",
};

async function main() {
  const apply = process.argv.includes("--apply");
  const places = JSON.parse(readFileSync(FILE, "utf-8")) as { id: string; kind: string; countryCode: string; name: string }[];
  const changes = places
    .filter((p) => p.kind === "country")
    .map((p) => ({ id: p.id, from: p.name, to: OVERRIDES[p.countryCode] ?? names.of(p.countryCode) ?? p.name }))
    .filter((c) => c.from !== c.to);
  console.log(`${changes.length} países por renombrar`);
  changes.slice(0, 15).forEach((c) => console.log(`  ${c.from} -> ${c.to}`));
  if (!apply) return;
  for (const p of places) {
    const change = changes.find((c) => c.id === p.id);
    if (change) p.name = change.to;
  }
  writeFileSync(FILE, JSON.stringify(places, null, 2) + "\n", "utf-8");
  for (let i = 0; i < changes.length; i += 100) {
    const tx = client.transaction();
    for (const c of changes.slice(i, i + 100)) tx.patch(c.id, (patch) => patch.set({ name: c.to }));
    await tx.commit();
  }
  console.log("Listo.");
}
main().catch((e: unknown) => { console.error(e); process.exitCode = 1; });
