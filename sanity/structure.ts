import type { StructureResolver } from "sanity/structure";
import { CATEGORIES } from "../src/lib/constants";

// Content
//   Artículo   (todos)
//   Lugar
//   Atlas      (los artículos que salen en el atlas)
//     Todos
//     Storytelling · Platforms · Campaigns · Branding · Social media
//
// Crear un artículo desde una de las listas del Atlas lo deja ya marcado "Aparece en el atlas" y
// con esa categoría (plantillas en `sanity.config.ts`).
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("article").title("Artículo"),
      S.documentTypeListItem("place").title("Lugar"),
      S.listItem()
        .id("atlas")
        .title("Atlas")
        .child(
          S.list()
            .title("Atlas")
            .items([
              S.listItem()
                .id("atlas-all")
                .title("Todos")
                .child(
                  S.documentList()
                    .id("atlas-all")
                    .title("Atlas: todos")
                    .schemaType("article")
                    .filter('_type == "article" && inAtlas == true')
                    .initialValueTemplates([S.initialValueTemplateItem("article-atlas")]),
                ),
              S.divider(),
              ...CATEGORIES.map(({ value, title }) =>
                S.listItem()
                  .id(`atlas-${value}`)
                  .title(title)
                  .child(
                    S.documentList()
                      .id(`atlas-${value}`)
                      .title(`Atlas: ${title}`)
                      .schemaType("article")
                      .filter('_type == "article" && inAtlas == true && $category in categories')
                      .params({ category: value })
                      .initialValueTemplates([S.initialValueTemplateItem("article-atlas", { category: value })]),
                  ),
              ),
            ]),
        ),
    ]);
