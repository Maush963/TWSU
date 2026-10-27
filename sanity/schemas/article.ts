import { defineArrayMember, defineField, defineType } from "sanity";
import { ATLAS_SLOTS_PER_CATEGORY, CATEGORIES } from "../../src/lib/constants";

const categoryOptions = {
  list: CATEGORIES.map(({ value, title }) => ({ value, title })),
  layout: "grid" as const,
};

const altField = defineField({
  name: "alt",
  title: "Texto alternativo",
  type: "string",
  validation: (rule) => rule.required(),
});

interface ArticleDraft {
  _id?: string;
  year?: number;
  categories?: string[];
  inAtlas?: boolean;
}

export const article = defineType({
  name: "article",
  title: "Artículo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cover",
      title: "Portada",
      type: "image",
      options: { hotspot: true },
      fields: [altField],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Descripción corta",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "body",
      title: "Texto",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Título 2", value: "h2" },
            { title: "Título 3", value: "h3" },
          ],
        }),
        defineArrayMember({ type: "image", fields: [altField] }),
      ],
    }),
    defineField({
      name: "place",
      title: "Lugar",
      type: "reference",
      to: [{ type: "place" }],
      description: "Obligatorio si el artículo ocupa un lugar en el atlas.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const { inAtlas } = (context.document ?? {}) as ArticleDraft;
          if (inAtlas && !value) {
            return "El lugar es obligatorio si el artículo aparece en el atlas.";
          }
          return true;
        }),
    }),
    defineField({
      name: "categories",
      title: "Categorías",
      type: "array",
      of: [{ type: "string" }],
      options: categoryOptions,
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "inAtlas",
      title: "Aparece en el atlas",
      description: "Ocupa un lugar del atlas en cada una de sus categorías. Requiere lugar.",
      type: "boolean",
      initialValue: false,
      validation: (rule) =>
        rule
          .custom(async (value, context) => {
            const { _id, year, categories = [] } = (context.document ?? {}) as ArticleDraft;
            if (!value || typeof year !== "number") return true;
            const client = context.getClient({ apiVersion: "2025-01-01" });
            const publishedId = (_id ?? "").replace(/^drafts\./, "");
            const full: string[] = [];
            for (const key of categories) {
              const count = await client.fetch<number>(
                `count(*[_type == "article" && !(_id in path("drafts.**")) && _id != $id && year == $year && inAtlas == true && $key in categories])`,
                { id: publishedId, year, key },
              );
              if (count >= ATLAS_SLOTS_PER_CATEGORY) full.push(key);
            }
            return full.length === 0
              ? true
              : `El año ${year} ya tiene ${ATLAS_SLOTS_PER_CATEGORY} lugares en: ${full.join(", ")}`;
          })
          .warning(),
    }),
    defineField({
      name: "year",
      title: "Año",
      type: "number",
      initialValue: () => new Date().getFullYear(),
      validation: (rule) => rule.required().integer().min(2000),
    }),
    defineField({
      name: "featured",
      title: "Destacado",
      type: "boolean",
      description: "Si hay varios, gana el de publicación más reciente.",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "isSeed", title: "Dato de prueba", type: "boolean", hidden: true }),
  ],
  preview: {
    select: { title: "title", media: "cover", year: "year" },
    prepare: ({ title, media, year }) => ({ title, media, subtitle: year ? String(year) : undefined }),
  },
});
