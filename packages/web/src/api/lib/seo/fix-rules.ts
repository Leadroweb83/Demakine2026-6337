/**
 * Regras de proposta do botão "Corrigir" do duelo (puro): montam título, descrição, alt das fotos e imagem de
 * compartilhamento nos tamanhos recomendados. Só páginas em português que a auditoria conseguiu ler entram.
 * O texto é padronizado de propósito: a IA (Entrega 2) vem por ida e volta de JSON, no mesmo fluxo de revisão.
 */
import type { PageOverrides } from "../../../web/lib/seo-overrides";
import { ALLOWED_HOSTS } from "./crawl";
import type { PageFacts } from "./html";
import type { Check } from "./score";
import type { Lang, SiteArea } from "./types";

export type FixKind = "titulo" | "descricao" | "compartilhamento" | "imagens";
export const FIX_KINDS: readonly FixKind[] = ["titulo", "descricao", "compartilhamento", "imagens"];
export type FixField = "title" | "description" | "ogImage" | "alt";

export type FixPage = { path: string; label: string; lang: Lang; area: SiteArea; overrides: PageOverrides; facts: PageFacts | null; checks: Check[] };
export type FixItem = { id: string; kind: FixKind; path: string; label: string; field: FixField; target?: string; before: string; after: string };

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 155;
const ALT_MAX = 150;
const BRAND = [" | Demakine", " | Demakine Limeira/SP", " | Demakine Equipamentos Agroindustriais"];

/** Tira tags e espaços repetidos (inclusive o espaço sem quebra) e qualquer < ou > que sobrar. */
export function clean(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

/** Corta por palavra até caber em `max` caracteres (sem reticências); palavra única maior que o limite é cortada seca. */
function cutWords(text: string, max: number): string {
  let out = "";
  for (const w of text.split(" ")) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  return out || text.slice(0, Math.max(0, max));
}

export function proposeTitle(label: string): string {
  let name = clean(label);
  const room = TITLE_MAX - BRAND[0]!.length;
  if (name.length > room) name = cutWords(name, room);
  for (const suffix of BRAND) {
    const t = `${name}${suffix}`;
    if (t.length >= TITLE_MIN && t.length <= TITLE_MAX) return t;
  }
  return `${name}${BRAND[0]}`;
}

const DESCRIPTION: Record<SiteArea, (name: string) => string> = {
  produtos: (n) => `${n}: fabricação própria em Limeira/SP, sob medida e com garantia. Veja detalhes, aplicações e peça seu orçamento.`,
  categorias: (n) => `${n}: linha completa de equipamentos Demakine, fabricados em Limeira/SP. Compare modelos e peça seu orçamento.`,
  comerciais: (n) => `${n} sob medida para a sua operação. Fábrica própria em Limeira/SP, com projeto, entrega e assistência técnica.`,
  blog: (n) => `${n}: guia prático da Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Leia e tire suas dúvidas.`,
  cases: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  segmentos: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  vagas: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  exportacao: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  institucional: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  tecnica: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
};

export function proposeDescription(label: string, area: SiteArea): string {
  const build = DESCRIPTION[area];
  const budget = DESC_MAX - build("").length;
  let d = build(cutWords(clean(label), budget));
  if (d.length < DESC_MIN) d = `${d} Fale com a Demakine em Limeira/SP.`;
  return d;
}

export function proposeAlt(label: string, n: number): string {
  const tail = ` Demakine, foto ${n}`;
  return `${cutWords(clean(label), ALT_MAX - tail.length)}${tail}`;
}

/** Valor em uso hoje: o do painel (override) vence o que a auditoria leu na página. */
export function currentValue(page: FixPage, field: "title" | "description" | "ogImage"): string {
  const fromOverride = page.overrides[field];
  if (typeof fromOverride === "string" && fromOverride !== "") return fromOverride;
  const f = page.facts;
  return (field === "title" ? f?.title : field === "description" ? f?.description : f?.og.image) ?? "";
}

const CHECK_OF: Record<FixKind, Check["item"]> = { titulo: "titulo", descricao: "descricao", compartilhamento: "compartilhamento", imagens: "imagens" };

/** Página em português, auditada, com o item falhando (não pulado). */
function failing(p: FixPage, kind: FixKind): boolean {
  if (p.lang !== "pt" || !p.facts) return false;
  const c = p.checks.find((x) => x.item === CHECK_OF[kind]);
  return !!c && !c.ok && !c.skipped;
}

const id = (kind: FixKind, path: string, target?: string) => `${kind}:${path}:${target ?? ""}`;

/** Endereço completo do próprio site vira caminho; de outro site, null. */
function ownPath(src: string): string | null {
  try {
    const u = new URL(src);
    return ALLOWED_HOSTS.includes(u.hostname) ? u.pathname : null;
  } catch {
    return null;
  }
}

export function buildProposals(kind: FixKind, pages: FixPage[]): FixItem[] {
  const out: FixItem[] = [];
  for (const p of pages) {
    if (!failing(p, kind)) continue;
    if (kind === "titulo" || kind === "descricao") {
      const field = kind === "titulo" ? "title" : "description";
      const before = currentValue(p, field);
      const after = kind === "titulo" ? proposeTitle(p.label) : proposeDescription(p.label, p.area);
      if (after !== before) out.push({ id: id(kind, p.path), kind, path: p.path, label: p.label, field, before, after });
    } else if (kind === "compartilhamento") {
      if (p.overrides.ogImage || p.facts!.og.image) continue;
      const first = p.facts!.images.map((i) => ownPath(i.src)).find((x): x is string => x !== null);
      if (first) out.push({ id: id(kind, p.path), kind, path: p.path, label: p.label, field: "ogImage", before: "", after: first });
    } else {
      const slug = /^\/produtos\/([a-z0-9-]+)$/.exec(p.path)?.[1];
      if (!slug) continue;
      const own = p.facts!.images.filter((i) => ownPath(i.src)?.startsWith(`/img/produtos/${slug}/`));
      own.forEach((img, i) => {
        if (img.alt !== null && img.alt.trim() !== "") return;
        out.push({ id: id(kind, p.path, img.src), kind, path: p.path, label: p.label, field: "alt", target: img.src, before: "", after: proposeAlt(p.label, i + 1) });
      });
    }
  }
  return out;
}
