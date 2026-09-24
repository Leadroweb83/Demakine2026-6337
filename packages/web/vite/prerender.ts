/**
 * Pré-renderização: gera um HTML pronto (título, descrição, canonical, dados estruturados e o texto
 * da página) para cada endereço do sitemap, com o conteúdo do painel no momento do build.
 * Quem não roda JavaScript (Bing, WhatsApp, LinkedIn, ChatGPT) passa a ler a página de verdade;
 * no navegador, main.tsx hidrata esse HTML ou redesenha se o painel mudou depois do build.
 *
 * Roda depois de `vite build` (dist/) e `vite build --ssr` (dist-ssr/). Uso: bun vite/prerender.ts
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isNull } from "drizzle-orm";

const ROOT = path.resolve(import.meta.dir, "..");
const DIST = path.join(ROOT, "dist");
const SSR_ENTRY = path.join(ROOT, "dist-ssr", "entry-server.js");
/** página de erro: a Vercel devolve 404.html com status 404 para o que não existe */
const NOT_FOUND_PATH = "/__pagina-nao-encontrada";

type Head = {
  title?: string;
  meta: Map<string, { attr: "name" | "property"; content: string }>;
  canonical?: string;
  alternates: { hreflang: string; href: string }[];
  jsonLd: unknown[];
  htmlLang?: string;
  preloadImage?: string;
};
type Snapshot = { docs: Record<string, Record<string, unknown>>; deleted: Record<string, string[]>; version: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** JSON dentro de <script>: nada de "</script>" nem comentário HTML escapando */
const inlineJson = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

async function loadData() {
  const started = new Date();
  try {
    const { getContentSnapshot } = await import("../src/api/lib/content-snapshot");
    const { db } = await import("../src/api/database");
    const schema = await import("../src/api/database/schema");
    const { isJobOpen, publicJob } = await import("../src/api/lib/jobs");
    const { buildSitemap } = await import("../src/api/lib/sitemap");
    const snapshot = await getContentSnapshot();
    const docs = await db.select().from(schema.contentDocs);
    const allJobs = await db.select().from(schema.jobs).where(isNull(schema.jobs.deletedAt));
    const open = allJobs.filter(isJobOpen);
    const sitemap = buildSitemap(docs, open);
    // mesmo formato que a API entrega ao navegador (datas viram texto)
    const jobs = JSON.parse(JSON.stringify(open.map(publicJob))) as { slug: string }[];
    return { snapshot, sitemap, jobs, started, fromDb: true };
  } catch (err) {
    // sem banco no build: gera com o conteúdo do código; o navegador busca o do painel e redesenha
    console.warn("[prerender] banco indisponível, usando o conteúdo padrão do código:", err instanceof Error ? err.message : err);
    const { buildSitemap } = await import("../src/api/lib/sitemap");
    return {
      snapshot: { docs: {}, deleted: {}, version: "padrao" } as Snapshot,
      sitemap: buildSitemap([], []),
      jobs: [] as { slug: string }[],
      started,
      fromDb: false,
    };
  }
}

function pageUrls(sitemap: string) {
  return [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1]!.replace(/&amp;/g, "&") || "/");
}

