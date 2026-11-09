import { describe, expect, test } from "bun:test";
import fixture from "./fixtures/redirects-grupo-a.json";
import content from "../src/web/data/content.json";
import { buildSitemap } from "../src/api/lib/sitemap";
import { follow } from "./helpers/vercel-redirects";

const sitemapPaths = new Set(
  [...buildSitemap([], []).matchAll(/<loc>https:\/\/www\.demakine\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1]!.split("?")[0]!),
);
const exists = (path: string) => path === "/" || sitemapPaths.has(path);

describe("redirects do site antigo (grupo A)", () => {
  test("a lista cobre as 72 URLs", () => expect(fixture.length).toBe(72));

  for (const [origin, expected] of fixture as [string, string][]) {
    test(`${origin} chega em ${expected} (com e sem barra final)`, () => {
      for (const url of [origin, `${origin}/`]) {
        const { final, hops } = follow(url);
        expect(final).toBe(expected);
        // barra final (308) + a regra: no máximo 2 saltos, sem cadeia
        expect(hops.length).toBeLessThanOrEqual(url.endsWith("/") ? 2 : 1);
        expect(hops.every((h) => h.permanent)).toBe(true);
      }
    });
    test(`destino de ${origin} existe no site`, () => expect(exists(expected.split("?")[0]!)).toBe(true));
  }

  test("/produto/:slug vai direto, sem passar por outro redirect", () => {
    const { final, hops } = follow("/produto/esteira-transportadora-em-v");
    expect(final).toBe("/produtos/esteira-transportadora-para-granel");
    expect(hops).toHaveLength(1);
  });

  test("anexo de imagem de post existente volta para o post", () => {
    expect(follow("/blog/guia-completo-sobre-roscas-transportadoras/componentes-rosca-transportadora-4").final).toBe(
      "/blog/guia-completo-sobre-roscas-transportadoras",
    );
  });

  test("os posts do blog continuam acessíveis (nenhuma regra os redireciona)", () => {
    for (const p of (content as { posts: { slug: string }[] }).posts) {
      expect(follow(`/blog/${p.slug}`).hops).toHaveLength(0);
    }
  });

  test("as páginas de produto não sofrem redirect", () => {
    for (const p of (content as { products: { slug: string }[] }).products) {
      expect(follow(`/produtos/${p.slug}`).hops).toHaveLength(0);
    }
  });
});
