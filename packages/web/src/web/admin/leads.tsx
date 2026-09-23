import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Badge, Card, PageTitle, inputCls } from "./ui";

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
  attachments: string | null;
  createdAt: string;
};

/** Miniatura das fotos anexadas pelo lead (URL assinada, valida 10 min). */
function AttachmentCell({ raw }: { raw: string | null }) {
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
    <div className="flex gap-1.5">
      {(urls.data ?? []).map((a) => (
        <a key={a.key} href={a.url} target="_blank" rel="noreferrer" title={a.key}>
          <img
            src={a.url}
            alt="Foto enviada pelo lead"
            className="h-12 w-12 rounded-md border border-black/10 object-cover transition-transform hover:scale-110"
          />
        </a>
      ))}
    </div>
  );
}

const whatsappHref = (phone: string, name: string) =>
  `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá ${name}! Aqui é da Demakine, recebemos seu contato.`,
  )}`;

export function AdminLeads() {
  const [term, setTerm] = useState("");
  const [source, setSource] = useState("todas");

  const leadsQuery = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const res = await api.admin.leads.$get();
      if (!res.ok) throw new Error("failed");
      return (await res.json()).leads as Lead[];
    },
  });

  const leads = leadsQuery.data ?? [];
  const sources = useMemo(
    () => [...new Set(leads.map((l) => l.source ?? "site"))].sort(),
    [leads],
  );

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return leads.filter((l) => {
      if (source !== "todas" && (l.source ?? "site") !== source) return false;
      if (!t) return true;
      return [l.name, l.company, l.phone, l.email, l.city, l.product, l.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t));
    });
  }, [leads, term, source]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Leads recebidos"
        hint="Contatos enviados pelos formulários do site, da loja e das landing pages. A busca cobre nome, empresa, telefone, cidade, interesse e mensagem."
      />

      <Card className="flex flex-wrap items-end gap-4">
        <div className="min-w-[240px] flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
            Buscar
          </span>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Nome, empresa, telefone, cidade..."
            className={`mt-1.5 ${inputCls}`}
          />
        </div>
        <div className="min-w-[200px]">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
            Origem
          </span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={`mt-1.5 ${inputCls}`}
          >
            <option value="todas">Todas as origens</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <p className="pb-2 text-[13px] text-dm-ink/60">
          {filtered.length} de {leads.length} leads
        </p>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {leadsQuery.isLoading ? (
          <p className="p-8 text-center text-[13.5px] text-dm-ink/60">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-[13.5px] text-dm-ink/60">
            {leads.length ? "Nenhum lead com esse filtro." : "Nenhum lead recebido ainda."}
          </p>
        ) : (
          <table className="w-full min-w-[1100px] text-left text-[13.5px]">
            <thead className="bg-dm-surface text-[11px] font-bold uppercase tracking-wide text-dm-ink/55">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">Telefone</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Cidade</th>
                <th className="px-5 py-3">Interesse</th>
                <th className="px-5 py-3">Origem</th>
                <th className="px-5 py-3">Mensagem</th>
                <th className="px-5 py-3">Fotos</th>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-t border-black/5 hover:bg-dm-surface/60">
                  <td className="px-5 py-4 font-semibold text-dm-ink">{lead.name}</td>
                  <td className="px-5 py-4 text-dm-ink/70">{lead.company || "-"}</td>
                  <td className="px-5 py-4 text-dm-ink/70">{lead.phone}</td>
                  <td className="px-5 py-4 text-dm-ink/70">{lead.email || "-"}</td>
                  <td className="px-5 py-4 text-dm-ink/70">{lead.city || "-"}</td>
                  <td className="px-5 py-4 text-dm-ink/70">{lead.product || "-"}</td>
                  <td className="px-5 py-4">
                    <Badge>{lead.source || "site"}</Badge>
                  </td>
                  <td className="max-w-xs truncate px-5 py-4 text-dm-ink/70">
                    {lead.message || "-"}
                  </td>
                  <td className="px-5 py-4">
                    <AttachmentCell raw={lead.attachments} />
                  </td>
                  <td className="px-5 py-4 text-dm-ink/60">
                    {new Date(lead.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={whatsappHref(lead.phone, lead.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-dm-green px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-white hover:bg-dm-green-dark"
                    >
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[12.5px] text-dm-ink/50">
        Status, responsável, anotações e exportação em CSV entram na fase 2 do painel.
      </p>
    </div>
  );
}
