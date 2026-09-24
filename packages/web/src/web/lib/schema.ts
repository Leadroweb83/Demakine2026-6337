import { site } from "./site";
import { shareImage } from "./images";

/** Dados estruturados (schema.org) usados por mais de uma página. A empresa é sempre o mesmo @id da home. */
const EMPRESA = { "@id": `${site.url}/#empresa` };

const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${site.url}${path}`);

/** Lista de páginas (catálogo, cases): ajuda o Google a entender a coleção e seus itens. */
export function itemListJsonLd(name: string, items: { name: string; path: string; image?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: abs(it.path),
      ...(it.image ? { image: abs(shareImage(it.image)) } : {}),
    })),
  };
}

export function blogJsonLd(posts: { title: string; slug: string; date: string; cover: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Demakine",
    url: `${site.url}/blog`,
    publisher: EMPRESA,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.date,
      image: abs(shareImage(p.cover)),
    })),
  };
}

export function articleJsonLd(a: { title: string; description: string; path: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url: abs(a.path),
    ...(a.image ? { image: abs(shareImage(a.image)) } : {}),
    author: EMPRESA,
    publisher: EMPRESA,
  };
}

export function aboutPageJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${site.url}/a-empresa`,
    description,
    mainEntity: EMPRESA,
  };
}
