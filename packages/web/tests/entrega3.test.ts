import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import content from "../src/web/data/content.json";
import en from "../src/web/i18n/en.json";
import es from "../src/web/i18n/es.json";
import { buildSitemap } from "../src/api/lib/sitemap";
import middleware from "../middleware";
import { follow } from "./helpers/vercel-redirects";

const c = content as { posts: { slug: string; blocks: string[]; images: string[] }[] };
const post = (slug: string) => c.posts.find((p) => p.slug === slug);
const sitemap = buildSitemap([], []);
const count = (s: string) => sitemap.split(s).length - 1;

/** posts duplicados do blog (item 7 do plano): o balanço sai com 301 e o post que fica recebe fotos e texto */
const MERGES = [
  { old: "demakine-marcou-presenca-na-agrishow-2024", keep: "demakine-na-agrishow-2024", heading: "Como foi a Agrishow 2024", photos: 3 },
  { old: "batatec-2024-demakine-marcou-presenca-de-sucesso", keep: "demakine-na-5a-edicao-da-batatec", heading: "Como foi a Batatec 2024", photos: 3 },
];

describe("posts duplicados do blog", () => {
  for (const m of MERGES) {
    describe(m.old, () => {
      test("sai do conteúdo e do sitemap; o post que fica continua nele", () => {
        expect(post(m.old)).toBeUndefined();
        expect(post(m.keep)).toBeDefined();
        expect(sitemap).not.toContain(`/blog/${m.old}<`);
        expect(count(`<loc>https://www.demakine.com.br/blog/${m.keep}</loc>`)).toBe(1);
        expect(existsSync(`dist/blog/${m.old}.html`)).toBe(false);
        expect(existsSync(`dist/blog/${m.keep}.html`)).toBe(true);
      });
      test("o post que fica tem lastmod de hoje no sitemap (o conteúdo mudou de verdade)", () => {
        const entry = sitemap.split("<url>").find((b) => b.includes(`<loc>https://www.demakine.com.br/blog/${m.keep}</loc>`))!;
        expect(entry).toContain("<lastmod>2026-11-10</lastmod>");
      });
      test("301 direto para o post que fica, com ou sem barra final, nos 3 idiomas", () => {
        for (const prefix of ["", "/en", "/es"]) {
          for (const suffix of ["", "/"]) {
            const { final, hops } = follow(`${prefix}/blog/${m.old}${suffix}`);
            expect(final).toBe(`${prefix}/blog/${m.keep}`);
            expect(hops.length).toBeLessThanOrEqual(suffix ? 2 : 1);
            expect(hops.every((h) => h.permanent)).toBe(true);
          }
        }
      });
      test("anexo de imagem do post antigo também vai para o post que fica", () => {
        expect(follow(`/blog/${m.old}/foto-do-estande`).final).toBe(`/blog/${m.keep}`);
        expect(follow(`/en/blog/${m.old}/foto-do-estande`).final).toBe(`/en/blog/${m.keep}`);
      });
      test("o post que fica ganhou a seção do balanço e as fotos, e as fotos existem em disco", () => {
        const keep = post(m.keep)!;
        expect(keep.blocks).toContain(`## ${m.heading}`);
        expect(keep.images.length).toBeGreaterThanOrEqual(m.photos + 5);
        for (const img of keep.images) {
          expect(existsSync(`public${img}`), img).toBe(true);
          expect(existsSync(`public${img.replace(/\.webp$/, ".jpg")}`), img).toBe(true);
        }
        expect(new Set(keep.images).size).toBe(keep.images.length);
      });
      test("o texto do balanço entrou sem alteração (a tradução em inglês e espanhol continua valendo)", () => {
        const keep = post(m.keep)!;
        const from = keep.blocks.indexOf(`## ${m.heading}`);
        const merged = keep.blocks.slice(from + 1);
        expect(merged.length).toBeGreaterThanOrEqual(5);
        for (const b of merged) {
          expect((en as Record<string, string>)[b], b.slice(0, 50)).toBeTruthy();
          expect((es as Record<string, string>)[b], b.slice(0, 50)).toBeTruthy();
        }
        // a frase que chamava para o Instagram não tinha link: não entra como chamado morto
        expect(merged.some((b) => /Clique aqui/.test(b))).toBe(false);
      });
      test("o título da seção nova está traduzido", () => {
        expect((en as Record<string, string>)[m.heading]).toBeTruthy();
        expect((es as Record<string, string>)[m.heading]).toBeTruthy();
      });
      test("a página do post que fica mostra o balanço no HTML", () => {
        const html = readFileSync(`dist/blog/${m.keep}.html`, "utf8");
        expect(html).toContain(m.heading);
        for (const lang of ["en", "es"]) expect(existsSync(`dist/${lang}/blog/${m.keep}.html`)).toBe(true);
      });
    });
  }
});

/** /export?lang= (item 8): cada idioma no seu endereço, um apontando para o outro */
const html = (p: string) => readFileSync(`dist${p}.html`, "utf8");
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
const alternates = (t: string) => [...t.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], decode(m[2]!)]);

