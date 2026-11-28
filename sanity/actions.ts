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

// Interruptores de destacado: cada uno lo tiene un solo artículo a la vez.
const EXCLUSIVE_SWITCHES = ["perspectivesFeatured", "homeLarge1", "homeLarge2"] as const;

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
        const draft = props.draft as
          | ({ title?: string; slug?: { current?: string } } & Partial<Record<(typeof EXCLUSIVE_SWITCHES)[number], boolean>>)
          | null;
        const published = props.published as Partial<Record<(typeof EXCLUSIVE_SWITCHES)[number], boolean>> | null;
        const publishedId = props.id.replace(/^drafts\./, "");
        const ops: Record<string, unknown>[] = [];

        const on: Record<(typeof EXCLUSIVE_SWITCHES)[number], boolean> = {
          perspectivesFeatured: draft?.perspectivesFeatured === true,
          homeLarge1: draft?.homeLarge1 === true,
          homeLarge2: draft?.homeLarge2 === true,
        };

        // Un artículo no puede tener los dos grandes: se queda el que se acaba de encender.
        if (on.homeLarge1 && on.homeLarge2) {
          const only2IsNew = published?.homeLarge1 === true && published?.homeLarge2 !== true;
          const dropped = only2IsNew ? "homeLarge1" : "homeLarge2";
          on[dropped] = false;
          ops.push({ set: { [dropped]: false } });
        }

        // Lo que está encendido aquí se apaga en cualquier otro artículo (publicado o en borrador).
        for (const key of EXCLUSIVE_SWITCHES) {
          if (!on[key]) continue;
          const others = await client.fetch<string[]>(
            `*[_type == "article" && ${key} == true && !(_id in [$id, "drafts." + $id])]._id`,
            { id: publishedId },
          );
          if (others.length === 0) continue;
          const tx = client.transaction();
          for (const id of others) tx.patch(id, { set: { [key]: false } });
          await tx.commit();
        }

        if (draft?.title && !draft.slug?.current) {
          const base = slugify(draft.title) || "articulo";
          let slug = base;
          for (let n = 2; ; n += 1) {
            const taken = await client.fetch<number>(
              `count(*[_type == "article" && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
              { slug, id: publishedId },
            );
            if (taken === 0) break;
            slug = `${base}-${n}`;
          }
          ops.push({ set: { slug: { _type: "slug", current: slug } } });
        }
        if (ops.length > 0) patch.execute(ops as Parameters<typeof patch.execute>[0]);
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
