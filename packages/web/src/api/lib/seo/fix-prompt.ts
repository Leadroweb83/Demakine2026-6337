/**
 * Pacote de prompt em JSON (puro) para o que o painel não grava sozinho: página nova, post, ajuste no código.
 * O Leandro copia e cola no Claude. Não leva segredo, senha nem dado de lead: só números do duelo e regras do projeto.
 * Quem recebe o JSON não vê o painel: nada aqui manda "olhar a aba tal"; as regras mudam conforme a métrica.
 */
import type { DuelAction } from "./duel-actions";
import { SCHEMA_TYPES_TARGET, type MetricId, type Verdict } from "./duel-metrics";

export type PromptPack = {
  versao: 1;
  tipo: "pagina" | "post" | "codigo" | "texto";
  metrica: MetricId;
  concorrente: string;
  diferenca: { nos: number; eles: number; unidade: Verdict["unit"] };
  objetivo: string;
  paginasAlvo: { path: string; label: string }[];
  /** como a nota é calculada e em que arquivos mexer */
  contexto: string[];
  regras: string[];
  entrega: string[];
};

const TIPO: Record<MetricId, PromptPack["tipo"]> = {
  tamanho: "pagina",
  blog: "post",
  h1: "codigo",
  schema: "codigo",
  idiomas: "codigo",
  conteudo: "texto",
  titulo: "texto",
  descricao: "texto",
  imagens: "texto",
  compartilhamento: "texto",
};

const SITE_URL = "https://www.demakine.com.br";
const I18N = "Todo texto novo precisa de tradução em src/web/i18n/en.json e src/web/i18n/es.json.";
const I18N_TAMANHO =
  "Texto novo de produto, segmento e post precisa de tradução em src/web/i18n/en.json e src/web/i18n/es.json. As páginas com URL própria (content/landing/*.md) ficam só em português.";
const TITLE_DESC_H1 = "Título de 30 a 60 caracteres, descrição de 70 a 155, um único H1 por página, com o assunto principal no começo.";
const PAGINA_NOVA = "Toda página nova leva dados estruturados (Product, FAQ ou BreadcrumbList quando couber) e links internos para produtos relacionados.";

/** Vale para qualquer pedido. */
const REGRAS_BASE = [
  "Escreva em português do Brasil, com tom direto e técnico, sem frases genéricas de texto de IA.",
  "Passe o texto pelo stop-slop-pt-br antes de entregar.",
  "Não invente número, prazo nem especificação técnica: use só o que está no catálogo (src/web/data/content.json) ou pergunte ao dono.",
];

/** Regras próprias de cada métrica (o que a nota mede e o que não pode ser feito para enganá-la). */
const REGRAS_DA_METRICA: Record<MetricId, string[]> = {
  titulo: ["Título de 30 a 60 caracteres, com o assunto principal no começo e a marca no fim."],
  descricao: ["Descrição de 70 a 155 caracteres, dizendo o que a pessoa ganha ao clicar."],
  h1: ["Um único H1 por página, com o assunto dela."],
  conteudo: ["Cada página com pelo menos 300 palavras úteis: o que é, para quem serve, prazos e dúvidas comuns. Texto de enchimento piora a página."],
  imagens: ["Todo alt descreve o que a foto mostra em uma frase curta. Não repita só o nome do produto."],
  compartilhamento: ["Título, descrição e imagem de compartilhamento (og:title, og:description, og:image) preenchidos em toda página."],
  idiomas: [
    "O hreflang de cada página lista pt-BR, en, es e x-default, e cada versão aponta de volta para as outras.",
    "Página só em português de propósito (as de content/landing/*.md e as vagas) não entra na conta: expectedHreflangs, em src/api/lib/seo/pages.ts, diz quais são.",
  ],
  schema: [
    `Meta: cada página com pelo menos ${SCHEMA_TYPES_TARGET} tipos de dados estruturados distintos, só com tipos que descrevem de verdade a página (Product, BreadcrumbList, FAQPage, Article, Service, ou WebPage ligada ao WebSite e à Organization).`,
    "Não invente conteúdo para fechar a conta: FAQPage só com perguntas e respostas que já estão visíveis na página; Product só com dados do catálogo.",
    "Valide cada tipo no Rich Results Test do Google e no validador do schema.org antes de abrir o PR.",
    "Mantenha expectedSchema e o teste schema-expectations em sincronia com o que a página passa a emitir.",
  ],
  tamanho: [
    TITLE_DESC_H1,
    PAGINA_NOVA,
    "Crie uma página só se houver demanda de busca clara por ela (confira no Search Console e nas consultas reais). Página fina, feita só para somar número, piora o site.",
    "Cada página nova responde a uma intenção diferente das que já existem (segmento, aplicação, dúvida) e tem pelo menos 300 palavras úteis.",
    "Antes de criar, confira o sitemap.xml: assunto que já tem URL vira melhoria da página existente, não página nova.",
  ],
  blog: [
    TITLE_DESC_H1,
    "Cada post linka pelo menos um produto relacionado e tem capa.",
    "Ritmo de publicação combinado com o dono, sem encher o blog de post sem utilidade.",
  ],
};

