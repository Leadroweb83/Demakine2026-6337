import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  Clock3,
  Flame,
  Inbox,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  Target,
  TriangleAlert,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import { ROLE_LABEL, can, type PanelUser } from "../lib/auth";
import { Card, PageTitle } from "./ui";
import {
  ChartCard,
  EmptyState,
  FunnelBars,
  KpiTile,
  LeadsMap,
  MARK_BLUE,
  MonthlyChart,
  RankList,
  StatusDonut,
  WeekHourHeatmap,
  monthLabel,
} from "./charts";
import { STATUS_META, statusMeta } from "./lead-status";
import { hasPhone, whatsappHref, type LeadsFilter } from "./leads";
import { UserAvatar } from "./avatar";

type Go = (id: string, filter?: LeadsFilter) => void;

const PERIODS = [
  { days: 7, label: "7 dias", phrase: "nos últimos 7 dias", compare: "vs 7 dias anteriores" },
  { days: 30, label: "30 dias", phrase: "nos últimos 30 dias", compare: "vs 30 dias anteriores" },
  { days: 90, label: "90 dias", phrase: "nos últimos 90 dias", compare: "vs 90 dias anteriores" },
  { days: 365, label: "12 meses", phrase: "nos últimos 12 meses", compare: "vs 12 meses anteriores" },
  { days: 0, label: "Tudo", phrase: "desde o lançamento do site", compare: "período completo" },
] as const;

const PERIOD_KEY = "demakine_dash_periodo";

function readPeriod() {
  try {
    const raw = localStorage.getItem(PERIOD_KEY);
    const v = Number(raw);
    return raw !== null && PERIODS.some((p) => p.days === v) ? v : 90;
  } catch {
    return 90;
  }
}

