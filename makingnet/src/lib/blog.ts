// Artigos do blog migrados do WordPress (um JSON por artigo em src/data/blog).
import categorias from '../data/blog-categorias.json';

export interface Post {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  date: string;
  modified: string;
  author: string;
  categories: string[];
  cover: { src: string; w: number; h: number; alt: string } | null;
  minutes: number;
  words: number;
  schema: Record<string, unknown>[];
  html: string;
}

const files = import.meta.glob<Post>('../data/blog/*.json', { eager: true, import: 'default' });

export const posts: Post[] = Object.values(files).sort((a, b) => b.date.localeCompare(a.date));
export const categories = categorias;
export const PER_PAGE = 18;
export const totalPages = Math.ceil(posts.length / PER_PAGE);

export const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

// "Blog" e "Marketing Digital" estão em quase todos os artigos; não servem como etiqueta.
const GENERICAS = new Set(['blog', 'marketing-digital', 'estrategias', 'ferramentas-marketing-digital']);
export const mainCategory = (p: Post) => p.categories.find((c) => !GENERICAS.has(c)) ?? p.categories[0];

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });

export function related(post: Post, n = 3): Post[] {
  const main = mainCategory(post);
  return posts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: (mainCategory(p) === main ? 2 : 0) + p.categories.filter((c) => !GENERICAS.has(c) && post.categories.includes(c)).length }))
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, n)
    .map((x) => x.p);
}
