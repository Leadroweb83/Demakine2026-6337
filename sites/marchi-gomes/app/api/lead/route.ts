import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { leadSchema } from "@/lib/lead";
import { site } from "@/content/site";

export const runtime = "nodejs";

/** Uma linha so: evita quebra de cabecalho em e-mail. */
const oneLine = (v: string) => v.replace(/[\r\n]+/g, " ").trim();

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }
  const { company: _honeypot, turnstileToken, ...lead } = parsed.data;

  // Anti-spam: com a chave secreta configurada, o envio so passa com token valido
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: turnstileToken ?? "" }),
    }).then((r) => r.json() as Promise<{ success?: boolean }>).catch(() => ({ success: false }));
    if (!check.success) {
      return NextResponse.json({ ok: false, error: "Verificação de segurança falhou." }, { status: 400 });
    }
  }
  const payload = {
    ...lead,
    source: "site",
    page: req.headers.get("referer") ?? "",
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  const env = process.env;
  // Destino dos contatos: por padrao o e-mail geral do escritorio.
  const notify = env.LEAD_NOTIFY_EMAIL || site.contact.email;

  /**
   * Envio de e-mail, em ordem de preferencia:
   * 1) SMTP da propria hospedagem (SMTP_HOST, SMTP_USER, SMTP_PASS), sem servico externo;
   * 2) Resend (RESEND_API_KEY + LEAD_FROM_EMAIL).
   */
  const smtp = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 465),
        secure: (env.SMTP_SECURE ?? "true") !== "false",
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        connectionTimeout: 10_000,
        socketTimeout: 15_000,
      })
    : null;
  const resend = env.RESEND_API_KEY && env.LEAD_FROM_EMAIL ? { key: env.RESEND_API_KEY, from: env.LEAD_FROM_EMAIL } : null;
  const canEmail = Boolean(smtp || resend);

  const send = async (to: string, subject: string, text: string, replyTo?: string): Promise<boolean> => {
    if (smtp) {
      const from = `"${site.name}" <${env.SMTP_FROM || env.SMTP_USER}>`;
      return smtp.sendMail({ from, to, subject: oneLine(subject), text, ...(replyTo ? { replyTo } : {}) })
        .then(() => true).catch((e) => { console.error("[lead:smtp]", e?.message ?? e); return false; });
    }
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${resend!.key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: resend!.from, to, subject: oneLine(subject), text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    }).then((r) => r.ok).catch(() => false);
  };

  // O lead precisa chegar a pelo menos um destino: webhook (CRM) ou e-mail do escritorio.
  const deliveries: Promise<boolean>[] = [];
  if (webhook) {
    deliveries.push(
      fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
        .then((r) => r.ok).catch(() => false),
    );
  }
  if (canEmail) {
    const origin = Object.entries(lead.attribution ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n");
    deliveries.push(send(notify, `Novo contato pelo site: ${lead.name}`,
      `Nome: ${lead.name}\nTelefone: ${lead.phone}\nE-mail: ${lead.email || "-"}\nAssunto: ${lead.area}\nDia preferido: ${lead.preferredDate || "-"}\n\nMensagem:\n${lead.message || "-"}\n\nOrigem:\n${origin || "-"}\n\nPara responder, use o botao Responder (vai para ${lead.email || "o telefone informado"}).`,
      lead.email || undefined));
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
