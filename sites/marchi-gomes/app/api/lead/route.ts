import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead";
import { site } from "@/content/site";

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
  const { RESEND_API_KEY: resendKey, LEAD_FROM_EMAIL: from, LEAD_NOTIFY_EMAIL: notify } = process.env;
  const canEmail = Boolean(resendKey && from);

  const send = (to: string, subject: string, text: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${resendKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    }).then((r) => r.ok).catch(() => false);

  // O lead precisa chegar a pelo menos um destino: webhook (CRM) ou e-mail do escritorio.
  const deliveries: Promise<boolean>[] = [];
  if (webhook) {
    deliveries.push(
      fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
        .then((r) => r.ok).catch(() => false),
    );
  }
  if (canEmail && notify) {
    const origin = Object.entries(lead.attribution ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n");
    deliveries.push(send(notify, `Novo contato pelo site: ${lead.name}`,
      `Nome: ${lead.name}\nTelefone: ${lead.phone}\nE-mail: ${lead.email || "-"}\nAssunto: ${lead.area}\nDia preferido: ${lead.preferredDate || "-"}\n\nMensagem:\n${lead.message || "-"}\n\nOrigem:\n${origin || "-"}`));
  }

  if (deliveries.length === 0) {
    // Sem destino configurado o lead se perderia: em producao, avisa o visitante.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, error: "Canal indisponível." }, { status: 503 });
    }
    console.info("[lead:dev]", payload);
    return NextResponse.json({ ok: true });
  }

  const results = await Promise.all(deliveries);
  if (!results.some(Boolean)) {
    return NextResponse.json({ ok: false, error: "Falha no envio." }, { status: 502 });
  }

  // Confirmacao ao lead (so se ele informou e-mail). Falha aqui nao invalida o contato.
  if (canEmail && lead.email) {
    await send(lead.email, "Recebemos o seu contato | Marchi Gomes Advogados",
      `Olá, ${lead.name}.\n\nRecebemos a sua mensagem e a nossa equipe retornará o contato em horário comercial.\n\nSe preferir, fale conosco pelo WhatsApp: https://wa.me/${site.contact.whatsapp}\n\n${site.name}\n${site.contact.street}, ${site.contact.city} - ${site.contact.state}`);
  }
  return NextResponse.json({ ok: true });
}
