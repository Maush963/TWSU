import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";
import { resolveDocumentActions } from "./sanity/actions";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "default",
  title: "TWSU",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  document: { actions: resolveDocumentActions },
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates,
      {
        id: "article-atlas",
        title: "Artículo del atlas",
        schemaType: "article",
        parameters: [{ name: "category", type: "string" }],
        value: ({ category }: { category?: string }) => ({
          inAtlas: true,
          categories: category ? [category] : [],
          year: new Date().getFullYear(),
          publishedAt: new Date().toISOString(),
        }),
      },
    ],
  },
});
