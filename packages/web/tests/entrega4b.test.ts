import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import vercel from "../vercel.json";
import en from "../src/web/i18n/en.json";
import es from "../src/web/i18n/es.json";
import { LANDING_SLUGS } from "../src/web/lib/landing-slugs";
import { WA } from "../src/web/lib/landing-links";
import { isTranslatedPath, localePath, routerHref } from "../src/web/lib/i18n";
import { PRIMARY_SKU } from "../src/web/lib/product-schema";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : f.endsWith(".html") ? [join(dir, f)] : []));
const pages = walk("dist");
const html = (p: string) => readFileSync(`dist${p}.html`, "utf8");
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");

describe("páginas só em português não declaram hreflang para idiomas que não existem", () => {
  test("a lista de endereços é a mesma das mensagens de WhatsApp (landing-links)", () => {
    expect([...LANDING_SLUGS].sort()).toEqual(Object.keys(WA).sort());
  });
  for (const slug of LANDING_SLUGS) {
    test(`/${slug}: sem hreflang e sem prefixo de idioma`, () => {
      expect(isTranslatedPath(`/${slug}`)).toBe(false);
      expect(localePath(`/${slug}`, "en")).toBe(`/${slug}`);
      expect(html(`/${slug}`)).not.toContain('rel="alternate" hreflang');
      expect(html(`/${slug}`)).toContain(`<link rel="canonical" href="https://www.demakine.com.br/${slug}"`);
    });
  }
  test("as páginas traduzidas continuam declarando pt-BR, en, es e x-default", () => {
    const t = html("/produtos/rosca-transportadora");
    for (const l of ["pt-BR", "en", "es", "x-default"]) expect(t).toContain(`hreflang="${l}"`);
  });
});

describe("links que redirecionavam", () => {
  test("routerHref: sem barra no fim e sem prefixo de idioma em páginas só em português", () => {
    expect(routerHref("/en/")).toBe("/en");
    expect(routerHref("/es/")).toBe("/es");
    expect(routerHref("/")).toBe("/");
    expect(routerHref("/en/vagas")).toBe("/vagas");
    expect(routerHref("/es/vagas/analista")).toBe("/vagas/analista");
    expect(routerHref("/en/esteiras-transportadoras")).toBe("/esteiras-transportadoras");
    expect(routerHref("/en/produtos")).toBe("/en/produtos");
    expect(routerHref("/produtos?cat=x")).toBe("/produtos?cat=x");
    expect(routerHref("/en/produtos/?a=1")).toBe("/en/produtos?a=1");
  });
  test("nenhuma página gerada linka para /en/vagas, /es/vagas, /en/ ou /es/", () => {
    const ruins: string[] = [];
    for (const f of pages) if (/href="\/(en|es)(\/vagas[^"]*|\/)"/.test(readFileSync(f, "utf8"))) ruins.push(f);
    expect(ruins).toEqual([]);
  });
  test("o logo e o link de vagas das páginas em inglês e espanhol apontam direto", () => {
    for (const [lang, root] of [["en", "/en"], ["es", "/es"]] as const) {
      const t = html(`/${lang}/agro`);
      expect(t).toContain(`href="${root}"`);
      expect(t).toContain('href="/vagas"');
    }
  });
});

describe("preload da home", () => {
  test("pré-carrega a imagem que o topo realmente usa (o poster do vídeo), e não outra", () => {
    const t = html("/index");
    const preload = t.match(/<link rel="preload" as="image" href="([^"]+)"/)![1];
    const poster = readFileSync("src/web/components/hero.tsx", "utf8").match(/poster="([^"]+)"/)![1];
    expect(preload).toBe(poster);
    expect(preload).toBe("/img/site/hero-fabrica.webp");
  });
});

describe("SKU do modelo principal", () => {
  test("a esteira para granel tem EV8, um dos modelos da ficha, no schema", () => {
    expect(PRIMARY_SKU["esteira-transportadora-para-granel"]).toBe("EV8");
    const t = html("/produtos/esteira-transportadora-para-granel");
    const blocks = [...t.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!)).flat();
    expect(blocks.find((b) => b["@type"] === "Product").sku).toBe("EV8");
    const models = (JSON.parse(readFileSync("src/web/data/content.json", "utf8")).products as { slug: string; models: { model: string }[] }[])
      .find((p) => p.slug === "esteira-transportadora-para-granel")!.models.map((m) => m.model);
    expect(models).toContain("EV8");
  });
});

describe("descrições das páginas em português cabem em 155 caracteres", () => {
  test("nenhuma página em português passa do limite", () => {
    const longas: string[] = [];
    for (const f of pages) {
      if (/^dist\/(en|es)[/.]/.test(f)) continue;
      const m = readFileSync(f, "utf8").match(/<meta name="description" content="([^"]*)"/);
      if (m && decode(m[1]!).length > 155) longas.push(`${decode(m[1]!).length} ${f}`);
    }
    expect(longas).toEqual([]);
  });
  test("a versão em inglês e em espanhol das descrições mudadas continua traduzida (a chave acompanha o texto novo)", () => {
    for (const p of ["/blog", "/downloads", "/produtos/esteira-transportadora-para-cesta-basica", "/produtos/peneira-para-carvao", "/blog/10-dicas-para-manutencao-preventiva-de-esteiras-transportadoras"]) {
      const pt = decode(html(p).match(/<meta name="description" content="([^"]*)"/)![1]!);
      expect((en as Record<string, string>)[pt], p).toBeTruthy();
      expect((es as Record<string, string>)[pt], p).toBeTruthy();
      expect(decode(html(`/en${p}`).match(/<meta name="description" content="([^"]*)"/)![1]!), p).toBe((en as Record<string, string>)[pt]!);
    }
  });
});

describe("cache dos arquivos estáticos", () => {
  const cache = (source: string) => vercel.headers.find((h) => h.source === source)?.headers.find((x) => x.key === "Cache-Control")?.value;
  test("/assets 1 ano imutável, /img 7 dias e /video 30 dias, com revalidação em segundo plano", () => {
    expect(cache("/assets/(.*)")).toBe("public, max-age=31536000, immutable");
    expect(cache("/img/(.*)")).toBe("public, max-age=604800, stale-while-revalidate=86400");
    expect(cache("/video/(.*)")).toBe("public, max-age=2592000, stale-while-revalidate=86400");
  });
});
