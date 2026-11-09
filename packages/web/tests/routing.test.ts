import { describe, expect, test } from "bun:test";
import vercel from "../vercel.json";
import { buildSitemap } from "../src/api/lib/sitemap";
import { landingPages } from "../src/web/lib/landing-pages";
import { follow } from "./helpers/vercel-redirects";

const sitemap = buildSitemap([], []);
const count = (s: string) => sitemap.split(s).length - 1;
const entry = (path: string) => sitemap.split("<url>").find((b) => b.includes(`<loc>https://www.demakine.com.br${path}</loc>`)) ?? "";

describe("sitemap das 10 páginas novas", () => {
  for (const l of landingPages) {
    test(`/${l.slug} entra uma vez, só em português, sem hreflang e com lastmod`, () => {
      expect(count(`<loc>https://www.demakine.com.br/${l.slug}</loc>`)).toBe(1);
      expect(sitemap).not.toContain(`/en/${l.slug}`);
      expect(sitemap).not.toContain(`/es/${l.slug}`);
      expect(entry(`/${l.slug}`)).not.toContain("xhtml:link");
      expect(entry(`/${l.slug}`)).toMatch(/<lastmod>2026-\d\d-\d\d<\/lastmod>/);
    });
  }
  test("a esteira de roletes livres entra pela lista de produtos", () => {
    expect(count("<loc>https://www.demakine.com.br/produtos/esteira-de-roletes-livres</loc>")).toBe(1);
  });
});

/** grupo B do plano: cada URL antiga chega na página nova, em 1 salto (2 com a barra final) */
const GRUPO_B: [string, string][] = [
  ["/esteira-transportadora", "/esteiras-transportadoras"],
  ["/esteirastransportadoras", "/esteiras-transportadoras"],
  ["/esteira-transportadora-de-correia", "/esteiras-transportadoras"],
  ["/esteira-para-transporte", "/esteiras-transportadoras"],
  ["/esteira-de-transporte", "/esteiras-transportadoras"],
  ["/linha-transporte", "/esteiras-transportadoras"],
  ["/categoria-produto/esteiras-transportadoras", "/esteiras-transportadoras"],
  ["/categoria-produto/linha-transporte", "/esteiras-transportadoras"],
  ["/fabricante-de-esteiras-transportadoras", "/fabricante-de-esteira-transportadora"],
  ["/fabrica-de-esteiras-transportadoras", "/fabricante-de-esteira-transportadora"],
  ["/esteira-industrial", "/esteira-transportadora-industrial"],
  ["/esteira-de-industria", "/esteira-transportadora-industrial"],
  ["/esteiras-industriais", "/esteira-transportadora-industrial"],
  ["/esteira-automatizada", "/esteira-transportadora-industrial"],
  ["/esteira-de-roletes-livres", "/produtos/esteira-de-roletes-livres"],
  ["/transportador-de-roletes", "/produtos/esteira-de-roletes-livres"],
  ["/transportador-de-roletes-livres", "/produtos/esteira-de-roletes-livres"],
  ["/esteira-de-roletes", "/produtos/esteira-de-roletes-livres"],
  ["/esteira-de-rolos", "/produtos/esteira-de-roletes-livres"],
  ["/empacotamento-costura", "/maquinas-de-costurar-sacos"],
  ["/empacotamento-e-costura", "/maquinas-de-costurar-sacos"],
  ["/categoria-produto/maquinas-para-costurar-sacos", "/maquinas-de-costurar-sacos"],
  ["/categoria-produto/roscas-transportadoras", "/roscas-transportadoras"],
  ["/categoria-produto/elevadores", "/elevadores"],
];

describe("redirects do grupo B (páginas novas)", () => {
  for (const [from, to] of GRUPO_B) {
    test(`${from} → ${to}`, () => {
      for (const url of [from, `${from}/`]) {
        const { final, hops } = follow(url);
        expect(final).toBe(to);
        expect(hops.length).toBeLessThanOrEqual(url.endsWith("/") ? 2 : 1);
        expect(hops.every((h) => h.permanent)).toBe(true);
      }
    });
  }

  test("/produtos?cat= das 4 categorias vai para a página da categoria; sem cat ou com outro valor, não", () => {
    expect(follow("/produtos?cat=esteiras-transportadoras").final).toBe("/esteiras-transportadoras");
    expect(follow("/produtos?cat=roscas-transportadoras").final).toBe("/roscas-transportadoras");
    expect(follow("/produtos?cat=elevadores").final).toBe("/elevadores");
    expect(follow("/produtos?cat=empacotamento-e-costura").final).toBe("/maquinas-de-costurar-sacos");
    expect(follow("/produtos").hops).toHaveLength(0);
    expect(follow("/produtos?cat=outra").hops).toHaveLength(0);
    expect(follow("/produtos/rosca-transportadora").hops).toHaveLength(0);
  });

  test("as 10 páginas respondem direto, sem redirect", () => {
    for (const l of landingPages) expect(follow(`/${l.slug}`).hops).toHaveLength(0);
  });

  test("/en e /es das 10 páginas voltam para a versão em português", () => {
    for (const l of landingPages) for (const lang of ["en", "es"]) expect(follow(`/${lang}/${l.slug}`).final).toBe(`/${l.slug}`);
  });

  test("nenhum redirect antigo manda para /produtos?cat= (era o destino que perdia o ranking)", () => {
    const rules = (vercel as { redirects: { destination: string }[] }).redirects;
    expect(rules.filter((r) => r.destination.includes("/produtos?cat="))).toEqual([]);
  });
});
