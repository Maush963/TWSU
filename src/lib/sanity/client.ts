import "server-only";
import { createClient, type QueryParams } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import { publicEnv } from "@/lib/env";

const client = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  useCdn: false,
  perspective: "published",
});

/**
 * Única puerta de entrada a Sanity. Con Cache Components la caché se declara con
 * `use cache`: el resultado se guarda hasta que el webhook invalida sus etiquetas
 * (`article`, `place`) con `revalidateTag`. No hay revalidación por tiempo.
 * Si Next vuelve a cambiar la API de caché, se ajusta aquí y en ningún otro lugar.
 */
export async function sanityFetch<T>(query: string, params: QueryParams, tags: string[]): Promise<T> {
  "use cache";
  cacheLife("max");
  cacheTag(...tags);
  return client.fetch<T>(query, params);
}
