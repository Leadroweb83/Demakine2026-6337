import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { PageTitle } from "../ui";
import { Improve } from "./improve";
import { Overview } from "./overview";
import { Pages } from "./pages";
import { Rules } from "./rules";
import { Links } from "./links";
import { OldUrls } from "./old-urls";
import { Images } from "./images";
import { Structured } from "./structured";
import { Tips } from "./tips";
import { SEO_GEO_TABS, type SeoGeoTab } from "./tabs";

/** O que cada aba recebe: ir para outra aba (opcionalmente já numa página) e a página aberta, se houver. */
export type PanelProps = { go: (tab: SeoGeoTab, path?: string) => void; path?: string };

const PANELS: Record<SeoGeoTab, (p: PanelProps) => ReactNode> = {
  "visao-geral": () => <Overview />,
  paginas: (p) => <Pages {...p} />,
  melhorar: (p) => <Improve {...p} />,
  regras: () => <Rules />,
  links: (p) => <Links {...p} />,
  "enderecos-antigos": (p) => <OldUrls {...p} />,
  imagens: (p) => <Images {...p} />,
  "dados-estruturados": (p) => <Structured {...p} />,
  dicas: (p) => <Tips {...p} />,
};

/** Área "SEO e GEO" do painel (só super admin): abas com a visão geral, as páginas, as regras e as ferramentas. */
export function SeoGeo() {
  const [state, setState] = useState<{ tab: SeoGeoTab; path?: string }>({ tab: "visao-geral" });
  const buttons = useRef<Partial<Record<SeoGeoTab, HTMLButtonElement | null>>>({});

  const go = (tab: SeoGeoTab, path?: string) => setState({ tab, path });

  // setas do teclado andam entre as abas (padrão de abas acessíveis)
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = SEO_GEO_TABS.length - 1;
    const next = e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    const id = SEO_GEO_TABS[next]!.id;
    go(id);
    buttons.current[id]?.focus();
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="SEO e GEO"
        hint="Auditoria diária de todas as páginas do site, notas por setor, o que melhorar e as regras de SEO de cada página. Só o super admin vê esta área."
      />
      <div role="tablist" aria-label="Seções de SEO e GEO" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {SEO_GEO_TABS.map((t, i) => {
          const active = t.id === state.tab;
          return (
            <button
              key={t.id}
              ref={(el) => {
                buttons.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`seo-geo-tab-${t.id}`}
              aria-selected={active}
              aria-controls={`seo-geo-panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => go(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-4 text-[12.5px] font-bold transition-colors ${
                active ? "bg-dm-blue text-white" : "bg-white text-dm-ink/70 shadow-sm hover:bg-black/[0.04] hover:text-dm-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`seo-geo-panel-${state.tab}`} aria-labelledby={`seo-geo-tab-${state.tab}`}>
        {PANELS[state.tab]({ go, path: state.path })}
      </div>
    </div>
  );
}
