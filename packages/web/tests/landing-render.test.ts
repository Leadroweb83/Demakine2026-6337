import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { waHref } from "../src/web/lib/site";
import { landingPages } from "../src/web/lib/landing-pages";
import { CATEGORY_PAGE, PRICE_PAGE, SOLUTIONS } from "../src/web/lib/landing-links";
import content from "../src/web/data/content.json";

describe("waHref", () => {
  test("monta o link do WhatsApp de vendas com a mensagem codificada", () => {
    expect(waHref("Olá! Quero falar com um vendedor.")).toBe(
      "https://wa.me/5519998842717?text=Ol%C3%A1!%20Quero%20falar%20com%20um%20vendedor.",
    );
  });
});

// HTML gerado pelo prerender (rode o build antes: vite build, vite build --ssr, bun vite/prerender.ts)
const html = (p: string) => readFileSync(`dist${p}.html`, "utf8");
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'");
const ldBlocks = (t: string) => [...t.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));
const crumbs = (t: string) => {
  const b = ldBlocks(t).flat().find((x) => x["@type"] === "BreadcrumbList");
  return b?.itemListElement.map((i: { name: string; item: string }) => [i.name, i.item.replace("https://www.demakine.com.br", "")]);
};

describe.each(landingPages.map((l) => [l.slug, l] as const))("página pré-renderizada /%s", (slug, l) => {
  const path = `/${slug}`;
  test("o HTML existe", () => expect(existsSync(`dist${path}.html`)).toBe(true));
  test("tem um único H1", () => {
    const h1 = [...html(path).matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
    expect(h1.length).toBe(1);
    expect(decode(h1[0]![1]!.replace(/<[^>]+>/g, ""))).toBe(l.h1);
  });
  test("título, descrição e canonical próprios", () => {
    const t = html(path);
    expect(decode(t.match(/<title>([\s\S]*?)<\/title>/)![1]!)).toBe(l.seoTitle);
    expect(decode(t.match(/<meta name="description" content="([^"]*)"/)![1]!)).toBe(l.seoDesc);
    expect(t).toContain(`<link rel="canonical" href="https://www.demakine.com.br${path}"`);
    expect(t).not.toContain('name="robots" content="noindex');
  });
  test("tem os dois chamados: WhatsApp (wa.me) e orçamento (/contato)", () => {
    const t = decode(html(path));
    expect(t).toContain("https://wa.me/5519998842717?text=");
    expect(t).toContain("Falar com um vendedor");
    expect(t).toContain("/contato?");
    expect(t).toContain("Pedir orçamento");
    expect(t).toContain(`data-track-location="${l.kind === "categoria" ? "categoria" : "pagina"}:${slug}"`);
  });
  test("lista os produtos e traz FAQPage, ItemList e BreadcrumbList", () => {
    const t = html(path);
    for (const s of l.productSlugs) expect(t).toContain(`/produtos/${s}`);
    expect(t).toContain('"@type":"FAQPage"');
    expect(t).toContain('"@type":"ItemList"');
    expect(t).toContain('"@type":"BreadcrumbList"');
  });
  test("trilha: Início › Produtos › [Categoria] › página", () => {
    const cat = l.category!;
    const catName = (content as { categories: { slug: string; name: string }[] }).categories.find((x) => x.slug === cat)!.name;
    const expected =
      l.kind === "categoria"
        ? [["Início", "/"], ["Produtos", "/produtos"], [l.seoTitle.split(" | ")[0], path]]
        : [["Início", "/"], ["Produtos", "/produtos"], [catName, CATEGORY_PAGE[cat]], [l.seoTitle.split(" | ")[0], path]];
    expect(crumbs(html(path))).toEqual(expected);
  });
  test("a lista numerada do guia só tem <li> como filho direto (acessibilidade)", () => {
    const m = html(path).match(/<ol class="mt-10[^>]*>([\s\S]*?)<\/ol>/);
    expect(m).not.toBeNull();
    let depth = 0;
    for (const [, close, tag] of m![1]!.matchAll(/<(\/?)(li|div)\b/g)) {
      if (close) depth--; else { if (depth === 0) expect(tag).toBe("li"); depth++; }
    }
    expect(depth).toBe(0);
  });
  test("não existe em inglês nem em espanhol", () => {
    for (const lang of ["en", "es"]) {
      const f = `dist/${lang}${path}.html`;
      if (existsSync(f)) expect(readFileSync(f, "utf8")).toContain("noindex");
    }
  });
});

describe("rodapé e menu (HTML estático)", () => {
  const home = readFileSync("dist/index.html", "utf8");
  test("a home traz a coluna Soluções com os 6 links, na ordem do plano", () => {
    expect(home).toContain("Soluções");
    let last = -1;
    for (const s of SOLUTIONS) {
      const at = home.indexOf(`href="${s.to}"`);
      expect(at).toBeGreaterThan(last);
      last = at;
    }
  });
  test("o rodapé aponta as 4 categorias para as páginas novas, não para /produtos?cat=", () => {
    for (const to of Object.values(CATEGORY_PAGE)) expect(home).toContain(`href="${to}"`);
    expect(home).not.toContain("/produtos?cat=");
  });
  test("a versão em inglês não mostra a coluna Soluções nem links para páginas só em português", () => {
    const en = readFileSync("dist/en.html", "utf8");
    expect(en).not.toContain("Soluções");
    for (const s of SOLUTIONS) expect(en).not.toContain(`href="${s.to}"`);
  });
});

describe("páginas de produto: trilha com a categoria e link para o preço", () => {
  const p = (slug: string) => html(`/produtos/${slug}`);
  test("trilha Início › Produtos › Categoria › Produto, com BreadcrumbList", () => {
    const t = p("rosca-transportadora-chupim");
    expect(crumbs(t)!.map((x: string[]) => x[1])).toEqual(["/", "/produtos", "/roscas-transportadoras", "/produtos/rosca-transportadora-chupim"]);
    expect(t).toContain('href="/roscas-transportadoras"');
  });
  test("cada produto tem a trilha da própria categoria", () => {
    for (const prod of (content as { products: { slug: string; category: string }[] }).products) {
      const c = crumbs(p(prod.slug))!;
      expect(c).toHaveLength(4);
      expect(c[2][1]).toBe(CATEGORY_PAGE[prod.category]);
    }
  });
  test("link contextual para a página de preço da categoria (elevadores não tem)", () => {
    for (const prod of (content as { products: { slug: string; category: string }[] }).products) {
      const t = p(prod.slug);
      const price = PRICE_PAGE[prod.category];
      if (price) expect(t).toContain(`href="${price.to}"`);
      else expect(t).not.toContain("Quer entender o que forma o valor?");
    }
  });
});

describe("posts com link para as páginas novas", () => {
  const post = (slug: string, lang = "") => readFileSync(`dist${lang}/blog/${slug}.html`, "utf8");
  test("Como dimensionar: links para /esteiras-transportadoras e /esteira-transportadora-preco", () => {
    const t = post("como-dimensionar-sua-esteira-transportadora");
    expect(t).toContain('href="/esteiras-transportadoras"');
    expect(t).toContain('href="/esteira-transportadora-preco"');
  });
  test("Guia de roscas: links para /roscas-transportadoras e /rosca-transportadora-preco", () => {
    const t = post("guia-completo-sobre-roscas-transportadoras");
    expect(t).toContain('href="/roscas-transportadoras"');
    expect(t).toContain('href="/rosca-transportadora-preco"');
  });
  test("em inglês o texto aparece sem link para página que não existe em inglês", () => {
    const t = post("como-dimensionar-sua-esteira-transportadora", "/en");
    expect(t).not.toContain('href="/esteiras-transportadoras"');
    expect(t).not.toContain("](/");
  });
});
