/** Abas da área SEO e GEO, na ordem em que aparecem. O id é também o que as dicas usam para apontar a aba de ação. */
export const SEO_GEO_TABS = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "paginas", label: "Páginas" },
  { id: "melhorar", label: "O que melhorar" },
  { id: "regras", label: "Regras" },
  { id: "links", label: "Links" },
  { id: "enderecos-antigos", label: "Endereços antigos" },
  { id: "imagens", label: "Imagens" },
  { id: "dados-estruturados", label: "Dados estruturados" },
  { id: "dicas", label: "Dicas" },
] as const;

export type SeoGeoTab = (typeof SEO_GEO_TABS)[number]["id"];
