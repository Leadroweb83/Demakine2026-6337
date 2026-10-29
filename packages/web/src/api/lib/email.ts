/**
 * Envio de e-mail pela API do Resend (https://resend.com).
 * Sem RESEND_API_KEY o envio é pulado e só registrado no log: o site segue funcionando.
 * EMAIL_FROM precisa ser de um domínio verificado no Resend, ex.: "Demakine <avisos@demakine.com.br>".
 */
export type EmailResult = { sent: boolean; reason?: string };

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(input: { to: string[]; subject: string; html: string; replyTo?: string }): Promise<EmailResult> {
  const to = [...new Set(input.to.map((t) => t.trim().toLowerCase()).filter((t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)))];
  if (!to.length) return { sent: false, reason: "sem destinatário" };
  if (!emailConfigured()) {
    console.info(`[email] não enviado (serviço não configurado): ${input.subject}`);
    return { sent: false, reason: "serviço de e-mail não configurado" };
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to,
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] falha ${res.status}: ${body.slice(0, 300)}`);
      return { sent: false, reason: `falha no envio (${res.status})` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] erro", err);
    return { sent: false, reason: "erro de conexão com o serviço de e-mail" };
  }
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Layout simples, com estilos inline (clientes de e-mail ignoram CSS externo). */
export function emailLayout(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#0f1b2d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0b2553;padding:18px 24px;color:#ffffff;font-weight:bold;font-size:16px">Demakine · Painel</td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 14px;font-size:20px;line-height:1.3">${esc(title)}</h1>
${body}
${cta ? `<p style="margin:22px 0 0"><a href="${esc(cta.url)}" style="display:inline-block;background:#1146b8;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px;font-size:13px">${esc(cta.label)}</a></p>` : ""}
</td></tr>
<tr><td style="padding:14px 24px;background:#f4f6f9;color:#6b7686;font-size:11.5px">Aviso automático do painel da Demakine. Para mudar quem recebe, acesse Avisos por e-mail no painel.</td></tr>
</table></td></tr></table></body></html>`;
}

/** Tabela de campos "rótulo: valor", pulando os vazios. */
export function emailFields(rows: [string, unknown][]) {
  const shown = rows.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse">${shown
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 0;color:#6b7686;width:34%;vertical-align:top;border-bottom:1px solid #eef1f5">${esc(k)}</td><td style="padding:7px 0;vertical-align:top;border-bottom:1px solid #eef1f5">${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;
}

export { esc as escapeHtml };
