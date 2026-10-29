import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Eye, Footprints, Inbox, Percent, RefreshCw, Users } from "lucide-react";
import { api } from "../lib/api";
import { sourceLabel } from "@/lib/traffic";
import { ChartCard, EmptyState, KpiTile, LeadsMap, MARK_BLUE, RankList, niceScale, plural } from "./charts";
import { PageTitle } from "./ui";

type Metric = { value: number; previous: number; delta: number | null };
type Summary = {
  days: number;
  generatedAt: string;
  live: number;
  kpi: {
    visitors: Metric;
    visits: Metric;
    views: Metric;
    leads: Metric;
    conversion: { value: number | null; previous: number | null };
  };
  byDay: { day: string; views: number; visitors: number }[];
  pages: { label: string; total: number; visitors: number; leads: number }[];
  sources: { label: string; total: number; leads: number }[];
  leadsWithoutVisit: number;
  devices: { label: string; total: number }[];
  states: { label: string; total: number }[];
  stateUnknown: number;
  cities: { label: string; total: number }[];
  countries: { label: string; total: number }[];
  campaigns: { label: string; total: number; leads: number }[];
};

const PERIODS = [
  { days: 7, label: "7 dias", compare: "vs 7 dias anteriores" },
  { days: 30, label: "30 dias", compare: "vs 30 dias anteriores" },
  { days: 90, label: "90 dias", compare: "vs 90 dias anteriores" },
] as const;

const DEVICE_LABEL: Record<string, string> = { celular: "Celular", computador: "Computador", tablet: "Tablet" };
const COUNTRY = new Intl.DisplayNames(["pt-BR"], { type: "region" });

/** Visitantes por dia: uma série, barras finas, detalhe ao passar o mouse. */
function DailyChart({ data }: { data: Summary["byDay"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.visitors), 0);
  const { top, step } = niceScale(max);
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const label = (day: string) => {
    const [, m, d] = day.split("-");
    return `${d}/${m}`;
  };
  const every = Math.ceil(data.length / 8);
  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative h-[200px] w-7 shrink-0">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2 text-[10.5px] tabular-nums text-dm-ink/45"
              style={{ bottom: `${(t / top) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="relative h-[200px] flex-1">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-black/[0.06]" style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {data.map((d, i) => (
              <button
                key={d.day}
                type="button"
                aria-label={`${label(d.day)}: ${plural(d.visitors, "visitante", "visitantes")}, ${plural(d.views, "página vista", "páginas vistas")}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="group relative flex h-full flex-1 items-end outline-none"
              >
                <span
                  className="block w-full rounded-t-[4px] transition-opacity"
                  style={{
                    height: `${top ? (d.visitors / top) * 100 : 0}%`,
                    minHeight: d.visitors ? 2 : 0,
                    background: MARK_BLUE,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-9 mt-2 flex gap-[2px]">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center text-[10.5px] tabular-nums text-dm-ink/45">
            {i % every === 0 ? label(d.day) : ""}
          </span>
        ))}
      </div>
      {h && (
        <div className="pointer-events-none absolute right-0 top-0 rounded-lg bg-dm-ink px-3 py-2 shadow-lg">
          <p className="text-[11px] text-white/65">{label(h.day)}</p>
          <p className="text-[12.5px] font-bold text-white">{plural(h.visitors, "visitante", "visitantes")}</p>
          <p className="text-[11.5px] text-white/75">{plural(h.views, "página vista", "páginas vistas")}</p>
        </div>
      )}
    </div>
  );
}