describe("página de exportação: /en/export e /es/exportacion", () => {
  const PAGES = [
    { path: "/en/export", lang: "en", other: "/es/exportacion" },
    { path: "/es/exportacion", lang: "es", other: "/en/export" },
  ];
  for (const p of PAGES) {
    describe(p.path, () => {
      const t = () => html(p.path);
      test("HTML pré-renderizado no idioma certo, com um H1 e sem noindex", () => {
        expect(t()).toContain(`<html lang="${p.lang}"`);
        expect(t().match(/<h1[\s>]/g)).toHaveLength(1);
        expect(t()).not.toContain('name="robots" content="noindex');
      });
      test("canonical é o próprio endereço, sem ?lang=", () => {
        expect(t()).toContain(`<link rel="canonical" href="https://www.demakine.com.br${p.path}"`);
        expect(t()).not.toContain("?lang=");
      });
      test("hreflang recíproco: es, en e x-default, todos com a URL nova", () => {
        expect(alternates(t())).toEqual([
          ["es", "https://www.demakine.com.br/es/exportacion"],
          ["en", "https://www.demakine.com.br/en/export"],
          ["x-default", "https://www.demakine.com.br/en/export"],
        ]);
      });
      test("o botão de idioma é um link real para a outra versão, e 'Site em português' vai para a raiz", () => {
        expect(t()).toContain(`href="${p.other}"`);
        expect(t()).toContain('href="/" translate="no"');
        expect(t()).not.toContain("/en/en/");
        expect(t()).not.toContain("/es/es/");
      });
      test("título e descrição no idioma da página", () => {
        const title = decode(t().match(/<title>([\s\S]*?)<\/title>/)![1]!);
        expect(title.length).toBeGreaterThan(20);
        expect(t()).toContain('<meta name="description"');
      });
    });
  }
  test("os dois títulos e as duas descrições são diferentes", () => {
    const title = (p: string) => html(p).match(/<title>([\s\S]*?)<\/title>/)![1];
    const desc = (p: string) => html(p).match(/<meta name="description" content="([^"]*)"/)![1];
    expect(title("/en/export")).not.toBe(title("/es/exportacion"));
    expect(desc("/en/export")).not.toBe(desc("/es/exportacion"));
  });
  test("o endereço antigo não gera mais HTML (o middleware redireciona)", () => {
    expect(existsSync("dist/export.html")).toBe(false);
    expect(existsSync("dist/export-en.html")).toBe(false);
  });
  test("o rodapé do site aponta para /en/export, em português e nas outras línguas", () => {
    for (const f of ["dist/index.html", "dist/en.html", "dist/es.html"]) {
      const t = readFileSync(f, "utf8");
      expect(t).toContain('href="/en/export"');
      expect(t).not.toContain("/export?lang=");
      expect(t).not.toContain("/es/en/export");
    }
  });
});

describe("sitemap da exportação", () => {
  test("as duas URLs novas entram uma vez, com hreflang entre elas e lastmod", () => {
    for (const path of ["/en/export", "/es/exportacion"]) {
      expect(count(`<loc>https://www.demakine.com.br${path}</loc>`)).toBe(1);
      const entry = sitemap.split("<url>").find((b) => b.includes(`<loc>https://www.demakine.com.br${path}</loc>`))!;
      expect(entry).toContain('hreflang="es" href="https://www.demakine.com.br/es/exportacion"');
      expect(entry).toContain('hreflang="en" href="https://www.demakine.com.br/en/export"');
      expect(entry).toContain('hreflang="x-default" href="https://www.demakine.com.br/en/export"');
      expect(entry).toMatch(/<lastmod>2026-\d\d-\d\d<\/lastmod>/);
    }
  });
  test("as URLs com ?lang= saíram, e nenhuma versão /en/ ou /es/ da exportação sobra", () => {
    expect(sitemap).not.toContain("/export?lang=");
    expect(sitemap).not.toContain("/en/exportacion");
    expect(sitemap).not.toContain("/es/export<");
    expect(sitemap).not.toContain("/export</loc>https");
  });
});

describe("redirects da exportação", () => {
  const run = (u: string) => middleware(new Request(`https://www.demakine.com.br${u}`));
  const to = async (u: string) => {
    const res = await run(u);
    return res.status === 301 ? res.headers.get("location") : null;
  };
  test("/export?lang=en vai para /en/export e /export?lang=es para /es/exportacion, em 301", async () => {
    expect(await to("/export?lang=en")).toBe("https://www.demakine.com.br/en/export");
    expect(await to("/export?lang=es")).toBe("https://www.demakine.com.br/es/exportacion");
  });
  test("sem ?lang= vale o espanhol (era o padrão da página), com ou sem barra final", async () => {
    expect(await to("/export")).toBe("https://www.demakine.com.br/es/exportacion");
    expect(await to("/export/")).toBe("https://www.demakine.com.br/es/exportacion");
  });
  test("parâmetros de anúncio seguem junto, e só o ?lang= sai", async () => {
    expect(await to("/export?lang=en&gclid=abc&utm_source=google")).toBe("https://www.demakine.com.br/en/export?gclid=abc&utm_source=google");
    expect(await to("/export?utm_campaign=x&lang=es")).toBe("https://www.demakine.com.br/es/exportacion?utm_campaign=x");
  });
  test("qualquer outro endereço passa direto, sem redirect e sem erro", async () => {
    for (const u of ["/exportacion", "/export-en", "/en/export", "/es/exportacion", "/exports"]) {
      const res = await run(u);
      expect(res.status, u).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    }
  });
  test("as páginas novas não são redirecionadas pelo vercel.json, e os apelidos errados vão para a certa", () => {
    expect(follow("/en/export").hops).toHaveLength(0);
    expect(follow("/es/exportacion").hops).toHaveLength(0);
    expect(follow("/es/export").final).toBe("/es/exportacion");
    expect(follow("/en/exportacion").final).toBe("/en/export");
  });
  test("/en/loja e /en/admin continuam indo para a versão em português", () => {
    expect(follow("/en/loja").final).toBe("/loja");
    expect(follow("/es/admin").final).toBe("/admin");
  });
});
