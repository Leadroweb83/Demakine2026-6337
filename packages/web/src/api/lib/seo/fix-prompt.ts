/**
 * Pacote de prompt em JSON (puro) para o que o painel não grava sozinho: página nova, post, ajuste no código.
 * O Leandro copia e cola no Claude. Não leva segredo, senha nem dado de lead: só números do duelo e regras do projeto.
 */
import type { DuelAction } from "./duel-actions";
import type { MetricId, Verdict } from "./duel-metrics";

export type PromptPack = {
  versao: 1;
  tipo: "pagina" | "post" | "codigo" | "texto";
  metrica: MetricId;
  concorrente: string;
  diferenca: { nos: number; eles: number; unidade: Verdict["unit"] };
  objetivo: string;
  paginasAlvo: { path: string; label: string }[];
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

const REGRAS = [
  "Escreva em português do Brasil, com tom direto e técnico, sem frases genéricas de texto de IA.",
  "Título de 30 a 60 caracteres, descrição de 70 a 155, um único H1 por página, com o assunto principal no começo.",
  "Toda página nova leva dados estruturados (Product, FAQ ou BreadcrumbList quando couber) e links internos para produtos relacionados.",
  "Todo texto novo precisa de tradução em src/web/i18n/en.json e src/web/i18n/es.json.",
  "Passe o texto pelo stop-slop-pt-br antes de entregar.",
  "Não invente número, prazo nem especificação técnica: use só o que está no catálogo (src/web/data/content.json) ou pergunte ao dono.",
];

const ENTREGA = [
  "Crie uma branch a partir da main e não faça commit na main.",
  "Escreva os testes antes do código e rode bun test, bun run typecheck e bun run lint.",
  "Abra um PR e confira o preview da Vercel.",
  "O merge só acontece com a autorização do dono do projeto.",
];

export function buildPromptPack(action: DuelAction, verdict: Verdict): PromptPack {
  return {
    versao: 1,
    tipo: TIPO[action.metric],
    metrica: action.metric,
    concorrente: action.competitor,
    diferenca: { nos: verdict.ours, eles: verdict.theirs, unidade: verdict.unit },
    objetivo: `${action.title}. ${action.how}`,
    paginasAlvo: action.pages.map((p) => ({ path: p.path, label: p.label })),
    regras: [...REGRAS],
    entrega: [...ENTREGA],
  };
}

export const packToJson = (pack: PromptPack): string => JSON.stringify(pack, null, 2);
