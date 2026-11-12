import type { PageFacts } from "../../../src/api/lib/seo/html";
import type { PageContext } from "../../../src/api/lib/seo/score";

/** Fatos de uma página sem nenhum problema de SEO (nota 100). */
export const perfectFacts = (over: Partial<PageFacts> = {}): PageFacts => ({
  title: "Título perfeito de uma página do site Demakine",
  description: "Descrição com tamanho certo para aparecer inteira nos resultados do Google, explicando a página em uma frase.",
  h1s: ["Um título principal"],
  h2Count: 3,
  canonical: "https://www.demakine.com.br/pagina",
  robots: "index, follow",
  hreflangs: [{ lang: "pt-BR", href: "x" }, { lang: "en", href: "x" }, { lang: "es", href: "x" }, { lang: "x-default", href: "x" }],
  og: { title: "t", description: "d", image: "https://www.demakine.com.br/og.jpg" },
  images: [{ src: "https://www.demakine.com.br/a.webp", alt: "Foto" }],
  internalLinks: ["/a", "/b", "/c"],
  jsonLdTypes: ["BreadcrumbList"],
  jsonLd: [{ "@type": "BreadcrumbList" }],
  words: 200,
  htmlLang: "pt-BR",
  ...over,
});

export const perfectCtx = (over: Partial<PageContext> = {}): PageContext => ({
  path: "/pagina",
  area: "institucional",
  lang: "pt",
  statusCode: 200,
  inlinks: 3,
  isCommercial: false,
  duplicateTitle: false,
  duplicateDescription: false,
  expectedSchema: ["BreadcrumbList"],
  expectedHreflangs: ["pt-BR", "en", "es", "x-default"],
  ...over,
});
