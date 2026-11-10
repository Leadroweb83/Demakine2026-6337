import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import content from "../src/web/data/content.json";
import landing from "../src/web/data/landing.json";
import { photoAlt } from "../src/web/lib/product-photos";
import { buildSitemap } from "../src/api/lib/sitemap";

type P = { slug: string; name: string; images: string[]; imageAlts?: Record<string, string> };
const products = (content as { products: P[] }).products;
const withPhotos = products.filter((p) => p.images.length >= 4);
const sitemap = buildSitemap([], []);
const entry = (path: string) => sitemap.split("<url>").find((b) => b.includes(`<loc>https://www.demakine.com.br${path}</loc>`)) ?? "";
const imgsIn = (xml: string) => [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]!.replace("https://www.demakine.com.br", ""));

describe("descrição (alt) das fotos de produto", () => {
  test("os 16 produtos com galeria têm uma descrição por foto", () => {
    expect(withPhotos.length).toBe(16);
    for (const p of withPhotos) {
      expect(Object.keys(p.imageAlts ?? {}).sort(), p.slug).toEqual([...p.images].sort());
    }
  });
  for (const p of withPhotos) {
    test(`${p.slug}: descrições diferentes entre si, com o nome da Demakine, sem travessão e sem ficar longas`, () => {
      const alts = Object.values(p.imageAlts!);
      expect(new Set(alts).size).toBe(alts.length);
      for (const a of alts) {
        expect(a.length, a).toBeGreaterThanOrEqual(25);
        expect(a.length, a).toBeLessThanOrEqual(150);
        expect(a, a).toContain("Demakine");
        expect(a, a).not.toMatch(/[—–]/);
        expect(a, a).not.toMatch(/^(foto|imagem)\b/i);
      }
    });
  }
  test("photoAlt usa a descrição da foto pelo caminho, mesmo com a ordem trocada pelo painel", () => {
    const p = products.find((x) => x.slug === "esteira-transportadora-para-sacaria")!;
    const [a, b] = [p.images[0]!, p.images[1]!];
    expect(photoAlt(p, a, 0)).toBe(p.imageAlts![a]!);
    expect(photoAlt(p, b, 0)).toBe(p.imageAlts![b]!); // foto que o painel colocou em primeiro
    expect(photoAlt(p, a, 5)).toBe(p.imageAlts![a]!);
  });
  test("foto sem descrição nunca sai vazia nem repetida: nome do produto e número da foto", () => {
    const p = { name: "Rosca X" };
    expect(photoAlt(p, "/img/a.webp", 0)).toBe("Rosca X");
    expect(photoAlt(p, "/img/b.webp", 1)).toBe("Rosca X, foto 2");
    expect(photoAlt({ ...p, imageAlts: { "/img/a.webp": "  " } }, "/img/a.webp", 2)).toBe("Rosca X, foto 3");
  });
});

describe("sitemap de imagens", () => {
  test("declara o espaço de nomes e lista imagens", () => {
    expect(sitemap).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(sitemap.split("<image:loc>").length - 1).toBeGreaterThan(100);
  });
  test("cada página de produto lista todas as suas fotos, uma vez, com endereço completo", () => {
    for (const p of products) {
      const list = imgsIn(entry(`/produtos/${p.slug}`));
      expect(list.sort(), p.slug).toEqual([...p.images].sort());
      expect(entry(`/produtos/${p.slug}`)).not.toMatch(/<image:loc>(?!https:\/\/www\.demakine\.com\.br\/img\/)/);
    }
  });
  test("categorias e páginas comerciais listam a foto do topo e a de cada produto", () => {
    for (const l of landing as { slug: string; heroImage?: string; items: string[] }[]) {
      const list = imgsIn(entry(`/${l.slug}`));
      if (l.heroImage) expect(list, l.slug).toContain(l.heroImage);
      for (const s of l.items) expect(list, `${l.slug} ${s}`).toContain(products.find((p) => p.slug === s)!.images[0]!);
      expect(new Set(list).size).toBe(list.length);
    }
  });
  test("cases listam a foto e os endereços existem em disco", () => {
    const k = imgsIn(entry("/cases/carga-e-descarga-em-centro-de-distribuicao"));
    expect(k.length).toBe(1);
    for (const src of new Set(imgsIn(sitemap))) expect(existsSync(`public${src}`), src).toBe(true);
  });
  test("o sitemap continua sendo lido para as páginas: nenhuma <loc> nova de imagem", () => {
    const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(pages.every((u) => !/\/img\//.test(u))).toBe(true);
  });
});

/** HTML pré-renderizado (rode o build antes). Mesma conferência do PDF do Marketing. */
const html = (slug: string, lang = "") => readFileSync(`dist${lang}/produtos/${slug}.html`, "utf8");
const imgTags = (t: string) => [...t.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");

describe("páginas de produto pré-renderizadas", () => {
  for (const p of products.filter((x) => x.images.length >= 1)) {
    test(`${p.slug}: nenhuma imagem com src e alt vazio`, () => {
      const vazias = imgTags(html(p.slug)).filter((t) => attr(t, "src") && attr(t, "alt") === "");
      expect(vazias, vazias.join("\n")).toHaveLength(0);
    });
  }
  test("a galeria mostra a descrição de cada foto (miniaturas e foto principal)", () => {
    for (const p of withPhotos) {
      const alts = imgTags(html(p.slug)).map((t) => decode(attr(t, "alt") ?? ""));
      for (const src of p.images) expect(alts, `${p.slug} ${src}`).toContain(p.imageAlts![src]!);
    }
  });
  test("as imagens da rotação 360° também têm descrição (mesmo antes de carregar)", () => {
    const tags = imgTags(html("esteira-transportadora-para-granel")).filter((t) => attr(t, "class")?.includes("opacity-0"));
    expect(tags.length).toBeGreaterThan(5);
    for (const t of tags) expect(attr(t, "alt")!.length).toBeGreaterThan(20);
  });
  test("o schema Product lista todas as fotos, com endereço completo", () => {
    for (const p of products.filter((x) => x.images.length)) {
      const blocks = [...html(p.slug).matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!)).flat();
      const prod = blocks.find((b) => b["@type"] === "Product");
      expect(prod.image, p.slug).toEqual(p.images.map((i) => `https://www.demakine.com.br${i}`));
    }
  });
  test("a capa de cada vídeo tem como descrição o título do vídeo", () => {
    const t = html("esteira-transportadora-para-granel");
    for (const title of ["Esteira transportadora para granel dentro da NR-10 e NR-12", "Esteira transportadora de grãos, milho e ração", "Esteira transportadora em V para grãos e granel"]) {
      expect(imgTags(t).some((i) => decode(attr(i, "alt") ?? "") === title), title).toBe(true);
    }
  });
});
