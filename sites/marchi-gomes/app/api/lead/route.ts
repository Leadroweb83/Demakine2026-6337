import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }
  const { company: _honeypot, ...lead } = parsed.data;
  const payload = {
    ...lead,
    source: "site",
    page: req.headers.get("referer") ?? "",
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    // Sem destino configurado o lead se perderia: em producao, avisa o visitante.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, error: "Canal indisponível." }, { status: 503 });
    }
    console.info("[lead:dev]", payload);
    return NextResponse.json({ ok: true });
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!res?.ok) {
    return NextResponse.json({ ok: false, error: "Falha no envio." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
