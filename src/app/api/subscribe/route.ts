import { NextResponse } from "next/server";
import { z } from "zod";

const MIN_FILL_MS = 3000;

const bodySchema = z.object({
  email: z.email(),
  // Campo trampa: debe llegar vacío.
  website: z.string().optional().nullable(),
  startedAt: z.number().optional(),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { website, startedAt } = parsed.data;
  const isBot = Boolean(website);
  const isTooFast = typeof startedAt !== "number" || Date.now() - startedAt < MIN_FILL_MS;

  // Respuesta genérica: un envío descartado se ve igual que uno normal.
  if (isBot || isTooFast) {
    return NextResponse.json({ ok: true });
  }

  // TODO Fase 3: enviar el correo al proveedor (Mailchimp o Brevo).
  return NextResponse.json({ ok: true });
}