export function AdminVisits() {
  const [days, setDays] = useState<number>(30);
  const q = useQuery({
    queryKey: ["admin-visitas", days],
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await api.admin.visitas.$get({ query: { dias: String(days) } });
      if (!res.ok) throw new Error("fail");
      return (await res.json()) as unknown as Summary;
    },
  });
  const data = q.data;
  const period = PERIODS.find((p) => p.days === days) ?? PERIODS[1];
  const noViews = data ? data.kpi.views.value === 0 : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Visitas do site"
          hint="Medição própria, sem cookie e sem guardar IP: conta todo mundo, inclusive quem recusa o banner. Robôs e o painel ficam de fora."
        />
        <div className="flex flex-wrap items-center gap-2">
          {data && (
            <span className="inline-flex items-center gap-2 rounded-full bg-dm-green/10 px-3.5 py-2 text-[12px] font-semibold text-dm-green">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dm-green opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-dm-green" />
              </span>
              {plural(data.live, "pessoa", "pessoas")} no site agora
            </span>
          )}
          <button
            type="button"
            onClick={() => q.refetch()}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[12px] font-semibold text-dm-ink/65 hover:bg-black/[0.03]"
          >
            <RefreshCw size={14} className={q.isFetching ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      <div aria-label="Período" className="inline-flex rounded-full border border-black/10 bg-white p-1">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            type="button"
            aria-pressed={p.days === days}
            onClick={() => setDays(p.days)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              p.days === days ? "bg-dm-blue text-white" : "text-dm-ink/60 hover:bg-black/[0.04] hover:text-dm-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!data ? (
        q.isError ? (
          <p className="text-[13.5px] text-dm-red">Não foi possível carregar as visitas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-busy="true">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-[140px] animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        )
      ) : (
        <div className={`space-y-6 transition-opacity ${q.isPlaceholderData ? "opacity-50" : ""}`}>
          {noViews && (
            <div className="rounded-xl bg-dm-blue-soft px-5 py-4 text-[13px] leading-relaxed text-dm-blue">
              Ainda sem visitas neste período. A contagem começou quando esta tela foi publicada; no endereço de teste
              aparecem só os acessos da equipe. Com o domínio no ar, os números passam a ser dos clientes.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiTile
              label="Visitantes"
              value={data.kpi.visitors.value}
              delta={data.kpi.visitors.delta}
              compareLabel={period.compare}
              Icon={Users}
              accent={MARK_BLUE}
              footnote={<span>pessoas diferentes a cada dia, somadas</span>}
            />
            <KpiTile
              label="Visitas"
              value={data.kpi.visits.value}
              delta={data.kpi.visits.delta}
              compareLabel={period.compare}
              Icon={Footprints}
              accent={MARK_BLUE}
              footnote={<span>cada vez que alguém chega ao site</span>}
            />
            <KpiTile
              label="Páginas vistas"
              value={data.kpi.views.value}
              delta={data.kpi.views.delta}
              compareLabel={period.compare}
              Icon={Eye}
              accent={MARK_BLUE}
              footnote={
                <span>
                  {data.kpi.visits.value
                    ? `${(data.kpi.views.value / data.kpi.visits.value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} por visita`
                    : "média por visita aparece com as primeiras visitas"}
                </span>
              }
            />
            <KpiTile
              label="Pedidos de orçamento"
              value={data.kpi.leads.value}
              delta={data.kpi.leads.delta}
              compareLabel={period.compare}
              Icon={Inbox}
              accent={MARK_BLUE}
              footnote={<span>leads que chegaram pelo site</span>}
            />
            <KpiTile
              label="Conversão"
              value={data.kpi.conversion.value}
              decimals={1}
              suffix="%"
              delta={
                data.kpi.conversion.value !== null && data.kpi.conversion.previous !== null
                  ? Math.round((data.kpi.conversion.value - data.kpi.conversion.previous) * 10) / 10
                  : null
              }
              deltaUnit=" pts"
              compareLabel={period.compare}
              Icon={Percent}
              accent={MARK_BLUE}
              footnote={<span>pedidos de orçamento a cada 100 visitas</span>}
            />
          </div>

          <ChartCard
            title="Visitantes por dia"
            hint="Passe o mouse para ver o dia."
            table={{
              columns: ["Dia", "Visitantes", "Páginas vistas"],
              rows: data.byDay.map((d) => [d.day.split("-").reverse().join("/"), d.visitors, d.views]),
            }}
          >
            <div className="mt-4">
              <DailyChart data={data.byDay} />
            </div>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-12">
            <ChartCard
              className="lg:col-span-7"
              title="De onde vêm os visitantes"
              hint={`Onde a pessoa estava antes de chegar ao site, e quantos orçamentos cada origem trouxe.${
                data.leadsWithoutVisit ? ` ${plural(data.leadsWithoutVisit, "orçamento", "orçamentos")} sem origem (enviados antes desta medição).` : ""
              }`}
              table={{
                columns: ["Origem", "Visitas", "Orçamentos"],
                rows: data.sources.map((s) => [sourceLabel(s.label), s.total, s.leads]),
              }}
            >
              <div className="mt-4">
                <RankList
                  data={data.sources.map((s) => ({
                    label: sourceLabel(s.label),
                    value: s.total,
                    sub: s.leads ? plural(s.leads, "orçamento", "orçamentos") : undefined,
                  }))}
                  valueLabel={(v) => plural(v, "visita", "visitas")}
                  empty={<EmptyState icon={<Footprints size={18} />} title="Sem visitas ainda" text="As origens aparecem com as primeiras visitas." />}
                />
              </div>
            </ChartCard>

            <ChartCard
              className="lg:col-span-5"
              title="Aparelhos"
              hint="Por onde as pessoas acessam."
              table={{ columns: ["Aparelho", "Visitas"], rows: data.devices.map((d) => [DEVICE_LABEL[d.label] ?? d.label, d.total]) }}
            >
              <div className="mt-4">
                <RankList
                  data={data.devices.map((d) => ({ label: DEVICE_LABEL[d.label] ?? d.label, value: d.total }))}
                  valueLabel={(v) => plural(v, "visita", "visitas")}
                  empty={<EmptyState icon={<Footprints size={18} />} title="Sem visitas ainda" text="Aparece com as primeiras visitas." />}
                />
              </div>
            </ChartCard>
          </div>

          <ChartCard
            title="De onde, no Brasil"
            hint="Estado de cada visita, pela localização aproximada da conexão (sem GPS e sem guardar IP)."
            table={{
              columns: ["Estado", "Visitas"],
              rows: [...data.states.map((s) => [s.label, s.total] as [string, number]), ["Sem estado", data.stateUnknown]],
            }}
          >
            <div className="mt-4">
              <LeadsMap
                byState={data.states}
                unknown={data.stateUnknown}
                noun={["visita", "visitas"]}
                emptyText="Nenhuma visita do Brasil com estado identificado no período."
                unknownText={(n) => `${plural(n, "visita", "visitas")} do Brasil sem estado identificado.`}
              />
            </div>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-12">
            <ChartCard
              className="lg:col-span-7"
              title="Páginas mais vistas"
              hint="Visualizações, pessoas e orçamentos de quem entrou no site por essa página."
              table={{
                columns: ["Página", "Visualizações", "Visitantes", "Orçamentos"],
                rows: data.pages.map((p) => [p.label, p.total, p.visitors, p.leads]),
              }}
            >
              <div className="mt-4">
                <RankList
                  data={data.pages.map((p) => ({
                    label: p.label,
                    value: p.total,
                    sub: [plural(p.visitors, "pessoa", "pessoas"), p.leads ? plural(p.leads, "orçamento", "orçamentos") : ""]
                      .filter(Boolean)
                      .join(" · "),
                  }))}
                  valueLabel={(v) => plural(v, "visualização", "visualizações")}
                  empty={<EmptyState icon={<Eye size={18} />} title="Sem páginas vistas ainda" text="Aparece com as primeiras visitas." />}
                />
              </div>
            </ChartCard>

            <ChartCard
              className="lg:col-span-5"
              title="Cidades"
              hint="As 10 cidades com mais visitas."
              table={{ columns: ["Cidade", "Visitas"], rows: data.cities.map((c) => [c.label, c.total]) }}
            >
              <div className="mt-4">
                <RankList
                  data={data.cities.map((c) => ({ label: c.label, value: c.total }))}
                  valueLabel={(v) => plural(v, "visita", "visitas")}
                  empty={<EmptyState icon={<Users size={18} />} title="Sem cidades ainda" text="Aparece com as primeiras visitas." />}
                />
              </div>
            </ChartCard>
          </div>

          {(data.campaigns.length > 0 || data.countries.length > 0) && (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.campaigns.length > 0 && (
                <ChartCard
                  title="Campanhas"
                  hint="Links com utm_campaign (anúncios, e-mail, posts)."
                  table={{ columns: ["Campanha", "Visitas", "Orçamentos"], rows: data.campaigns.map((c) => [c.label, c.total, c.leads]) }}
                >
                  <div className="mt-4">
                    <RankList
                      data={data.campaigns.map((c) => ({
                        label: c.label,
                        value: c.total,
                        sub: c.leads ? plural(c.leads, "orçamento", "orçamentos") : undefined,
                      }))}
                      valueLabel={(v) => plural(v, "visita", "visitas")}
                      empty={null}
                    />
                  </div>
                </ChartCard>
              )}
              {data.countries.length > 0 && (
                <ChartCard
                  title="Outros países"
                  hint="Visitas de fora do Brasil (a página de exportação atende em inglês e espanhol)."
                  table={{ columns: ["País", "Visitas"], rows: data.countries.map((c) => [COUNTRY.of(c.label) ?? c.label, c.total]) }}
                >
                  <div className="mt-4">
                    <RankList
                      data={data.countries.map((c) => ({ label: COUNTRY.of(c.label) ?? c.label, value: c.total }))}
                      valueLabel={(v) => plural(v, "visita", "visitas")}
                      empty={null}
                    />
                  </div>
                </ChartCard>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
