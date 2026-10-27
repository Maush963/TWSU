import type { Metadata } from "next";
import { Suspense } from "react";
import { uiText } from "@/content/ui-text";

export const metadata: Metadata = { title: uiText.atlas.title };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Temporal: se reemplaza por los parsers de filtros en la tarea 0.10.
async function DebugParams({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <pre className="text-sm text-muted">
      {uiText.atlas.debugParams}: {JSON.stringify(params)}
    </pre>
  );
}

export default function AtlasPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.atlas.title}</h1>
      <p className="text-muted">{uiText.common.placeholderContent}</p>
      <Suspense>
        <DebugParams searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
