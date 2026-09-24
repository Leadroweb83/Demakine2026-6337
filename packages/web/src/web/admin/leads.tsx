import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  Lock,
  Wallet,
  LayoutGrid,
  List,
  Mail,
  MessageCircle,
  NotebookPen,
  PhoneCall,
  UserRound,
} from "lucide-react";
import { api } from "../lib/api";
import type { PanelUser } from "../lib/auth";
import { cn } from "@/lib/utils";
import { Badge, Btn, Card, PageTitle, inputCls } from "./ui";
import { UserAvatar } from "./avatar";
import { LEAD_STATUSES, LOSS_REASONS, STATUS_META, statusMeta, type LeadStatus } from "./lead-status";

type Lead = {
  id: number;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  product: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
  ownerId: string | null;
  lossReason: string | null;
  firstContactAt: string | null;
  lastContactAt: string | null;
  nextActionAt: string | null;
  nextActionNote: string | null;
  /** null quando não há valor ou quando o usuário não pode ver (valueHidden) */
  proposalValue: number | null;
  valueHidden: boolean;
  attachments: string | null;
  createdAt: string;
};

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;
const todayKey = () => new Date().toLocaleDateString("en-CA");
const followState = (iso: string | null) => {
  if (!iso) return null;
  const k = new Date(iso).toLocaleDateString("en-CA");
  return k < todayKey() ? "atrasado" : k === todayKey() ? "hoje" : "futuro";
};
const followLabel = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

type Member = { id: string; name: string; image: string | null; role: string | null };

type LeadEvent = { id: number; type: string; text: string | null; createdAt: string; userName: string | null };

export type LeadsFilter = { status?: string; source?: string; term?: string };

/** Miniatura das fotos anexadas pelo lead (URL assinada, valida 10 min). */
function AttachmentCell({ raw, size = "h-12 w-12" }: { raw: string | null; size?: string }) {
  const keys = useMemo(() => {
    if (!raw) return [] as string[];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [] as string[];
    }
  }, [raw]);

  const urls = useQuery({
    queryKey: ["admin-attachments", raw],
    enabled: keys.length > 0,
    queryFn: async () => {
      const out: { key: string; url: string }[] = [];
      for (const key of keys) {
        const res = await api.admin.attachment.$get({ query: { key } });
        if (res.ok) out.push({ key, url: (await res.json()).url });
      }
      return out;
    },
  });

  if (!keys.length) return <span className="text-dm-ink/35">-</span>;
  if (urls.isPending) return <span className="text-[11px] text-dm-ink/50">carregando...</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {(urls.data ?? []).map((a) => (
        <a key={a.key} href={a.url} target="_blank" rel="noreferrer" title={a.key}>
          <img
            src={a.url}
            alt="Foto enviada pelo lead"
            className={cn(size, "rounded-md border border-black/10 object-cover transition-transform hover:scale-110")}
          />
        </a>
      ))}
    </div>
  );
}

export const hasPhone = (phone: string | null | undefined) => (phone ?? "").replace(/\D/g, "").length >= 10;

