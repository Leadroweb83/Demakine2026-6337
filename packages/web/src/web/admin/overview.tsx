import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ROLE_LABEL, type PanelUser } from "../lib/auth";
import { BarList, Card, ColumnChart, PageTitle, Stat } from "./ui";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1] ?? m}/${(y ?? "").slice(2)}`;
}

export function AdminOverview({ user, onGo }: { user: PanelUser; onGo: (id: string) => void }) {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await api.admin.overview.$get();
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
  });

  const data = overview.data;

  return (
    <div className="space-y-8">
      <PageTitle
        title={`Olá, ${user.name.split(" ")[0]}`}
        hint={`Você está no painel como ${ROLE_LABEL[user.role] ?? user.role}. Este é o resumo do que está acontecendo no site.`}
      />

      {data?.canSeeLeads ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Leads no total" value={data.totalLeads} hint="Desde o lançamento do site" />
            <Stat label="Últimos 30 dias" value={data.leadsLast30} hint="Contatos recebidos no mês corrente" />
            <Stat
              label="Origens ativas"
              value={data.bySource.length}
              hint="Formulários e páginas que geraram contato"
            />
            <Stat label="Usuários do painel" value={data.totalUsers} hint="Contas com acesso" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <h2 className="font-display text-[15px] font-extrabold text-dm-ink">
                Leads por mês
              </h2>
              <p className="mt-1 text-[12.5px] text-dm-ink/55">Últimos 12 meses com registro.</p>
              <div className="mt-6">
                <ColumnChart
                  data={(data.byMonth ?? []).map((m) => ({ label: monthLabel(m.month), value: m.total }))}
                />
              </div>
            </Card>
            <Card>
              <h2 className="font-display text-[15px] font-extrabold text-dm-ink">
                De onde vêm os leads
              </h2>
              <p className="mt-1 text-[12.5px] text-dm-ink/55">Volume por origem do formulário.</p>
              <div className="mt-6">
                <BarList
                  data={(data.bySource ?? []).slice(0, 8).map((s) => ({ label: s.source, value: s.total }))}
                />
              </div>
            </Card>
          </div>

          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-[15px] font-extrabold text-dm-ink">
                Trabalhar os leads
              </h2>
              <p className="mt-1 text-[12.5px] text-dm-ink/55">
                Lista completa com telefone, interesse, fotos enviadas e atalho de WhatsApp.
              </p>
            </div>
            <button
              onClick={() => onGo("leads")}
              className="rounded-full bg-dm-blue px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white hover:bg-[#0d3480]"
            >
              Abrir leads
            </button>
          </Card>
        </>
      ) : (
        <Card>
          <h2 className="font-display text-[15px] font-extrabold text-dm-ink">
            Seu acesso é de conteúdo
          </h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-dm-ink/65">
            O papel de editor não enxerga leads nem dados comerciais. As áreas de blog, cases,
            depoimentos e mídia entram nas próximas fases do painel e aparecerão aqui no menu.
          </p>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-[15px] font-extrabold text-dm-ink">Próximas fases</h2>
        <ul className="mt-3 grid gap-2 text-[13.5px] text-dm-ink/70 sm:grid-cols-2">
          <li>CRM de leads com status, anotações e exportação</li>
          <li>Catálogo, loja e conteúdo do site editáveis</li>
          <li>Área de vagas e candidaturas</li>
          <li>Editor de blog com IA, SEO e GEO</li>
          <li>Biblioteca de mídia com tratamento automático de imagem</li>
          <li>Aviso de novo lead por e-mail</li>
        </ul>
      </Card>
    </div>
  );
}
