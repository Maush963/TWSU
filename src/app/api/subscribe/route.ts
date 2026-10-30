import { NextResponse } from "next/server";
import { isSpam } from "@/lib/forms/antispam";
import { getClientKey } from "@/lib/forms/client-ip";
import { createRateLimiter } from "@/lib/forms/rate-limit";
import { subscribeSchema } from "@/lib/forms/schemas";

const limiter = createRateLimiter();

export async function POST(request: Request) {
  if (!limiter.allow(getClientKey(request.headers))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Respuesta genérica: un envío descartado se ve igual que uno normal.
  if (isSpam(parsed.data, Date.now())) {
    return NextResponse.json({ ok: true });
  }

  // TODO 3.3: enviar el correo al proveedor (Mailchimp o Brevo).
  return NextResponse.json({ ok: true });
}