/** Arquivo servido para o endereço (vercel.json cleanUrls: /produtos/x -> produtos/x.html). */
function fileFor(url: string) {
  if (url === "/") return "index.html";
  if (url === NOT_FOUND_PATH) return "404.html";
  const [p, q] = url.split("?");
  // /export?lang=en vira export-en.html (o middleware reescreve o endereço com ?lang=en)
  const lang = new URLSearchParams(q ?? "").get("lang");
  const base = p!.replace(/^\//, "");
  return `${base}${lang && lang !== "es" ? `-${lang}` : ""}.html`;
}

/**
 * O React 19 abre o HTML com um preload para cada imagem sem lazy (na galeria do produto são 8, e
 * elas disputam a conexão com a foto principal). Fica só a primeira imagem de conteúdo, com
 * prioridade alta: é a candidata a LCP. O resto sai (e nada disso pode ficar dentro de #root).
 */
function takeImagePreloads(rendered: string, declared?: string) {
  const lead = rendered.match(/^(?:<link rel="preload" as="image"[^>]*\/>)+/)?.[0] ?? "";
  const hrefs = [...lead.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);
  const main = declared ?? hrefs.find((h) => !/\/logo-/.test(h));
  const tags = main ? [`<link rel="preload" as="image" href="${main}" fetchpriority="high" />`] : [];
  return { body: rendered.slice(lead.length), tags };
}

function buildHtml(template: string, rendered: string, head: Head, boot: unknown) {
  const { body, tags: preloads } = takeImagePreloads(rendered, head.preloadImage);
  rendered = body;
  let html = template
    // tags genéricas do index.html saem: cada página traz as suas
    .replace(/<title>[\s\S]*?<\/title>\s*/, "")
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:(?!site_name)[^"]+|twitter:[^"]+)"[\s\S]*?\/>\s*/g, "")
    .replace(/<link rel="canonical"[^>]*>\s*/, "");
  // substituições com função: textos com "$" (R$ 48.500) não podem virar padrão de replace
  if (head.htmlLang) html = html.replace(/<html lang="[^"]*"/, () => `<html lang="${esc(head.htmlLang!)}"`);
  const tags = [
    ...preloads,
    head.title ? `<title>${esc(head.title)}</title>` : "",
    ...[...head.meta.entries()].map(([key, { attr, content }]) => `<meta ${attr}="${esc(key)}" content="${esc(content)}" />`),
    head.canonical ? `<link rel="canonical" href="${esc(head.canonical)}" />` : "",
    ...head.alternates.map((a) => `<link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}" data-ssr />`),
    ...head.jsonLd.map((j) => `<script type="application/ld+json" data-ssr>${inlineJson(j)}</script>`),
    `<script>window.__DM_SSR__=${inlineJson(boot)}</script>`,
  ].filter(Boolean);
  html = html.replace("</head>", () => `\t\t${tags.join("\n\t\t")}\n\t</head>`);
  return html.replace('<div id="root"></div>', () => `<div id="root">${rendered}</div>`);
}

async function main() {
  const t0 = Date.now();
  // molde: o index.html do vite build. Rodando de novo sem novo build, o index.html já é a home
  // pré-renderizada; aí o molde vem da casca gravada na primeira vez (_app.html)
  let template = await readFile(path.join(DIST, "index.html"), "utf8");
  if (!template.includes('<div id="root"></div>')) template = await readFile(path.join(DIST, "_app.html"), "utf8");
  if (!template.includes('<div id="root"></div>')) throw new Error("molde sem <div id=\"root\"></div>: rode o vite build antes");
  // casca do app sem pré-renderização: painel e loja (vercel.json reescreve para cá)
  await writeFile(path.join(DIST, "_app.html"), template);

  const { snapshot, sitemap, jobs, started, fromDb } = await loadData();
  (globalThis as { __DM_CONTENT__?: Snapshot }).__DM_CONTENT__ = snapshot;
  // cópia estática do conteúdo usado no build: reserva se /api/conteudo falhar no navegador
  await writeFile(path.join(DIST, `conteudo-${snapshot.version}.json`), JSON.stringify(snapshot));

  const { render } = (await import(pathToFileURL(SSR_ENTRY).href)) as {
    render: (p: string, s: string, prefill: [unknown[], unknown][]) => Promise<{ html: string; head: Head; queries: unknown }>;
  };

  const urls = [...pageUrls(sitemap), NOT_FOUND_PATH];
  const jobPrefill: [unknown[], unknown] = [["vagas"], jobs];
  let count = 0;
  for (const url of urls) {
    const [p, q = ""] = url.split("?");
    const prefill: [unknown[], unknown][] = [jobPrefill];
    const job = p!.match(/^\/vagas\/([^/]+)$/);
    if (job) prefill.push([["vaga", job[1]], jobs.find((j) => j.slug === job[1]) ?? null]);
    const { html, head, queries } = await render(p!, q, prefill);
    const file = path.join(DIST, fileFor(url));
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buildHtml(template, html, head, { version: snapshot.version, queries }));
    count++;
  }
  await rm(path.join(ROOT, "dist-ssr"), { recursive: true, force: true });
  console.log(`[prerender] ${count} páginas em ${((Date.now() - t0) / 1000).toFixed(1)} s (conteúdo ${fromDb ? snapshot.version : "padrão"})`);

  if (fromDb) {
    const { afterPrerender } = await import("../src/api/lib/publish");
    await afterPrerender(started);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("[prerender] falhou:", err);
  process.exit(1);
});
