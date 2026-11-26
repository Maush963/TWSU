import { useClient, useDocumentOperation, type DocumentActionComponent, type DocumentActionsResolver } from "sanity";

/** "Qué bonito: México 2026!" -> "que-bonito-mexico-2026". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

// Al publicar un artículo sin slug, se genera del título. Si ya existe otro con el mismo, se le
// agrega -2, -3... Una vez puesto no cambia aunque cambie el título, para no romper enlaces.
function withAutoSlug(publish: DocumentActionComponent): DocumentActionComponent {
  const Action: DocumentActionComponent = (props) => {
    const client = useClient({ apiVersion: "2025-01-01" });
    const { patch } = useDocumentOperation(props.id, props.type);
    const original = publish(props);
    if (!original) return original;

    return {
      ...original,
      onHandle: async () => {
        const draft = props.draft as { title?: string; slug?: { current?: string } } | null;
        if (draft?.title && !draft.slug?.current) {
          const base = slugify(draft.title) || "articulo";
          const publishedId = props.id.replace(/^drafts\./, "");
          let slug = base;
          for (let n = 2; ; n += 1) {
            const taken = await client.fetch<number>(
              `count(*[_type == "article" && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
              { slug, id: publishedId },
            );
            if (taken === 0) break;
            slug = `${base}-${n}`;
          }
          patch.execute([{ set: { slug: { _type: "slug", current: slug } } }]);
        }
        original.onHandle?.();
      },
    };
  };
  Action.action = "publish";
  return Action;
}

export const resolveDocumentActions: DocumentActionsResolver = (prev, context) =>
  context.schemaType === "article"
    ? prev.map((action) => (action.action === "publish" ? withAutoSlug(action) : action))
    : prev;
