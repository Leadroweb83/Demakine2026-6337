import content from "../../web/data/content.json";
import { DEFAULT_CASES } from "../../web/lib/cases";
import type { Role } from "../auth";

/** Coleções editáveis e quem pode salvar cada uma (super admin sempre pode). */
export const CONTENT_COLLECTIONS: Record<string, Role[]> = {
  site: ["admin"],
  produto: ["admin", "editor"],
  post: ["admin", "editor"],
  case: ["admin", "editor"],
  /** listas inteiras: "clientes" (logos) e "depoimentos" */
  lista: ["admin", "editor"],
  /** título e descrição das páginas fixas (chave = caminho, ver seoKey) */
  seo: ["admin"],
  /** textos da home e vitrine de campeãs (chave "main") */
  home: ["admin", "editor"],
  /** ordem e visibilidade das seções: chaves "home" e "produto" (ver web/lib/page-layout) */
  layout: ["admin", "editor"],
};

export const CONTENT_KEY_RE = /^[a-z0-9-]{1,100}$/;
export const CONTENT_MAX_BYTES = 200_000;

export function canEditCollection(role: string | null | undefined, collection: string) {
  const allowed = CONTENT_COLLECTIONS[collection];
  if (!allowed) return false;
  return role === "super_admin" || allowed.includes((role ?? "") as Role);
}

const CODE_POSTS = new Set((content as { posts: { slug: string }[] }).posts.map((p) => p.slug));

/** Item que já vem publicado no código do site (edição dele continua publicada). */
export function publishedInCode(collection: string, key: string) {
  if (collection === "post") return CODE_POSTS.has(key);
  if (collection === "case") return DEFAULT_CASES.some((c) => c.slug === key);
  return false;
}

/**
 * Campos do documento de SEO de uma página que só o painel "SEO e GEO" (super admin) muda: esconder do Google,
 * tirar do sitemap, endereço canônico, imagem de compartilhamento e os dados de GEO. A tela antiga "SEO das páginas"
 * só edita título e descrição.
 */
export const SEO_PROTECTED_FIELDS = ["noindex", "noSitemap", "canonical", "ogImage", "shortAnswer", "author", "reviewedAt"] as const;
const PROTECTED = new Set<string>(SEO_PROTECTED_FIELDS);

/** Só os campos protegidos de um documento de SEO (vazio se não houver nenhum). */
export function protectedOnly(doc: Record<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (doc) for (const k of SEO_PROTECTED_FIELDS) if (k in doc) out[k] = doc[k];
  return out;
}

/**
 * Salvamento pelo endpoint genérico de conteúdo: o que veio vale, menos os campos protegidos, que continuam os de
 * antes. Sem isso, a tela antiga (que só manda título e descrição) apagaria um noindex colocado pelo super admin, e
 * qualquer admin poderia esconder uma página do Google mexendo direto na API.
 */
export function mergeSeoDoc(prev: Record<string, unknown> | undefined, next: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(next)) if (!PROTECTED.has(k)) out[k] = v;
  return { ...out, ...protectedOnly(prev) };
}
