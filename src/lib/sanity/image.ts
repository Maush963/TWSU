import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { publicEnv } from "@/lib/env";

const builder = createImageUrlBuilder({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
