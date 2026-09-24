import { and, eq, gte, inArray, isNotNull, isNull, lt } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { emailFields, emailLayout, escapeHtml, sendEmail } from "./email";

export type NotifySettings = {
  /** quem recebe cada lead novo do site */
  leadEmails: string[];
  /** quem recebe cada candidatura nova */
  applicationEmails: string[];
  /** quem recebe o relatório do mês no dia 1º */
  reportEmails: string[];
  /** cada responsável recebe às 8h os próprios retornos do dia */
  dailyFollowUps: boolean;
};

export const DEFAULT_NOTIFY: NotifySettings = {
  leadEmails: [],
  applicationEmails: [],
  reportEmails: [],
  dailyFollowUps: true,
};

export async function getNotifySettings(): Promise<NotifySettings> {
  const [row] = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, "notificacoes"));
  return { ...DEFAULT_NOTIFY, ...(row?.value as Partial<NotifySettings> | undefined) };
}

const panelUrl = () => `${(process.env.WEBSITE_URL ?? "https://www.demakine.com.br").replace(/\/$/, "")}/admin`;
const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;
const spDate = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

/** Não trava a resposta do formulário: no máximo alguns segundos e erro só vai para o log. */
export async function safely(task: () => Promise<unknown>) {
  try {
    await task();
  } catch (err) {
    console.error("[aviso] falhou", err);
  }
}

export async function notifyNewLead(lead: typeof schema.leads.$inferSelect) {
  const cfg = await getNotifySettings();
  if (!cfg.leadEmails.length) return;
  await sendEmail({
    to: cfg.leadEmails,
    replyTo: lead.email ?? undefined,
    subject: `Novo lead: ${lead.name}${lead.product ? ` · ${lead.product}` : ""}`,
    html: emailLayout(
      "Chegou um lead pelo site",
      emailFields([
        ["Nome", lead.name],
        ["Empresa", lead.company],
        ["Telefone", lead.phone],
        ["E-mail", lead.email],
        ["Cidade", lead.city],
        ["Interesse", lead.product],
        ["Origem", lead.source],
        ["Mensagem", lead.message],
        ["Fotos", lead.attachments ? "enviou fotos da peça (veja no painel)" : null],
      ]),
      { label: "Abrir no painel", url: panelUrl() },
    ),
  });
}

export async function notifyNewApplication(app: typeof schema.applications.$inferSelect, jobTitle: string | null) {
  const cfg = await getNotifySettings();
  if (!cfg.applicationEmails.length) return;
  await sendEmail({
    to: cfg.applicationEmails,
    subject: `Nova candidatura: ${app.name} · ${jobTitle ?? "banco de talentos"}`,
    html: emailLayout(
      "Chegou uma candidatura pelo site",
      emailFields([
        ["Vaga", jobTitle ?? "Banco de talentos"],
        ["Nome", app.name],
        ["WhatsApp", app.phone],
        ["E-mail", app.email],
        ["Cidade", app.city],
        ["Pretensão", app.salaryExpectation],
        ["Currículo", app.resumeKey ? "PDF anexado (abra no painel)" : "sem PDF, contou a experiência"],
        ["Mensagem", app.message],
      ]),
      { label: "Ver candidato no painel", url: panelUrl() },
    ),
  });
}