const ago = (iso: string | Date | null) => {
  if (!iso) return "";
  const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 36e5));
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h}h`;
  const d = Math.round(h / 24);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
};

function urgency(hours: number) {
  if (hours >= 24 * 7) return { label: "Crítico", color: "#d03b3b", Icon: Flame };
  if (hours >= 72) return { label: "Urgente", color: "#ec835a", Icon: TriangleAlert };
  return { label: "Atenção", color: "#c98500", Icon: Clock3 };
}

export function AdminDashboard({ user, onGo }: { user: PanelUser; onGo: Go }) {
  const canSeeLeads = can(user.role, "leads");
  const [days, setDays] = useState<number>(readPeriod);
  const [scope, setScope] = useState<"todos" | "meus">("todos");

  useEffect(() => {
    try {
      localStorage.setItem(PERIOD_KEY, String(days));
    } catch {
      /* armazenamento bloqueado: segue sem lembrar */
    }
  }, [days]);

  const q = useQuery({
    queryKey: ["admin-dashboard", days, scope],
    enabled: canSeeLeads,
    placeholderData: keepPreviousData,
    refetchInterval: 120_000,
    queryFn: async () => {
      const res = await api.admin.dashboard.$get({ query: { dias: String(days), escopo: scope } });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });

  const firstName = user.name.split(" ")[0];

  if (!canSeeLeads) {
    return (
      <div className="space-y-8">
        <PageTitle
          title={`Olá, ${firstName}`}
          hint={`Você está no painel como ${ROLE_LABEL[user.role] ?? user.role}.`}
        />
        <Card>
          <h2 className="font-display text-[15px] font-extrabold text-dm-ink">Seu acesso é de conteúdo</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-dm-ink/65">
            O papel de editor não enxerga leads nem dados comerciais. As áreas de blog, cases,
            depoimentos e mídia entram nas próximas fases do painel e aparecerão aqui no menu.
          </p>
        </Card>
      </div>
    );
  }

  const data = q.data;

  if (!data) {
    return (
      <div className="space-y-8">
        <PageTitle title={`Olá, ${firstName}`} />
        {q.isError ? (
          <Card>
            <p className="text-[13.5px] text-dm-red">Não foi possível carregar os indicadores.</p>
            <button
              onClick={() => q.refetch()}
              className="mt-3 text-[12.5px] font-bold uppercase tracking-wide text-dm-blue underline"
            >
              Tentar de novo
            </button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-[150px] animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        )}
      </div>
    );
  }

  const { kpi } = data;
  const shownDays = data.days;
  const period = PERIODS.find((p) => p.days === shownDays) ?? PERIODS[2];
  const funnelContacted = data.byStatus
    .filter((s) => s.status !== "novo")
    .reduce((a, s) => a + s.total, 0);
  const funnelWon = data.byStatus.find((s) => s.status === "ganho")?.total ?? 0;
  const noLeads = kpi.total === 0;
  const closedAny = data.byStatus.some((s) => (s.status === "ganho" || s.status === "perdido") && s.total > 0);

  const diff = (cur: number | null, prev: number | null) =>
    cur === null || prev === null || shownDays === 0 || kpi.previousTotal === 0
      ? null
      : Math.round((cur - prev) * 10) / 10;

  const insight = noLeads
    ? `Nenhum lead chegou ${period.phrase}. Os blocos abaixo se preenchem sozinhos conforme os formulários do site recebem contatos.`
    : `Chegaram ${kpi.total} ${kpi.total === 1 ? "lead" : "leads"} ${period.phrase}${
        kpi.delta !== null && shownDays > 0
          ? `, ${Math.abs(kpi.delta)}% ${kpi.delta >= 0 ? "a mais" : "a menos"} que no período anterior`
          : ""
      }. ${
        kpi.staleCount
          ? `${kpi.staleCount} ${kpi.staleCount === 1 ? "está" : "estão"} sem contato há mais de 48h.`
          : "Nenhum pedido de contato parado há mais de 48h."
      }`;

  const updated = new Date(data.generatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-extrabold tracking-tight text-dm-ink">Olá, {firstName}</h1>
          <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-dm-ink/65">{insight}</p>
        </div>
        <button
          type="button"
          onClick={() => q.refetch()}
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[12px] font-semibold text-dm-ink/65 transition-colors hover:bg-black/[0.03]"
          title="Atualizar agora"
        >
          <RefreshCw size={14} className={q.isFetching ? "animate-spin" : ""} />
          Atualizado às {updated}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div aria-label="Período" className="flex w-full rounded-full border border-black/10 bg-white p-1 sm:w-auto">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              aria-pressed={p.days === days}
              onClick={() => setDays(p.days)}
              className={`flex-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors sm:flex-none sm:px-3.5 ${
                p.days === days ? "bg-dm-blue text-white" : "text-dm-ink/60 hover:bg-black/[0.04] hover:text-dm-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div aria-label="Quais leads" className="flex rounded-full border border-black/10 bg-white p-1">
          {(
            [
              ["todos", "Todos os leads"],
              ["meus", "Meus leads"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={scope === id}
              onClick={() => setScope(id)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                scope === id ? "bg-dm-blue-deep text-white" : "text-dm-ink/60 hover:bg-black/[0.04] hover:text-dm-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        aria-busy={q.isPlaceholderData}
        className={`space-y-6 transition-opacity duration-200 ${q.isPlaceholderData ? "opacity-50" : ""}`}
      >
      {scope === "meus" && kpi.allTime === 0 && (
        <div className="rounded-xl bg-dm-blue-soft px-5 py-4 text-[13px] leading-relaxed text-dm-blue">
          Nenhum lead está atribuído a você ainda. A escolha de responsável por lead entra na próxima
          etapa do CRM; depois disso, esta visão mostra só a sua carteira.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Leads no período"
          value={kpi.total}
          delta={shownDays > 0 ? kpi.delta : null}
          compareLabel={period.compare}
          Icon={Inbox}
          accent={MARK_BLUE}
          footnote={
            <span>
              {kpi.allTime} no total · {kpi.withPhotos} com foto de peça
            </span>
          }
        />
        <KpiTile
          label="Taxa de conversão"
          value={kpi.conversion}
          suffix="%"
          delta={diff(kpi.conversion, kpi.previousConversion)}
          deltaUnit=" pts"
          compareLabel={period.compare}
          Icon={Trophy}
          accent={STATUS_META.ganho.color}
          footnote={
            closedAny ? (
              <span>{kpi.won} ganhos entre os leads fechados</span>
            ) : (
              <span>Calculada quando houver leads marcados como ganho ou perdido</span>
            )
          }
        />
        <KpiTile
          label="Em aberto"
          value={kpi.openLeads}
          delta={diff(kpi.openLeads, kpi.previousOpenLeads)}
          deltaUnit=""
          goodWhen="down"
          compareLabel={period.compare}
          Icon={Target}
          accent={STATUS_META.em_contato.color}
          footnote={
            kpi.staleCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-dm-red">
                <TriangleAlert size={13} /> {kpi.staleCount} parados há +48h
              </span>
            ) : (
              <span>Novos e em contato</span>
            )
          }
        />
        <KpiTile
          label="Tempo até o 1º contato"
          value={kpi.avgFirstContactHours}
          decimals={1}
          suffix="h"
          delta={diff(kpi.avgFirstContactHours, kpi.previousAvgFirstContactHours)}
          deltaUnit="h"
          goodWhen="down"
          compareLabel={period.compare}
          Icon={CalendarClock}
          accent={MARK_BLUE}
          footnote={<span>Média entre a chegada e o primeiro contato registrado</span>}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ChartCard
          title="Leads por mês"
          hint="Últimos 12 meses, com os ganhos na base de cada coluna. Não muda com o filtro de período."
          table={{
            columns: ["Mês", "Leads", "Ganhos", "Ano anterior"],
            rows: data.byMonth.map((m) => [monthLabel(m.month, true), m.total, m.won, m.lastYear]),
          }}
        >
          <MonthlyChart data={data.byMonth} />
        </ChartCard>

        <ChartCard
          title="Status dos leads"
          hint="Clique em um status para abrir a lista filtrada. O selo mostra a variação contra o período anterior."
          table={{
            columns: ["Status", "Leads"],
            rows: data.byStatus.map((s) => [statusMeta(s.status).label, s.total]),
          }}
        >
          {noLeads ? (
            <EmptyState
              icon={<Target size={28} />}
              title="Sem leads no período"
              text="Aqui aparece a divisão entre novos, em contato, ganhos e perdidos."
            />
          ) : (
            <StatusDonut
              byStatus={data.byStatus}
              showDelta={shownDays > 0 && kpi.previousTotal > 0}
              onSelect={(status) => onGo("leads", { status })}
            />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <ChartCard title="Funil do período" hint="Quantos leads avançam de uma etapa para a outra.">
          {noLeads ? (
            <EmptyState
              icon={<Target size={28} />}
              title="Funil vazio"
              text="Mostra quantos leads recebidos viram contato e quantos viram venda."
            />
          ) : (
            <FunnelBars
              steps={[
                { label: "Recebidos", value: kpi.total, hint: "Todo contato que chegou pelos formulários" },
                { label: "Contatados", value: funnelContacted, hint: "Em contato, ganhos ou perdidos" },
                { label: "Ganhos", value: funnelWon, hint: "Viraram venda ou pedido" },
              ]}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Precisam de retorno"
          hint="Pedidos de contato sem retorno há mais de 48h, do mais antigo para o mais novo. Assinantes da newsletter não entram aqui."
          action={
            data.stale.length > 0 ? (
              <button
                type="button"
                onClick={() => onGo("leads", { status: "novo" })}
                className="rounded-full px-3 py-1.5 text-[12px] font-bold text-dm-blue hover:bg-dm-blue-soft"
              >
                Ver todos
              </button>
            ) : null
          }
        >
          {data.stale.length === 0 ? (
            <EmptyState
              icon={<Trophy size={28} />}
              title="Nenhum lead parado"
              text="Todo pedido de contato recebido teve retorno registrado em até 48h, ou ainda está dentro do prazo."
            />
          ) : (
            <ul className="divide-y divide-black/5">
              {data.stale.map((s) => {
                const u = urgency(s.hours);
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${u.color}1f`, color: u.color }}
                    >
                      <u.Icon size={17} />
                    </span>
                    <button
                      type="button"
                      onClick={() => onGo("leads", { term: s.name })}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-[13.5px] font-bold text-dm-ink hover:underline">
                        {s.name}
                        {s.company ? <span className="font-medium text-dm-ink/55"> · {s.company}</span> : null}
                      </span>
                      <span className="block truncate text-[12px] text-dm-ink/50">
                        {s.product || "Sem produto informado"} · {s.source}
                      </span>
                    </button>
                    <span className="text-right">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/70">
                        {u.label}
                      </span>
                      <span className="block text-[11.5px] text-dm-ink/50">{ago(s.createdAt)}</span>
                    </span>
                    {hasPhone(s.phone) && (
                      <a
                        href={whatsappHref(s.phone, s.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-full bg-dm-green px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-white hover:bg-dm-green-dark"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="De onde vêm os leads"
          hint="Volume por formulário ou página, com a taxa de ganho entre os fechados."
          table={{
            columns: ["Origem", "Leads", "Ganhos", "Taxa de ganho"],
            rows: data.bySource.map((s) => [s.label, s.total, s.won, s.rate === null ? "sem fechados" : `${s.rate}%`]),
          }}
        >
          <RankList
            data={data.bySource.map((s) => ({
              label: s.label,
              value: s.total,
              sub: s.rate === null ? undefined : `${s.rate}% ganho`,
            }))}
            onSelect={(source) => onGo("leads", { source })}
            empty={
              <EmptyState
                icon={<Inbox size={28} />}
                title="Sem origens no período"
                text="Mostra quais formulários e páginas do site trazem mais contatos."
              />
            }
          />
        </ChartCard>

        <ChartCard
          title="Carga por responsável"
          hint="Leads do período por pessoa do time."
          table={{
            columns: ["Responsável", "Leads"],
            rows: [...data.byOwner.map((o) => [o.label, o.total]), ["Sem responsável", data.unassigned]],
          }}
        >
          <RankList
            data={data.byOwner.map((o) => ({
              label: o.label,
              value: o.total,
              icon: <UserAvatar name={o.label} image={o.image} size={22} className="ring-0" />,
            }))}
            empty={
              <EmptyState
                icon={<Users size={28} />}
                title="Ninguém com leads atribuídos"
                text="Quando a escolha de responsável por lead entrar no CRM, a divisão do time aparece aqui."
              />
            }
          />
          {data.unassigned > 0 && data.byOwner.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 px-2 text-[12px] text-dm-ink/55">
              <UserRound size={13} /> {data.unassigned} sem responsável
            </p>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Quando os leads chegam"
          hint="Dia da semana e faixa de horário, no horário de Brasília."
          table={{
            columns: ["Dia", ...Array.from({ length: 8 }, (_, b) => `${b * 3}h`)],
            rows: [1, 2, 3, 4, 5, 6, 0].map((d) => [
              ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][d]!,
              ...(data.byWeekHour[d] ?? []),
            ]),
          }}
        >
          {noLeads ? (
            <EmptyState
              icon={<Clock3 size={28} />}
              title="Sem dados de horário"
              text="Mostra os dias e horários de pico, útil para escala do time e horário de anúncio."
            />
          ) : (
            <WeekHourHeatmap matrix={data.byWeekHour} />
          )}
        </ChartCard>

        <ChartCard
          title="Leads por estado"
          hint="Pela cidade digitada no formulário. Clique para abrir a lista."
          table={{
            columns: ["UF", "Leads"],
            rows: [...data.byState.map((s) => [s.label, s.total]), ["Sem UF", data.stateUnknown]],
          }}
        >
          <LeadsMap
            byState={data.byState}
            unknown={data.stateUnknown}
            onSelect={(uf) => onGo("leads", { term: uf })}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Produtos mais procurados" hint="Interesse informado no formulário.">
          <RankList
            data={data.topProducts.map((p) => ({ label: p.label, value: p.total }))}
            onSelect={(term) => onGo("leads", { term })}
            empty={
              <EmptyState
                icon={<Package size={28} />}
                title="Nenhum produto informado"
                text="Aparece quando o lead escolhe um equipamento no formulário."
              />
            }
          />
        </ChartCard>
        <ChartCard title="Cidades com mais leads" hint="Como o cliente digitou.">
          <RankList
            data={data.topCities.map((c) => ({ label: c.label, value: c.total }))}
            onSelect={(term) => onGo("leads", { term })}
            empty={
              <EmptyState
                icon={<MapPin size={28} />}
                title="Nenhuma cidade informada"
                text="Aparece quando o lead preenche a cidade no formulário."
              />
            }
          />
        </ChartCard>
        <ChartCard title="Motivos de perda" hint="Registrados ao marcar um lead como perdido.">
          <RankList
            data={data.lossReasons.map((l) => ({ label: l.label, value: l.total }))}
            empty={
              <EmptyState
                icon={<TriangleAlert size={28} />}
                title="Nenhuma perda registrada"
                text="Quando um lead for marcado como perdido, o motivo entra aqui para mostrar o que mais faz o cliente desistir."
              />
            }
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Últimos leads recebidos"
        hint="Os mais recentes, independente do período."
        action={
          <button
            type="button"
            onClick={() => onGo("leads")}
            className="rounded-full px-3 py-1.5 text-[12px] font-bold text-dm-blue hover:bg-dm-blue-soft"
          >
            Abrir leads
          </button>
        }
      >
        {data.recent.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} />}
            title="Nenhum lead ainda"
            text="Assim que alguém preencher um formulário do site, ele aparece aqui."
          />
        ) : (
          <ul className="grid gap-x-8 md:grid-cols-2">
            {data.recent.map((r) => {
              const st = statusMeta(r.status);
              return (
                <li key={r.id} className="border-b border-black/5">
                  <button
                    type="button"
                    onClick={() => onGo("leads", { term: r.name })}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dm-blue-soft text-[13px] font-bold uppercase text-dm-blue">
                      {r.name.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-dm-ink">{r.name}</span>
                      <span className="block truncate text-[12px] text-dm-ink/50">
                        {[r.product, r.city, r.source].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="flex items-center justify-end gap-1.5 text-[11.5px] font-semibold text-dm-ink/70">
                        <span className="h-2 w-2 rounded-full" style={{ background: st.color }} />
                        {st.label}
                      </span>
                      <span className="block text-[11.5px] text-dm-ink/45">{ago(r.createdAt)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ChartCard>
      </div>
    </div>
  );
}
