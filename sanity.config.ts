import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  name: "default",
  title: "TWSU",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
  document: {
    // Los editores no crean lugares; los agrega el equipo con el seed.
    newDocumentOptions: (prev) => prev.filter((option) => option.templateId !== "place"),
  },
});
