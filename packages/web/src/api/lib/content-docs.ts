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
