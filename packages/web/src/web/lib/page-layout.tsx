import { Fragment, type ReactNode } from "react";
import { editedDoc } from "./runtime-content";

/**
 * Ordem e visibilidade das seções da home e das páginas de produto, editáveis no painel
 * (coleção "layout", chaves "home" e "produto"). O topo de cada página fica fixo.
 *
 * Fundo: seções claras alternam branco e cinza sozinhas. Cada uma tem um tom preferido;
 * se ficar colada numa vizinha do mesmo tom, troca. Seções escuras mantêm o próprio fundo.
 */
export type LayoutPage = "home" | "produto";
export type LightTone = "white" | "surface";

export type SectionDef = {
  id: string;
  label: string;
  /** light: fundo automático; dark: fundo próprio escuro; strip: faixa fina que não conta na alternância */
  kind: "light" | "dark" | "strip";
  tone?: LightTone;
  /** não pode ser escondida (formulários de orçamento) */
  locked?: boolean;
  /** aparece só em parte dos produtos */
  note?: string;
};

export const PAGE_SECTIONS: Record<LayoutPage, SectionDef[]> = {
  home: [
    { id: "clientes", label: "Logos de clientes", kind: "strip" },
    { id: "categorias", label: "Linhas de produto", kind: "light", tone: "white" },
    { id: "video", label: "Vídeo institucional", kind: "dark" },
    { id: "mais-procurados", label: "Mais procurados", kind: "light", tone: "surface" },
    { id: "campeas", label: "Campeãs de vendas", kind: "dark" },
    { id: "agro", label: "Faixa agro", kind: "dark" },
    { id: "diferenciais", label: "Por que Demakine", kind: "light", tone: "white" },
    { id: "projetos", label: "Projetos especiais", kind: "dark" },
    { id: "segmentos", label: "Segmentos atendidos", kind: "light", tone: "surface" },
    { id: "frase", label: "Frase em movimento", kind: "dark" },
    { id: "processo", label: "Como fabricamos", kind: "light", tone: "white" },
    { id: "mapa", label: "Mapa e ferramentas", kind: "dark" },
    { id: "depoimentos", label: "Depoimentos", kind: "light", tone: "surface" },
    { id: "blog", label: "Blog e vagas", kind: "light", tone: "white" },
    { id: "contato", label: "Contato e orçamento", kind: "dark", locked: true },
  ],
  produto: [
    { id: "sobre", label: "Sobre o equipamento", kind: "light", tone: "surface" },
    { id: "videos", label: "Veja funcionando (vídeos)", kind: "light", tone: "white", note: "só produtos com vídeo" },
    { id: "anatomia", label: "Anatomia do equipamento", kind: "dark", note: "só esteiras" },
    { id: "modelos", label: "Tabela de modelos", kind: "light", tone: "white", note: "só produtos com modelos" },
    { id: "material", label: "Para qual material serve", kind: "light", tone: "white" },
    { id: "erros", label: "3 erros que custam caro", kind: "light", tone: "surface" },
    { id: "instalacao", label: "Ficha de instalação", kind: "light", tone: "white" },
    { id: "pecas", label: "Peças de reposição", kind: "light", tone: "surface" },
    { id: "checklist", label: "Checklist de manutenção", kind: "light", tone: "white", note: "não aparece em linha e máquinas de terceiros" },
    { id: "faq", label: "Perguntas frequentes", kind: "light", tone: "surface" },
    { id: "orcamento", label: "Formulário de orçamento", kind: "light", tone: "surface", locked: true },
    { id: "relacionados", label: "Equipamentos relacionados", kind: "light", tone: "white" },
    { id: "cta", label: "Faixa final de orçamento", kind: "dark" },
  ],
};

export type LayoutData = { order: string[]; hidden: string[] };

/** Ordem salva + seções novas do código no lugar padrão delas; ids que não existem mais saem. */
export function resolveLayout(page: LayoutPage, saved?: Partial<LayoutData>): LayoutData {
  const defs = PAGE_SECTIONS[page];
  const known = new Set(defs.map((d) => d.id));
  const order = [...new Set((saved?.order ?? []).filter((id) => known.has(id)))];
  defs.forEach((d, idx) => {
    if (order.includes(d.id)) return;
    const before = defs.slice(0, idx).reverse().find((p) => order.includes(p.id));
    order.splice(before ? order.indexOf(before.id) + 1 : 0, 0, d.id);
  });
  const locked = new Set(defs.filter((d) => d.locked).map((d) => d.id));
  const hidden = [...new Set((saved?.hidden ?? []).filter((id) => known.has(id) && !locked.has(id)))];
  return { order, hidden };
}

export function pageLayout(page: LayoutPage) {
  return resolveLayout(page, editedDoc<LayoutData>("layout", page));
}

export type SectionBg = LightTone | "dark" | "strip";

/** Fundo de cada seção visível, na ordem: a clara troca de tom quando cola numa vizinha igual. */
export function sectionBackgrounds(page: LayoutPage, visibleIds: string[]) {
  const defs = new Map(PAGE_SECTIONS[page].map((d) => [d.id, d]));
  const out = new Map<string, SectionBg>();
  let prev: "white" | "surface" | "dark" | null = null;
  for (const id of visibleIds) {
    const def = defs.get(id);
    if (!def) continue;
    if (def.kind === "light") {
      let tone: LightTone = def.tone ?? "white";
      if (prev === tone) tone = tone === "white" ? "surface" : "white";
      prev = tone;
      out.set(id, tone);
    } else if (def.kind === "dark") {
      prev = "dark";
      out.set(id, "dark");
    } else {
      out.set(id, "strip");
    }
  }
  return out;
}

export type Block = { show?: boolean; render: (tone: LightTone) => ReactNode };

/** Renderiza as seções na ordem do painel, com o fundo das claras alternado. */
export function PageSections({
  page,
  blocks,
  layout,
}: {
  page: LayoutPage;
  blocks: Record<string, Block>;
  /** para a prévia do painel; no site vem do conteúdo publicado */
  layout?: LayoutData;
}) {
  const { order, hidden } = layout ?? pageLayout(page);
  const visible = order.filter((id) => blocks[id] && blocks[id].show !== false && !hidden.includes(id));
  const bg = sectionBackgrounds(page, visible);
  return (
    <>
      {visible.map((id) => {
        const tone = bg.get(id);
        return <Fragment key={id}>{blocks[id]!.render(tone === "surface" ? "surface" : "white")}</Fragment>;
      })}
    </>
  );
}
