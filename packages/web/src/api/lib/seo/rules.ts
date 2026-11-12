/**
 * Regras da nota de SEO (editáveis no painel "SEO e GEO"). Funções puras: sem banco, sem rede.
 * Os pesos somam 100; sem medição de velocidade (até a Etapa 2) os 5 pontos dela se redistribuem.
 */
import { WA } from "../../../web/lib/landing-links";

export type SeoItem =
  | "titulo"
  | "descricao"
  | "h1"
  | "indexacao"
  | "idiomas"
  | "conteudo"
  | "imagens"
  | "links"
  | "schema"
  | "compartilhamento"
  | "velocidade";

export const SEO_ITEMS: SeoItem[] = [
  "titulo", "descricao", "h1", "indexacao", "idiomas", "conteudo", "imagens", "links", "schema", "compartilhamento", "velocidade",
];

/** Nome de cada item como a pessoa lê (mensagens de erro e telas). */
export const ITEM_NAMES: Record<SeoItem, string> = {
  titulo: "Título",
  descricao: "Descrição",
  h1: "Título principal (H1)",
  indexacao: "Indexação",
  idiomas: "Idiomas",
  conteudo: "Conteúdo",
  imagens: "Imagens",
  links: "Links internos",
  schema: "Dados estruturados",
  compartilhamento: "Compartilhamento",
  velocidade: "Velocidade",
};

export type SeoRules = {
  weights: Record<SeoItem, number>;
  title: { min: number; max: number };
  description: { min: number; max: number };
  /** palavras mínimas numa página comercial */
  commercialMinWords: number;
  minInlinks: number;
  minOutlinks: number;
  /** caminhos que pesam 3x na nota do site; "/produtos/*" vale para tudo abaixo de /produtos/ */
  priorityPaths: string[];
};

export const DEFAULT_RULES: SeoRules = {
  weights: {
    titulo: 15, descricao: 10, h1: 10, indexacao: 10, idiomas: 5, conteudo: 10,
    imagens: 10, links: 10, schema: 10, compartilhamento: 5, velocidade: 5,
  },
  title: { min: 30, max: 60 },
  description: { min: 70, max: 155 },
  commercialMinWords: 300,
  minInlinks: 3,
  minOutlinks: 3,
  priorityPaths: [...Object.keys(WA).map((slug) => `/${slug}`), "/produtos/*"],
};

/** A página está na lista de prioritárias? Aceita caminho exato ou prefixo com "/*" no fim. */
export function isPriorityPath(path: string, rules: SeoRules): boolean {
  return rules.priorityPaths.some((p) => (p.endsWith("/*") ? path.startsWith(p.slice(0, -1)) : path === p));
}

const PRIORITY_PATH = /^\/(?!\/)[^\s*]{0,198}(\/\*)?$|^\/$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isInt = (v: unknown, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;

export function validateRules(input: unknown): { ok: true; rules: SeoRules } | { ok: false; errors: string[] } {
  if (!isObj(input)) return { ok: false, errors: ["As regras estão num formato inválido"] };
  const errors: string[] = [];

  const weights = {} as Record<SeoItem, number>;
  const w = isObj(input.weights) ? input.weights : {};
  for (const item of SEO_ITEMS) {
    const v = w[item];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100) errors.push(`O peso de "${ITEM_NAMES[item]}" precisa ser um número de 0 a 100`);
    else weights[item] = v;
  }
  if (Object.keys(weights).length === SEO_ITEMS.length) {
    const total = SEO_ITEMS.reduce((s, k) => s + weights[k], 0);
    if (Math.abs(total - 100) > 1e-9) errors.push("Os pesos precisam somar 100");
  }

  const range = (name: string, v: unknown, max: number) => {
    if (!isObj(v) || !isInt(v.min, max) || !isInt(v.max, max)) {
      errors.push(`Os limites de ${name} precisam ser números inteiros de 0 a ${max}`);
      return { min: 0, max: 0 };
    }
    if (v.min > v.max) errors.push(`O mínimo de ${name} não pode ser maior que o máximo`);
    return { min: v.min, max: v.max };
  };
  const title = range("título", input.title, 200);
  const description = range("descrição", input.description, 500);

  const count = (name: string, v: unknown, max: number) => {
    if (!isInt(v, max)) {
      errors.push(`${name} precisa ser um número inteiro de 0 a ${max}`);
      return 0;
    }
    return v;
  };
  const commercialMinWords = count("O mínimo de palavras", input.commercialMinWords, 5000);
  const minInlinks = count("O mínimo de links recebidos", input.minInlinks, 100);
  const minOutlinks = count("O mínimo de links enviados", input.minOutlinks, 100);

  const pp = input.priorityPaths;
  let priorityPaths: string[] = [];
  if (!Array.isArray(pp) || pp.some((p) => typeof p !== "string")) errors.push("As páginas prioritárias precisam ser uma lista de endereços");
  else {
    priorityPaths = [...new Set((pp as string[]).map((p) => p.trim()).filter(Boolean))];
    // caminho do site: começa com "/", sem espaço, até 200 caracteres; o curinga "*" só vale no fim ("/produtos/*")
    if (priorityPaths.some((p) => !PRIORITY_PATH.test(p))) errors.push("Cada página prioritária precisa ser um endereço do site que começa com / e não tem espaços");
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, rules: { weights, title, description, commercialMinWords, minInlinks, minOutlinks, priorityPaths } };
}

/** Pesos que de fato valem: sem velocidade medida, os outros se escalam por 100/(100 − peso da velocidade). */
export function effectiveWeights(rules: SeoRules, speedMeasured: boolean): Record<SeoItem, number> {
  if (speedMeasured) return { ...rules.weights };
  const rest = 100 - rules.weights.velocidade;
  const out = { ...rules.weights, velocidade: 0 };
  if (rest <= 0) return out;
  for (const k of SEO_ITEMS) if (k !== "velocidade") out[k] = (rules.weights[k] * 100) / rest;
  return out;
}