/** Texto do objetivo para quem lê fora do painel, nas métricas em que o texto do painel manda olhar uma aba. */
const OBJETIVO_FORA_DO_PAINEL: Partial<Record<MetricId, (rival: string) => string>> = {
  schema: (r) => `${r} emite mais tipos de dados estruturados (JSON-LD) por página. Complete os das páginas da lista até chegar a ${SCHEMA_TYPES_TARGET} tipos distintos, sem inventar conteúdo.`,
};

/** Como a nota é calculada, onde mexer e o que esperar. */
const CONTEXTO: Partial<Record<MetricId, (a: DuelAction, v: Verdict) => string[]>> = {
  schema: (a, v) => [
    `Nota do duelo: Demakine ${v.ours}, ${a.competitor} ${v.theirs}.`,
    `A nota de cada página é min(tipos de JSON-LD distintos, ${SCHEMA_TYPES_TARGET}) ÷ ${SCHEMA_TYPES_TARGET}, e o site recebe a média das páginas.`,
    "O JSON-LD de cada página sai de src/web/components/seo.tsx (componente Seo; a trilha BreadcrumbList é montada ali) e dos montadores de src/web/lib/schema.ts. Nas páginas com URL própria, o schema passa por src/web/lib/landing-pages.ts.",
    "src/api/lib/seo/pages.ts (expectedSchema) lista os tipos esperados por tipo de página, e tests/seo/schema-expectations.test.ts compara isso com o HTML pré-renderizado: mude os dois juntos.",
    "paginasAlvo traz as páginas com menos de 3 tipos (as 5 piores). Se vier vazia, o duelo não guardou a lista: confira cada tipo de página no HTML pré-renderizado.",
  ],
  tamanho: (a, v) => [
    `Nota do duelo: Demakine ${v.ours} páginas, ${a.competitor} ${v.theirs} páginas (URLs do sitemap.xml).`,
    `O número de ${a.competitor} soma qualquer URL indexável do sitemap dele, inclusive página fina ou antiga. O objetivo não é igualar o número, é cobrir as buscas que a Demakine ainda não atende.`,
    `URLs que já existem: ${SITE_URL}/sitemap.xml. Não crie página para assunto que já tem URL.`,
    "Onde criar: páginas com URL própria em content/landing/*.md (depois bun run landing:build); segmentos em /segmentos/:slug (src/web/pages/segmento.tsx); posts e produtos pelo painel.",
  ],
};

const ENTREGA = [
  "Crie uma branch a partir da main e não faça commit na main.",
  "Escreva os testes antes do código e rode bun test, bun run typecheck e bun run lint.",
  "Abra um PR e confira o preview da Vercel.",
  "O merge só acontece com a autorização do dono do projeto.",
];

export function buildPromptPack(action: DuelAction, verdict: Verdict): PromptPack {
  const metric = action.metric;
  const objetivo = OBJETIVO_FORA_DO_PAINEL[metric]?.(action.competitor) ?? action.how;
  return {
    versao: 1,
    tipo: TIPO[metric],
    metrica: metric,
    concorrente: action.competitor,
    diferenca: { nos: verdict.ours, eles: verdict.theirs, unidade: verdict.unit },
    objetivo: `${action.title}. ${objetivo}`,
    paginasAlvo: action.pages.map((p) => ({ path: p.path, label: p.label })),
    contexto: CONTEXTO[metric]?.(action, verdict) ?? [],
    regras: [...REGRAS_BASE, ...REGRAS_DA_METRICA[metric], metric === "tamanho" ? I18N_TAMANHO : I18N],
    entrega: [...ENTREGA],
  };
}

export const packToJson = (pack: PromptPack): string => JSON.stringify(pack, null, 2);
