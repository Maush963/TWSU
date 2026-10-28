import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { uiText } from "@/content/ui-text";
import { getAtlasPins } from "@/lib/data/atlas";
import { parseAtlasFilters } from "@/lib/filters";

export const metadata: Metadata = { title: uiText.atlas.title };

// Temporal: lista simple de puntos. El mapa es de la Fase 1.
async function AtlasPoints({ searchParams }: { searchParams: PageProps<"/atlas">["searchParams"] }) {
  const pins = await getAtlasPins(parseAtlasFilters(await searchParams));
  if (pins.length === 0) return <p className="text-muted">{uiText.atlas.empty}</p>;
  return (
    <ul>
      {pins.map((pin) => (
        <li key={pin.id}>
          <Link href={`/perspectives/${pin.slug}`}>{pin.title}</Link>
          <span className="text-muted"> {pin.placeName}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AtlasPage({ searchParams }: PageProps<"/atlas">) {
  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.atlas.title}</h1>
      <Suspense>
        <AtlasPoints searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
