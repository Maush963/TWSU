import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { serverEnv } from "@/lib/env.server";

// Tipos de documento que el sitio guarda en caché con su propia etiqueta.
const TAGGED_TYPES = ["article", "place"];

interface WebhookBody {
  _type?: string;
  slug?: string | null;
}

export async function POST(request: NextRequest) {
  let parsed;
  try {
    parsed = await parseBody<WebhookBody>(request, serverEnv.SANITY_REVALIDATE_SECRET);
  } catch {
    // parseBody lanza si el cuerpo no es JSON.
    return NextResponse.json({ ok: false, message: "Cuerpo inválido" }, { status: 400 });
  }
  const { isValidSignature, body } = parsed;

  if (!isValidSignature) {
    return NextResponse.json({ ok: false, message: "Firma inválida" }, { status: 401 });
  }
  if (!body?._type || !TAGGED_TYPES.includes(body._type)) {
    return NextResponse.json({ ok: false, message: "Falta un _type válido" }, { status: 400 });
  }

  // `expire: 0` descarta lo guardado: la primera visita después de publicar ya ve el cambio.
  revalidateTag(body._type, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: [body._type] });
}
