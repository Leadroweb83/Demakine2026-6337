import raw from "../data/content.json";

export type Category = {
  slug: string;
  name: string;
  short: string;
  desc: string;
};

export type Model = { model: string; specs: Record<string, string> };

export type Product = {
  slug: string;
  name: string;
  title: string;
  category: string;
  tag?: string;
  applications: string[];
  summary: string;
  description: string[];
  features: string[];
  models: Model[];
  specKeys: string[];
  images: string[];
  seoTitle?: string;
  seoDesc?: string;
};

export type Client = { id: number; name: string; segment: string; logo: string };
export type Testimonial = { name: string; company: string; city: string; text: string };
export type Project = { slug: string; name: string; desc: string; images: string[] };
export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  cover: string;
  blocks: string[];
  images: string[];
};

const content = raw as unknown as {
  categories: Category[];
  products: Product[];
  clients: Client[];
  testimonials: Testimonial[];
  projects: Project[];
  posts: Post[];
};

/** Ordem comercial: campeã de vendas primeiro. */
const FEATURED_ORDER = [
  "esteira-transportadora-para-sacaria",
  "esteira-transportadora-para-granel",
  "esteira-transportadora-horizontal",
  "rosca-transportadora",
  "elevador-de-canecas",
  "maquina-de-costurar-sacos-gk-26",
  "esteira-transportadora-de-caixas",
];

export const categories = content.categories;

/** Produto ainda sem foto própria usa a foto da fábrica, para nenhuma vitrine quebrar. */
const FALLBACK_IMAGE = "/img/site/hero.jpg";

export const products = content.products.map((p) =>
  p.images.length ? p : { ...p, images: [FALLBACK_IMAGE] },
).sort((a, b) => {
  const ia = FEATURED_ORDER.indexOf(a.slug);
  const ib = FEATURED_ORDER.indexOf(b.slug);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return a.name.localeCompare(b.name, "pt-BR");
});

export const clients = content.clients;
export const testimonials = content.testimonials;
export const projects = content.projects;
export const posts = [...content.posts].sort((a, b) => b.date.localeCompare(a.date));

export const bestSeller = "esteira-transportadora-para-sacaria";

/** Endereços de produtos que foram unificados; o 301 de verdade fica no vercel.json. */
export const productAliases: Record<string, string> = {
  "esteira-transportadora-em-v": "esteira-transportadora-para-granel",
};

export function getProduct(slug: string) {
  const real = productAliases[slug] ?? slug;
  return products.find((p) => p.slug === real);
}

/** Artigo certo antes do nome do equipamento: "o Elevador", "a Esteira". */
export function artigo(name: string) {
  const masc = /^(elevador|cartrans|carrinho|mini sistema|sistema)/i.test(name.trim());
  return masc ? { a: "o", A: "O", da: "do", para: "para o" } : { a: "a", A: "A", da: "da", para: "para a" };
}

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function categoryName(slug: string) {
  return categories.find((c) => c.slug === slug)?.name ?? "";
}

export function productsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}

export function relatedProducts(product: Product, limit = 3) {
  const same = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const others = products.filter((p) => p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products
    .filter((p) =>
      [p.name, p.summary, p.tag ?? "", p.applications.join(" "), categoryName(p.category)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 8);
}
