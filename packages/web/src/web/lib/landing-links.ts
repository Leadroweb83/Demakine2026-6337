/**
 * Links e mensagens das páginas com URL própria (categorias e comerciais). Arquivo leve de propósito: o rodapé, o menu e o
 * CTA fixo carregam em todas as páginas, e o texto das páginas fica em landing-pages.ts (só baixa quando alguém abre uma).
 */

import { locale } from "./i18n";

/** Mensagem pronta do WhatsApp e do formulário de cada página, por slug. */
export const WA: Record<string, string> = {
  "esteiras-transportadoras": "Olá! Quero falar com um vendedor sobre esteira transportadora.",
  "roscas-transportadoras": "Olá! Quero falar com um vendedor sobre rosca transportadora.",
  "elevadores": "Olá! Quero falar com um vendedor sobre elevador de canecas ou de sacaria.",
  "maquinas-de-costurar-sacos": "Olá! Quero falar com um vendedor sobre máquina de costurar sacos.",
  "fabricante-de-esteira-transportadora": "Olá! Quero falar com um vendedor da fábrica de esteiras transportadoras.",
  "esteira-transportadora-industrial": "Olá! Quero falar com um vendedor sobre esteira transportadora industrial.",
  "esteira-para-carga-e-descarga-de-caminhao": "Olá! Quero falar com um vendedor sobre esteira para carga e descarga de caminhão.",
  "esteira-transportadora-preco": "Olá! Quero saber o preço de uma esteira transportadora.",
  "rosca-transportadora-preco": "Olá! Quero saber o preço de uma rosca transportadora.",
  "maquina-de-costurar-sacos-preco": "Olá! Quero saber o preço de uma máquina de costurar sacos.",
};

/** Página de categoria de cada categoria do catálogo (content.json), para breadcrumb, menu e rodapé. */
export const CATEGORY_PAGE: Record<string, string> = {
  "esteiras-transportadoras": "/esteiras-transportadoras",
  "roscas-transportadoras": "/roscas-transportadoras",
  elevadores: "/elevadores",
  "empacotamento-e-costura": "/maquinas-de-costurar-sacos",
};

/**
 * Endereço da categoria: a página própria em português, e o catálogo filtrado nos outros idiomas (a página existe só em
 * português). Todos os links internos de categoria passam por aqui.
 */
export function categoryHref(slug: string): string {
  return (locale() === "pt" && CATEGORY_PAGE[slug]) || `/produtos?cat=${slug}`;
}

/** Página "…: preço" de cada categoria; elevadores não tem. */
export const PRICE_PAGE: Record<string, { label: string; to: string }> = {
  "esteiras-transportadoras": { label: "Esteira transportadora: preço", to: "/esteira-transportadora-preco" },
  "roscas-transportadoras": { label: "Rosca transportadora: preço", to: "/rosca-transportadora-preco" },
  "empacotamento-e-costura": { label: "Máquina de costurar sacos: preço", to: "/maquina-de-costurar-sacos-preco" },
};

/** Coluna "Soluções" do rodapé, na ordem pedida pelo Marketing. */
export const SOLUTIONS: { label: string; to: string }[] = [
  { label: "Fabricante de esteira transportadora", to: "/fabricante-de-esteira-transportadora" },
  { label: "Esteira transportadora: preço", to: "/esteira-transportadora-preco" },
  { label: "Esteira transportadora industrial", to: "/esteira-transportadora-industrial" },
  { label: "Esteira para carga e descarga", to: "/esteira-para-carga-e-descarga-de-caminhao" },
  { label: "Rosca transportadora: preço", to: "/rosca-transportadora-preco" },
  { label: "Máquina de costurar sacos: preço", to: "/maquina-de-costurar-sacos-preco" },
];

const ROLETES = "/produtos/esteira-de-roletes-livres";
const clean = (path: string) => path.split("?")[0]!.replace(/\/+$/, "");

/** Páginas que mostram os dois chamados (WhatsApp e orçamento): as 10 páginas próprias e a roletes livres. */
export function isVendorPage(path: string): boolean {
  return clean(path).slice(1) in WA || clean(path) === ROLETES;
}

/** Mensagem pronta do WhatsApp para a página, ou undefined fora dessas páginas. */
export function vendorMessage(path: string): string | undefined {
  const c = clean(path);
  if (c === ROLETES) return "Olá! Quero falar com um vendedor sobre a Esteira de Roletes Livres.";
  return WA[c.slice(1)];
}
