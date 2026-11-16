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
export type FixItem = {
  id: string;
  kind: FixKind;
  path: string;
  label: string;
  field: FixField;
  target?: string;
  before: string;
  after: string;
  /** título, descrição e imagem: o "antes" veio de um valor do painel? Se não veio, o desfazer remove o campo em vez de fixar o texto do código */
  hadOverride?: boolean;
};

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

const STOP = new Set(["de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos", "para", "por", "com", "sob", "sobre", "e", "ou", "que", "a", "o", "as", "os", "um", "uma", "ao", "à", "sua", "seu", "suas", "seus", "nossa", "nosso"]);

/** Tira pontuação solta e preposição, artigo ou pronome pendurados no fim ("ideal para a sua" vira "ideal"). */
function trimTail(text: string): string {
  const words = text.replace(/[\s|,:;\-–]+$/, "").split(" ");
  while (words.length > 1 && STOP.has((words[words.length - 1] ?? "").toLowerCase().replace(/[.,;:]+$/, ""))) words.pop();
  return words.join(" ").replace(/[\s|,:;\-–]+$/, "");
}

/** Corta por palavra até caber em `max` caracteres (sem reticências e sem preposição pendurada); palavra única maior que o limite é cortada seca. */
function cutWords(text: string, max: number): string {
  let out = "";
  for (const w of text.split(" ")) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  return trimTail(out || text.slice(0, Math.max(0, max)));
}

/** Texto atual com menos que isto não diz nada (ex.: "T"): a proposta parte do rótulo. */
const MIN_KEEP = 15;
const SENTENCE_END = /[.!?]$/;

/**
 * Título proposto. Com título atual de sentido, parte DELE (encurta ou ganha a marca): trocar um título escrito à mão
 * pelo rótulo do menu piora a página. Só cai no rótulo quando não há título (ou ele é curto demais para dizer algo).
 */
export function proposeTitle(label: string, current = ""): string {
  const cur = clean(current);
  if (cur.length >= MIN_KEEP) {
    if (cur.length > TITLE_MAX) {
      const cut = cutWords(cur, TITLE_MAX);
      if (cut.length >= TITLE_MIN) return cut;
    } else if (cur.length < TITLE_MIN) {
      const tails = /demakine/i.test(cur) ? [" em Limeira/SP", " | Equipamentos Agroindustriais"] : BRAND;
      for (const tail of tails) {
        const t = `${cur}${tail}`;
        if (t.length >= TITLE_MIN && t.length <= TITLE_MAX) return t;
      }
    } else {
      return cur;
    }
  }
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
  blog: (n) => `${n}: artigo do blog da Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Leia na íntegra e tire suas dúvidas.`,
  cases: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  segmentos: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  vagas: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  exportacao: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  institucional: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
  tecnica: (n) => `${n} na Demakine, fábrica de esteiras, roscas e elevadores em Limeira/SP. Conheça e fale com a nossa equipe.`,
};

/** Descrição proposta: parte do texto atual (corta na última frase inteira que cabe, ou ganha o convite); sem texto, usa o modelo da área. */
export function proposeDescription(label: string, area: SiteArea, current = ""): string {
  const cur = clean(current);
  if (cur.length >= 40) {
    if (cur.length > DESC_MAX) {
      const head = cur.slice(0, DESC_MAX);
      const end = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
      if (end + 1 >= DESC_MIN) return cur.slice(0, end + 1);
      const cut = cutWords(cur, DESC_MAX - 1);
      return SENTENCE_END.test(cut) ? cut : `${cut}.`;
    }
    if (cur.length < DESC_MIN) return `${cur}${SENTENCE_END.test(cur) ? "" : "."} Peça seu orçamento com a Demakine.`;
    return cur;
  }
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

/** Quantas páginas têm o problema, com ou sem proposta do painel (o resto se resolve no código do site). */
export function countFailing(kind: FixKind, pages: FixPage[]): number {
  return pages.filter((p) => failing(p, kind)).length;
}

/** A home e as páginas técnicas (obrigado, loja) ficam fora: a home é escrita à mão e as outras nem aparecem no Google. */
const textEligible = (p: FixPage) => p.path !== "/" && p.area !== "tecnica";

export function buildProposals(kind: FixKind, pages: FixPage[]): FixItem[] {
  const out: FixItem[] = [];
  for (const p of pages) {
    if (!failing(p, kind)) continue;
    if (kind === "titulo" || kind === "descricao") {
      if (!textEligible(p)) continue;
      const field = kind === "titulo" ? "title" : "description";
      const before = currentValue(p, field);
      const after = kind === "titulo" ? proposeTitle(p.label, before) : proposeDescription(p.label, p.area, before);
      const hadOverride = typeof p.overrides[field] === "string" && p.overrides[field] !== "";
      if (after !== before) out.push({ id: id(kind, p.path), kind, path: p.path, label: p.label, field, before, after, hadOverride });
    } else {
      const slug = /^\/produtos\/([a-z0-9-]+)$/.exec(p.path)?.[1];
      if (!slug) continue;
      const own = p.facts!.images.filter((i) => ownPath(i.src)?.startsWith(`/img/produtos/${slug}/`));
      if (kind === "compartilhamento") {
        if (p.overrides.ogImage || p.facts!.og.image) continue;
        const first = own.map((i) => ownPath(i.src)).find((x): x is string => x !== null);
        if (first) out.push({ id: id(kind, p.path), kind, path: p.path, label: p.label, field: "ogImage", before: "", after: first, hadOverride: false });
      } else {
        own.forEach((img, i) => {
          if (img.alt !== null && img.alt.trim() !== "") return;
          out.push({ id: id(kind, p.path, img.src), kind, path: p.path, label: p.label, field: "alt", target: img.src, before: "", after: proposeAlt(p.label, i + 1) });
        });
      }
    }
  }
  return out;
}