export const whatsappHref = (phone: string, name: string) =>
  `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá ${name}! Aqui é da Demakine, recebemos seu contato.`,
  )}`;

const ageLabel = (iso: string) => {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 6e4);
  if (min < 2) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
};

/* ------------------------------------------------------------ exportação */

/** CSV com ponto e vírgula e BOM, para abrir certo no Excel em português. */
function exportCsv(leads: Lead[], team: Member[]) {
  const owner = new Map(team.map((m) => [m.id, m.name]));
  const cols: [string, (l: Lead) => string][] = [
    ["Data", (l) => new Date(l.createdAt).toLocaleString("pt-BR")],
    ["Nome", (l) => l.name],
    ["Empresa", (l) => l.company ?? ""],
    ["Telefone", (l) => l.phone],
    ["E-mail", (l) => l.email ?? ""],
    ["Cidade", (l) => l.city ?? ""],
    ["Interesse", (l) => l.product ?? ""],
    ["Origem", (l) => l.source ?? "site"],
    ["Status", (l) => statusMeta(l.status).label],
    ["Motivo da perda", (l) => l.lossReason ?? ""],
    ["Responsável", (l) => (l.ownerId ? owner.get(l.ownerId) ?? "" : "")],
    ["Primeiro contato", (l) => (l.firstContactAt ? new Date(l.firstContactAt).toLocaleString("pt-BR") : "")],
    ["Próximo retorno", (l) => (l.nextActionAt ? new Date(l.nextActionAt).toLocaleString("pt-BR") : "")],
    ["Valor da proposta (R$)", (l) => (l.proposalValue != null ? String(l.proposalValue) : "")],
    ["Mensagem", (l) => l.message ?? ""],
  ];
  const cell = (v: string) => `"${v.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const body = [cols.map(([h]) => cell(h)).join(";"), ...leads.map((l) => cols.map(([, f]) => cell(f(l))).join(";"))];
  const blob = new Blob(["\uFEFF" + body.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-demakine-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ------------------------------------------------------------------ tela */

export function AdminLeads({ user, initial }: { user: PanelUser; initial?: LeadsFilter }) {
  const [term, setTerm] = useState(initial?.term ?? "");
  const [source, setSource] = useState(initial?.source ?? "todas");
  const [status, setStatus] = useState(initial?.status ?? "todos");
  const [owner, setOwner] = useState("todos");
  const [view, setView] = useState<"lista" | "quadro">("lista");
  const [openId, setOpenId] = useState<number | null>(null);
  const canExport = user.role === "super_admin" || user.role === "admin";

  const leadsQuery = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const res = await api.admin.leads.$get();
      if (!res.ok) throw new Error("failed");
      return (await res.json()).leads as unknown as Lead[];
    },
  });
  const teamQuery = useQuery({
    queryKey: ["admin-equipe"],
    queryFn: async () => {
      const res = await api.admin.equipe.$get();
      if (!res.ok) throw new Error("failed");
      return (await res.json()).team as Member[];
    },
  });

  const leads = leadsQuery.data ?? [];
  const team = teamQuery.data ?? [];
  const memberById = useMemo(() => new Map(team.map((m) => [m.id, m])), [team]);
  const sources = useMemo(() => [...new Set(leads.map((l) => l.source ?? "site"))].sort(), [leads]);

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return leads.filter((l) => {
      if (source !== "todas" && (l.source ?? "site") !== source) return false;
      if (view === "lista" && status !== "todos" && (l.status ?? "novo") !== status) return false;
      if (owner === "meus" && l.ownerId !== user.id) return false;
      if (owner === "sem" && l.ownerId) return false;
      if (owner !== "todos" && owner !== "meus" && owner !== "sem" && l.ownerId !== owner) return false;
      if (!t) return true;
      return [l.name, l.company, l.phone, l.email, l.city, l.product, l.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t));
    });
  }, [leads, term, source, status, owner, view, user.id]);

  const current = leads.find((l) => l.id === openId);
  if (current) {
    return <LeadDetail lead={current} team={team} me={user} onClose={() => setOpenId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Leads recebidos"
          hint="Contatos dos formulários do site, da loja e das landing pages. Clique num lead para mudar o status, definir o responsável e registrar o contato."
        />
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-black/[0.04] p-1">
            {(
              [
                ["lista", "Lista", List],
                ["quadro", "Quadro", LayoutGrid],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-wide",
                  view === v ? "bg-white text-dm-ink shadow-sm" : "text-dm-ink/55 hover:text-dm-ink",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
          {canExport && (
            <Btn tone="ghost" onClick={() => exportCsv(filtered, team)} disabled={!filtered.length}>
              <span className="inline-flex items-center gap-1.5">
                <Download className="h-4 w-4" /> Exportar
              </span>
            </Btn>
          )}
        </div>
      </div>

      <Card className="flex flex-wrap items-end gap-4">
        <label className="min-w-[220px] flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Buscar</span>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Nome, empresa, telefone, cidade..."
            className={`mt-1.5 ${inputCls}`}
          />
        </label>
        <label className="min-w-[180px]">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Responsável</span>
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className={`mt-1.5 ${inputCls}`}>
            <option value="todos">Todos</option>
            <option value="meus">Meus leads</option>
            <option value="sem">Sem responsável</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[170px]">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Origem</span>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={`mt-1.5 ${inputCls}`}>
            <option value="todas">Todas as origens</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {view === "lista" && (
          <label className="min-w-[160px]">
            <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`mt-1.5 ${inputCls}`}>
              <option value="todos">Todos os status</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="pb-2 text-[13px] text-dm-ink/60">
          {filtered.length} de {leads.length} leads
        </p>
      </Card>

      {leadsQuery.isLoading ? (
        <p className="rounded-2xl bg-white p-8 text-center text-[13.5px] text-dm-ink/60 shadow-sm">Carregando...</p>
      ) : view === "quadro" ? (
        <div className="-mx-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0">
          <div className="grid min-w-[960px] grid-cols-4 gap-3">
            {LEAD_STATUSES.map((s) => {
              const meta = STATUS_META[s];
              const items = filtered.filter((l) => (l.status ?? "novo") === s);
              return (
                <section key={s} className="rounded-2xl bg-black/[0.03] p-2.5" aria-label={meta.label}>
                  <header className="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
                    <meta.Icon className="h-4 w-4" style={{ color: meta.color }} aria-hidden="true" />
                    <h3 className="flex-1 text-[12px] font-bold uppercase tracking-wide text-dm-ink/70">{meta.label}</h3>
                    <span className="text-[12px] font-bold tabular-nums text-dm-ink/50">{items.length}</span>
                  </header>
                  <div className="space-y-2">
                    {items.map((l) => {
                      const m = l.ownerId ? memberById.get(l.ownerId) : undefined;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setOpenId(l.id)}
                          className="block w-full rounded-xl border border-black/5 bg-white p-3 text-left shadow-sm transition-colors hover:border-dm-blue/40"
                        >
                          <p className="truncate text-[13.5px] font-bold text-dm-ink">{l.name}</p>
                          <p className="mt-0.5 truncate text-[12px] text-dm-ink/55">
                            {l.company || l.product || l.city || "-"}
                          </p>
                          <p className="mt-2 flex items-center gap-2 text-[11.5px] text-dm-ink/45">
                            {followState(l.nextActionAt) === "atrasado" || followState(l.nextActionAt) === "hoje" ? (
                              <span className={cn("shrink-0 font-bold", followState(l.nextActionAt) === "atrasado" ? "text-dm-red" : "text-dm-blue")}>
                                {followState(l.nextActionAt) === "atrasado" ? "retorno atrasado" : "retorno hoje"}
                              </span>
                            ) : (
                              <span className="shrink-0">{ageLabel(l.createdAt)}</span>
                            )}
                            <span className="truncate">· {l.source ?? "site"}</span>
                            <span className="ml-auto shrink-0">
                              {m ? (
                                <UserAvatar name={m.name} image={m.image} size={22} />
                              ) : (
                                <span title="Sem responsável" className="text-dm-red">
                                  <UserRound className="h-4 w-4" />
                                </span>
                              )}
                            </span>
                          </p>
                        </button>
                      );
                    })}
                    {!items.length && <p className="px-1.5 py-3 text-[12px] text-dm-ink/35">Nenhum</p>}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-[13.5px] text-dm-ink/60">
              {leads.length ? "Nenhum lead com esse filtro." : "Nenhum lead recebido ainda."}
            </p>
          ) : (
            <table className="w-full min-w-[1180px] text-left text-[13.5px]">
              <thead className="bg-dm-surface text-[11px] font-bold uppercase tracking-wide text-dm-ink/55">
                <tr>
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Responsável</th>
                  <th className="px-5 py-3">Retorno</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Telefone</th>
                  <th className="px-5 py-3">Cidade</th>
                  <th className="px-5 py-3">Interesse</th>
                  <th className="px-5 py-3">Origem</th>
                  <th className="px-5 py-3">Fotos</th>
                  <th className="px-5 py-3">Recebido</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const st = statusMeta(lead.status);
                  const m = lead.ownerId ? memberById.get(lead.ownerId) : undefined;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setOpenId(lead.id)}
                      className="cursor-pointer border-t border-black/5 hover:bg-dm-surface/60"
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setOpenId(lead.id)}
                          className="text-left font-semibold text-dm-ink hover:text-dm-blue"
                        >
                          {lead.name}
                        </button>
                        {lead.company && <p className="text-[12px] text-dm-ink/50">{lead.company}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-semibold text-dm-ink/80">
                          <span className="h-2 w-2 rounded-full" style={{ background: st.color }} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {m ? (
                          <span className="inline-flex items-center gap-2 whitespace-nowrap text-dm-ink/75">
                            <UserAvatar name={m.name} image={m.image} size={24} /> {m.name.split(" ")[0]}
                          </span>
                        ) : (
                          <span className="text-[12.5px] font-semibold text-dm-red">Sem responsável</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[12.5px]">
                        {lead.nextActionAt ? (
                          <span
                            className={cn(
                              "font-semibold",
                              followState(lead.nextActionAt) === "atrasado" ? "text-dm-red" : followState(lead.nextActionAt) === "hoje" ? "text-dm-blue" : "text-dm-ink/60",
                            )}
                          >
                            {followState(lead.nextActionAt) === "atrasado" ? "Atrasado · " : ""}
                            {followLabel(lead.nextActionAt)}
                          </span>
                        ) : (
                          <span className="text-dm-ink/35">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[13px]">
                        {lead.proposalValue != null ? (
                          <span className="font-semibold text-dm-ink">{brl(lead.proposalValue)}</span>
                        ) : lead.valueHidden ? (
                          <span className="inline-flex items-center gap-1 text-dm-ink/40" title="Só o responsável vê o valor">
                            <Lock className="h-3.5 w-3.5" /> oculto
                          </span>
                        ) : (
                          <span className="text-dm-ink/35">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-dm-ink/70">{lead.phone}</td>
                      <td className="px-5 py-4 text-dm-ink/70">{lead.city || "-"}</td>
                      <td className="px-5 py-4 text-dm-ink/70">{lead.product || "-"}</td>
                      <td className="px-5 py-4">
                        <Badge>{lead.source || "site"}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <AttachmentCell raw={lead.attachments} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-dm-ink/60" title={new Date(lead.createdAt).toLocaleString("pt-BR")}>
                        {ageLabel(lead.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- ficha do lead */

const EVENT_META: Record<string, { label: string; Icon: typeof NotebookPen }> = {
  status: { label: "Status", Icon: LayoutGrid },
  responsavel: { label: "Responsável", Icon: UserRound },
  nota: { label: "Anotação", Icon: NotebookPen },
  contato: { label: "Contato feito", Icon: PhoneCall },
  retorno: { label: "Retorno agendado", Icon: CalendarClock },
  valor: { label: "Valor da proposta", Icon: Wallet },
};

function eventText(e: LeadEvent) {
  if (e.type === "status" && e.text) {
    return e.text.replace(/\b(novo|em_contato|ganho|perdido)\b/g, (s) => statusMeta(s).label);
  }
  if (e.type === "responsavel") return `Responsável: ${e.text ?? "ninguém"}`;
  if (e.type === "valor") return e.text ?? "Valor atualizado (visível só para o responsável)";
  return e.text ?? "";
}

function LeadDetail({ lead, team, me, onClose }: { lead: Lead; team: Member[]; me: PanelUser; onClose: () => void }) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [losing, setLosing] = useState(false);
  const [reason, setReason] = useState<string>(LOSS_REASONS[0]);
  const [error, setError] = useState<string | null>(null);

  const events = useQuery({
    queryKey: ["admin-lead-events", lead.id],
    queryFn: async () => {
      const res = await api.admin.leads[":id"].eventos.$get({ param: { id: String(lead.id) } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()).events as unknown as LeadEvent[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-leads"] });
    qc.invalidateQueries({ queryKey: ["admin-lead-events", lead.id] });
    qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const patch = useMutation({
    mutationFn: async (body: {
      status?: string;
      ownerId?: string | null;
      lossReason?: string;
      nextActionAt?: string | null;
      nextActionNote?: string | null;
      proposalValue?: number | null;
    }) => {
      const res = await api.admin.leads[":id"].$patch({ param: { id: String(lead.id) }, json: body });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? "Não foi possível salvar");
      }
    },
    onSuccess: () => {
      setLosing(false);
      refresh();
    },
    onError: (e) => setError(e.message),
  });

  const log = useMutation({
    mutationFn: async (type: "nota" | "contato") => {
      const res = await api.admin.leads[":id"].eventos.$post({
        param: { id: String(lead.id) },
        json: { type, text: note },
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? "Não foi possível salvar");
      }
    },
    onSuccess: () => {
      setNote("");
      refresh();
    },
    onError: (e) => setError(e.message),
  });

  const current = (lead.status ?? "novo") as LeadStatus;
  const busy = patch.isPending || log.isPending;
  const canSeeValue = me.role === "super_admin" || lead.ownerId === me.id;
  const closed = current === "ganho" || current === "perdido";

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink/55 hover:text-dm-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para os leads
      </button>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[22px] font-extrabold text-dm-ink">{lead.name}</h2>
                <p className="mt-1 text-[12.5px] text-dm-ink/50">
                  Recebido em {new Date(lead.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} ·{" "}
                  {ageLabel(lead.createdAt)}
                </p>
              </div>
              <Badge>{lead.source || "site"}</Badge>
            </div>

            <dl className="mt-5 grid gap-3 text-[14px] sm:grid-cols-2">
              {[
                ["Empresa", lead.company],
                ["Telefone", lead.phone],
                ["E-mail", lead.email],
                ["Cidade", lead.city],
                ["Interesse", lead.product],
                ["Primeiro contato", lead.firstContactAt ? new Date(lead.firstContactAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : null],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">{k}</dt>
                    <dd className="break-words font-semibold text-dm-ink">{v}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {hasPhone(lead.phone) && (
                <a
                  href={whatsappHref(lead.phone, lead.name.split(" ")[0] ?? lead.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-dm-green px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white hover:bg-dm-green-dark"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink hover:bg-black/[0.03]"
                >
                  <Mail className="h-4 w-4" /> E-mail
                </a>
              )}
            </div>

            {lead.message && (
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Mensagem</p>
                <p className="mt-1.5 whitespace-pre-line rounded-xl bg-black/[0.03] p-4 text-[14px] leading-relaxed text-dm-ink/80">
                  {lead.message}
                </p>
              </div>
            )}
            {lead.attachments && (
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Fotos enviadas</p>
                <div className="mt-2">
                  <AttachmentCell raw={lead.attachments} size="h-20 w-20" />
                </div>
              </div>
            )}
          </Card>

          <Card>
            <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Histórico</p>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="O que foi conversado, próximo passo, valor da proposta..."
              aria-label="Anotação"
              className={cn(inputCls, "mt-3")}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn tone="green" disabled={busy} onClick={() => log.mutate("contato")}>
                <span className="inline-flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4" /> Registrar contato
                </span>
              </Btn>
              <Btn tone="ghost" disabled={busy || !note.trim()} onClick={() => log.mutate("nota")}>
                <span className="inline-flex items-center gap-1.5">
                  <NotebookPen className="h-4 w-4" /> Só anotar
                </span>
              </Btn>
            </div>
            <p className="mt-2 text-[12px] text-dm-ink/45">
              "Registrar contato" marca que você falou com o cliente e conta no tempo de resposta do dashboard.
            </p>

            <ol className="mt-6 space-y-4 border-l border-black/10 pl-5">
              {(events.data ?? []).map((e) => {
                const meta = EVENT_META[e.type] ?? EVENT_META.nota!;
                return (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[29px] top-0 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-dm-ink/50 ring-1 ring-black/10">
                      <meta.Icon className="h-3 w-3" />
                    </span>
                    <p className="text-[11.5px] text-dm-ink/45">
                      {meta.label} · {e.userName ?? "sistema"} ·{" "}
                      {new Date(e.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                    {eventText(e) && (
                      <p className="mt-0.5 whitespace-pre-line text-[13.5px] text-dm-ink/80">{eventText(e)}</p>
                    )}
                  </li>
                );
              })}
              <li className="relative">
                <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-dm-blue" />
                <p className="text-[11.5px] text-dm-ink/45">
                  Lead recebido · {new Date(lead.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </li>
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Status</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {LEAD_STATUSES.map((s) => {
                const meta = STATUS_META[s];
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    aria-pressed={current === s}
                    onClick={() => {
                      setError(null);
                      if (s === current) return;
                      if (s === "perdido") setLosing(true);
                      else patch.mutate({ status: s });
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold transition-colors",
                      current === s ? "border-dm-blue bg-dm-blue-soft text-dm-blue" : "border-black/10 text-dm-ink/70 hover:border-dm-blue/40",
                    )}
                  >
                    <meta.Icon className="h-4 w-4 shrink-0" style={{ color: meta.color }} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
            {current === "perdido" && lead.lossReason && !losing && (
              <p className="mt-3 text-[13px] text-dm-ink/60">
                Motivo: <span className="font-semibold text-dm-ink">{lead.lossReason}</span>
              </p>
            )}
            {losing && (
              <div className="mt-4 rounded-xl border border-dm-red/20 bg-dm-red/[0.04] p-4">
                <label className="block text-[12px] font-bold text-dm-ink">
                  Por que foi perdido?
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className={cn(inputCls, "mt-2")}>
                    {LOSS_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 flex gap-2">
                  <Btn tone="danger" disabled={busy} onClick={() => patch.mutate({ status: "perdido", lossReason: reason })}>
                    Marcar perdido
                  </Btn>
                  <Btn tone="ghost" onClick={() => setLosing(false)}>
                    Cancelar
                  </Btn>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Responsável</span>
              <select
                value={lead.ownerId ?? ""}
                disabled={busy}
                onChange={(e) => patch.mutate({ ownerId: e.target.value || null })}
                className={cn(inputCls, "mt-3")}
              >
                <option value="">Sem responsável</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            {lead.ownerId !== me.id && (
              <button
                type="button"
                disabled={busy}
                onClick={() => patch.mutate({ ownerId: me.id })}
                className="mt-3 text-[12.5px] font-bold uppercase tracking-wide text-dm-blue hover:underline"
              >
                Assumir este lead
              </button>
            )}
          </Card>

          {!closed && <FollowUpCard lead={lead} busy={busy} onSave={(b) => patch.mutate(b)} />}

          <Card>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">
              <Wallet className="h-3.5 w-3.5" /> Valor da proposta
            </p>
            {canSeeValue ? (
              <ValueEditor value={lead.proposalValue} busy={busy} won={current === "ganho"} onSave={(v) => patch.mutate({ proposalValue: v })} />
            ) : (
              <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-dm-ink/60">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                {lead.ownerId
                  ? "O valor fica visível só para o responsável pelo lead e para o super admin."
                  : "Assuma o lead para registrar o valor da proposta."}
              </p>
            )}
          </Card>

          {error && <p className="text-[13px] font-semibold text-dm-red">{error}</p>}
        </div>
      </div>
    </div>
  );
}

/** "AAAA-MM-DDTHH:mm" no horário local, para o campo datetime-local. */
const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const at9 = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(9, 0, 0, 0);
  return d;
};

const nextMonday = () => {
  const d = at9(1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
};

function FollowUpCard({
  lead,
  busy,
  onSave,
}: {
  lead: Lead;
  busy: boolean;
  onSave: (b: { nextActionAt: string | null; nextActionNote?: string | null }) => void;
}) {
  const [when, setWhen] = useState(lead.nextActionAt ? toLocalInput(new Date(lead.nextActionAt)) : "");
  const [note, setNote] = useState(lead.nextActionNote ?? "");
  const state = followState(lead.nextActionAt);

  return (
    <Card>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">
        <CalendarClock className="h-3.5 w-3.5" /> Próximo retorno
      </p>
      {lead.nextActionAt && (
        <p className={cn("mt-2 text-[13px] font-semibold", state === "atrasado" ? "text-dm-red" : "text-dm-ink/70")}>
          {state === "atrasado" ? "Atrasado: " : "Agendado: "}
          {followLabel(lead.nextActionAt)}
          {lead.nextActionNote ? ` · ${lead.nextActionNote}` : ""}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(
          [
            ["Amanhã 9h", at9(1)],
            ["Em 3 dias", at9(3)],
            ["Próx. segunda", nextMonday()],
          ] as const
        ).map(([label, d]) => (
          <button
            key={label}
            type="button"
            onClick={() => setWhen(toLocalInput(d))}
            className="rounded-full border border-black/10 px-3 py-1.5 text-[12px] font-semibold text-dm-ink/70 hover:border-dm-blue/40 hover:text-dm-blue"
          >
            {label}
          </button>
        ))}
      </div>
      <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Data e hora do retorno" className={cn(inputCls, "mt-3")} />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="O que fazer: mandar proposta, ligar..." aria-label="O que fazer no retorno" className={cn(inputCls, "mt-2")} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn disabled={busy || !when} onClick={() => onSave({ nextActionAt: new Date(when).toISOString(), nextActionNote: note })}>
          Agendar
        </Btn>
        {lead.nextActionAt && (
          <Btn
            tone="ghost"
            disabled={busy}
            onClick={() => {
              setWhen("");
              setNote("");
              onSave({ nextActionAt: null });
            }}
          >
            Cancelar retorno
          </Btn>
        )}
      </div>
    </Card>
  );
}

function ValueEditor({
  value,
  busy,
  won,
  onSave,
}: {
  value: number | null;
  busy: boolean;
  won: boolean;
  onSave: (v: number | null) => void;
}) {
  const [text, setText] = useState(value != null ? String(value) : "");
  const parsed = text.trim() ? Number(text.replace(/\./g, "").replace(",", ".")) : null;
  const invalid = parsed !== null && (!Number.isFinite(parsed) || parsed < 0);
  const changed = (parsed === null ? null : Math.round(parsed)) !== value;

  return (
    <div className="mt-3">
      {value != null && <p className="text-[22px] font-extrabold text-dm-ink">{brl(value)}</p>}
      <p className="mt-1 text-[12px] text-dm-ink/50">
        {won ? "Valor da venda fechada: entra no \"Fechado no mês\"." : "Entra no \"Em negociação\" do dashboard."}
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          inputMode="numeric"
          placeholder="Ex.: 48500"
          aria-label="Valor da proposta em reais"
          className={inputCls}
        />
        <Btn disabled={busy || invalid || !changed} onClick={() => onSave(parsed === null ? null : Math.round(parsed))}>
          Salvar
        </Btn>
      </div>
      {invalid && <p className="mt-1 text-[12px] font-semibold text-dm-red">Digite só números, em reais.</p>}
    </div>
  );
}