/** Retornos de hoje e atrasados de cada responsável, um e-mail por pessoa. */
export async function sendDailyFollowUps() {
  const cfg = await getNotifySettings();
  if (!cfg.dailyFollowUps) return { sent: 0 };
  const endOfToday = new Date(
    `${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())}T23:59:59-03:00`,
  );
  const due = await db
    .select()
    .from(schema.leads)
    .where(
      and(
        isNotNull(schema.leads.nextActionAt),
        isNotNull(schema.leads.ownerId),
        lt(schema.leads.nextActionAt, endOfToday),
        inArray(schema.leads.status, ["novo", "em_contato"]),
        isNull(schema.leads.deletedAt),
      ),
    );
  if (!due.length) return { sent: 0 };
  const owners = await db
    .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, active: schema.user.active })
    .from(schema.user)
    .where(inArray(schema.user.id, [...new Set(due.map((l) => l.ownerId!))]));
  let sent = 0;
  const now = Date.now();
  for (const o of owners) {
    if (o.active === false) continue;
    const mine = due.filter((l) => l.ownerId === o.id).sort((a, b) => a.nextActionAt!.getTime() - b.nextActionAt!.getTime());
    const late = mine.filter((l) => l.nextActionAt!.getTime() < now - 12 * 36e5).length;
    const list = mine
      .map(
        (l) =>
          `<li style="margin:0 0 10px"><b>${escapeHtml(l.name)}</b>${l.company ? ` · ${escapeHtml(l.company)}` : ""}<br><span style="color:#6b7686;font-size:13px">${escapeHtml(spDate(l.nextActionAt!))}${l.nextActionNote ? ` · ${escapeHtml(l.nextActionNote)}` : ""} · ${escapeHtml(l.phone)}</span></li>`,
      )
      .join("");
    const r = await sendEmail({
      to: [o.email],
      subject: `Seus retornos de hoje: ${mine.length}${late ? ` (${late} atrasados)` : ""}`,
      html: emailLayout(
        `Bom dia, ${o.name.split(" ")[0]}`,
        `<p style="margin:0 0 14px;font-size:14px">Você tem ${mine.length} ${mine.length === 1 ? "retorno" : "retornos"} para hoje${late ? `, sendo ${late} atrasado${late === 1 ? "" : "s"}` : ""}.</p><ul style="padding-left:18px;margin:0;font-size:14px">${list}</ul>`,
        { label: "Abrir o painel", url: panelUrl() },
      ),
    });
    if (r.sent) sent += 1;
  }
  return { sent };
}

/** Resumo do mês anterior (roda no dia 1º). Vai só para a lista de relatório, com os números da empresa. */
export async function sendMonthlyReport(ref = new Date()) {
  const cfg = await getNotifySettings();
  if (!cfg.reportEmails.length) return { sent: false };
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" })
    .format(ref)
    .split("-")
    .map(Number);
  const prevY = m === 1 ? y! - 1 : y!;
  const prevM = m === 1 ? 12 : m! - 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = new Date(`${prevY}-${pad(prevM)}-01T00:00:00-03:00`);
  const end = new Date(`${y}-${pad(m!)}-01T00:00:00-03:00`);
  const monthName = start.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

  const received = await db
    .select()
    .from(schema.leads)
    .where(and(gte(schema.leads.createdAt, start), lt(schema.leads.createdAt, end), isNull(schema.leads.deletedAt)));
  const won = await db
    .select()
    .from(schema.leads)
    .where(
      and(eq(schema.leads.status, "ganho"), gte(schema.leads.wonAt, start), lt(schema.leads.wonAt, end), isNull(schema.leads.deletedAt)),
    );
  const lost = received.filter((l) => l.status === "perdido").length;
  const wonValue = won.reduce((a, l) => a + (l.proposalValue ?? 0), 0);
  const top = (key: (l: (typeof received)[number]) => string | null) => {
    const map = new Map<string, number>();
    for (const l of received) {
      const k = key(l)?.trim();
      if (k) map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => `${k} (${n})`).join(", ");
  };
  const applications = await db
    .select({ id: schema.applications.id })
    .from(schema.applications)
    .where(
      and(gte(schema.applications.createdAt, start), lt(schema.applications.createdAt, end), isNull(schema.applications.deletedAt)),
    );

  const r = await sendEmail({
    to: cfg.reportEmails,
    subject: `Relatório Demakine · ${monthName}`,
    html: emailLayout(
      `Resumo de ${monthName}`,
      emailFields([
        ["Leads recebidos", received.length],
        ["Vendas fechadas", won.length],
        ["Valor fechado", wonValue ? brl(wonValue) : "sem valor registrado"],
        ["Ticket médio", won.length && wonValue ? brl(Math.round(wonValue / won.length)) : null],
        ["Perdidos (dos recebidos)", lost],
        ["Origens", top((l) => l.source ?? "site") || "-"],
        ["Produtos mais pedidos", top((l) => l.product) || "-"],
        ["Candidaturas", applications.length],
      ]),
      { label: "Abrir o dashboard", url: panelUrl() },
    ),
  });
  return { sent: r.sent };
}
