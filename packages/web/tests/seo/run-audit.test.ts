import { describe, expect, test } from "bun:test";
import { auditSite } from "../../src/api/lib/seo/run-audit";
import { DEFAULT_RULES } from "../../src/api/lib/seo/rules";
import { completeRun, fakeSite, memoryStore, pageHtml, ring, ringLinks, sitePage } from "./helpers/audit-fakes";

const N = 10;
const pages = (n = N) => ring(n).map((p) => sitePage(p));
const deps = (site: ReturnType<typeof fakeSite>, store: ReturnType<typeof memoryStore>, extra = {}) => ({
  store, fetchPage: site.fetchPage, now: site.now, concurrency: 1, chunkSize: 2, ...extra,
});
const pageCalls = (site: ReturnType<typeof fakeSite>) => site.calls.filter((c) => /^\/p\d+$/.test(c));
const check = (row: { checks: unknown }, item: string) => (row.checks as { item: string; points: number; max: number; ok: boolean }[]).find((c) => c.item === item)!;

describe("auditSite: execução completa", () => {
  test("audita todas as páginas, grava notas e fecha a execução", async () => {
    const site = fakeSite(N);
    const store = memoryStore(pages());
    const r = await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(r).toMatchObject({ status: "completa", audited: N, total: N });
    expect(store.runs).toHaveLength(1);
    const run = store.runs[0]!;
    expect(run).toMatchObject({ id: r.runId, kind: "diaria", status: "completa", pagesTotal: N, pagesAudited: N });
    expect(run.finishedAt).not.toBeNull();
    expect(run.siteSeoScore).toBeGreaterThanOrEqual(95);
    expect(run.areaScores).toMatchObject({ institucional: expect.any(Number) });
    expect(Object.keys(run.sectorScores)).toContain("conteudo");
    expect(store.rows).toHaveLength(N);
    for (const row of store.rows) {
      expect(row.seoScore).toBeGreaterThanOrEqual(95);
      expect(row.inlinks).toBe(3);
      expect(row.statusCode).toBe(200);
      expect(row.indexable).toBe(true);
    }
    expect(store.issues).toEqual([]);
  });

  test("o tipo da execução (manual) é gravado", async () => {
    const site = fakeSite(3);
    const store = memoryStore(pages(3));
    await auditSite({ kind: "manual", budgetMs: 60_000 }, deps(site, store));
    expect(store.runs[0]!.kind).toBe("manual");
  });

  test("usa as regras salvas no painel", async () => {
    const site = fakeSite(3);
    const store = memoryStore(pages(3), { rules: { ...DEFAULT_RULES, title: { min: 5, max: 10 } } });
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(check(store.rows[0]!, "titulo").ok).toBe(false);
  });
});

describe("auditSite: execução interrompida e retomada", () => {
  test("com pouco tempo devolve parcial; a segunda chamada continua, sem duplicar e sem buscar de novo", async () => {
    const site = fakeSite(N);
    const store = memoryStore(pages());
    const first = await auditSite({ kind: "diaria", budgetMs: 35 }, deps(site, store));
    expect(first.status).toBe("parcial");
    expect(first.audited).toBeGreaterThan(0);
    expect(first.audited).toBeLessThan(N);
    expect(first.total).toBe(N);
    expect(store.runs).toHaveLength(1);
    expect(store.runs[0]).toMatchObject({ status: "em-andamento", siteSeoScore: null, finishedAt: null, pagesAudited: first.audited });

    const second = await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(second).toMatchObject({ runId: first.runId, status: "completa", audited: N, total: N });
    expect(store.runs).toHaveLength(1);
    expect(store.runs[0]!.siteSeoScore).not.toBeNull();
    expect(store.rows).toHaveLength(N);
    expect(pageCalls(site).sort()).toEqual(ring(N).sort()); // cada página buscada uma única vez
  });

  test("execução parada há mais de 30 minutos é abandonada e uma nova começa", async () => {
    const site = fakeSite(3);
    const stale = { ...completeRun(1, 0, new Date(site.now() - 31 * 60_000)), status: "em-andamento" as const, finishedAt: null, siteSeoScore: null };
    const store = memoryStore(pages(3), { runs: [stale] });
    const r = await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(r.runId).toBe(2);
    expect(store.runs[0]).toMatchObject({ id: 1, status: "parcial" });
    expect(store.runs[1]).toMatchObject({ id: 2, status: "completa" });
  });

  test("página nova criada durante a pausa entra na retomada", async () => {
    const site = fakeSite(4);
    const store = memoryStore(pages(3));
    await auditSite({ kind: "diaria", budgetMs: 15 }, deps(site, store));
    store.pages = pages(4); // alguém criou /p3 no painel
    const r = await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(r.status).toBe("completa");
    expect(store.rows.map((x) => x.path).sort()).toEqual(ring(4).sort());
  });
});

describe("auditSite: problemas encontrados", () => {
  test("página que responde 404 zera a indexação e abre um problema crítico", async () => {
    const site = fakeSite(N, { "/p3": { status: 404, html: "<h1>Não encontrada</h1>" } });
    const store = memoryStore(pages());
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    const row = store.rows.find((r) => r.path === "/p3")!;
    expect(row.statusCode).toBe(404);
    expect(check(row, "indexacao").points).toBe(0);
    expect(row.indexable).toBe(false);
    expect(store.issues.filter((i) => i.path === "/p3")).toEqual([expect.objectContaining({ code: "status", severity: "critico", resolvedAt: null })]);
    expect(store.issues.filter((i) => i.severity === "critico")).toHaveLength(1);
    expect(store.runs[0]!.alerts.join(" ")).toContain("Problema crítico novo em /p3");
  });

  test("o problema resolvido na execução seguinte é fechado", async () => {
    const store = memoryStore(pages());
    const broken = fakeSite(N, { "/p3": { status: 404 } });
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(broken, store));
    expect(store.issues.filter((i) => i.path === "/p3" && i.resolvedAt === null)).toHaveLength(1);
    const fixed = fakeSite(N);
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(fixed, store));
    expect(store.runs).toHaveLength(2);
    expect(store.issues.filter((i) => i.path === "/p3")).toHaveLength(1);
    expect(store.issues.filter((i) => i.path === "/p3")[0]!.resolvedAt).not.toBeNull();
    expect(store.issues.every((i) => i.resolvedAt !== null)).toBe(true); // os avisos dos vizinhos também fecharam
  });

  test("queda de nota maior que 5 pontos gera alerta", async () => {
    const site = fakeSite(N, { "/p3": { status: 404 }, "/p4": { status: 500 } });
    const store = memoryStore(pages(), { runs: [completeRun(1, 100, new Date(site.now() - 86_400_000))] });
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    const run = store.runs.find((r) => r.id === 2)!;
    expect(run.siteSeoScore).toBeLessThan(90);
    expect(run.alerts).toContain(`A nota do site caiu ${100 - run.siteSeoScore!} pontos`);
  });

  test("títulos iguais em duas páginas perdem pontos nas duas", async () => {
    const same = "Título repetido em duas páginas do site Demakine";
    const site = fakeSite(N, { "/p1": { html: pageHtml("/p1", { title: same, links: ringLinks(1, N) }) }, "/p2": { html: pageHtml("/p2", { title: same, links: ringLinks(2, N) }) } });
    const store = memoryStore(pages());
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    for (const p of ["/p1", "/p2"]) {
      const c = check(store.rows.find((r) => r.path === p)!, "titulo");
      expect(c.points).toBeLessThan(c.max);
    }
    expect(check(store.rows.find((r) => r.path === "/p5")!, "titulo").ok).toBe(true);
  });

  test("links recebidos vêm dos links de todas as páginas da execução", async () => {
    const site = fakeSite(N, { "/p0": { html: pageHtml("/p0", { links: [] }) } }); // p0 deixa de linkar as outras
    const store = memoryStore(pages());
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    const inlinks = Object.fromEntries(store.rows.map((r) => [r.path, r.inlinks]));
    expect(inlinks["/p1"]).toBe(2); // era linkada por p0, p9 e p8
    expect(inlinks["/p0"]).toBe(3);
    const p0 = store.rows.find((r) => r.path === "/p0")!;
    expect(check(p0, "links").ok).toBe(false); // não envia links
  });
});

describe("auditSite: páginas técnicas, ocultas e quebradas", () => {
  test("página técnica ou ocultada pelo painel não gera problema nem derruba a nota do site", async () => {
    const list = [...pages(), sitePage("/obrigado", { technical: true, area: "tecnica" }), sitePage("/oculta", { hiddenByPanel: true })];
    const bad = pageHtml("/x", { robots: "noindex", title: null, h1: null, links: [] });
    const site = fakeSite(N, { "/obrigado": { html: bad }, "/oculta": { html: bad } });
    const store = memoryStore(list);
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(store.issues).toEqual([]);
    expect(store.runs[0]!.siteSeoScore).toBeGreaterThanOrEqual(95);
    expect(store.rows.map((r) => r.path)).toContain("/oculta");
    expect(store.runs[0]!.areaScores).not.toHaveProperty("tecnica");
  });

  test("HTML quebrado e erro de rede não derrubam a auditoria", async () => {
    const site = fakeSite(N, { "/p2": { html: "<html><title>" }, "/p6": { throws: true } });
    const store = memoryStore(pages());
    const r = await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(r.status).toBe("completa");
    expect(store.rows.find((x) => x.path === "/p6")).toMatchObject({ statusCode: 0, indexable: false });
    expect(store.rows.find((x) => x.path === "/p2")!.seoScore).toBeLessThan(60);
  });

  test("link interno para página que deu 404 reduz a nota do site", async () => {
    const ok = fakeSite(N);
    const a = memoryStore(pages());
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(ok, a));
    const withBroken = fakeSite(N, { "/p9": { status: 404 } });
    const b = memoryStore(pages());
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(withBroken, b));
    // além da página 404 (nota 0), três páginas linkam para /p9
    expect(b.runs[0]!.siteSeoScore!).toBeLessThan(a.runs[0]!.siteSeoScore! - 9);
  });

  test("sitemap fora do ar e robots que bloqueia o site derrubam a nota", async () => {
    const site = fakeSite(3);
    const base = site.fetchPage;
    site.fetchPage = async (url) => {
      const path = new URL(url).pathname;
      if (path === "/sitemap.xml") return { status: 500, html: "", finalUrl: url, hops: 0 };
      if (path === "/robots.txt") return { status: 200, html: "User-agent: *\nDisallow: /\n", finalUrl: url, hops: 0 };
      return base(url);
    };
    const store = memoryStore(pages(3));
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    expect(store.runs[0]!.siteSeoScore).toBeLessThanOrEqual(100 - 55);
  });
});

describe("auditSite: uma página só", () => {
  test("atualiza a nota daquela página na última execução completa, sem criar outra", async () => {
    const store = memoryStore(pages());
    const site = fakeSite(N);
    await auditSite({ kind: "diaria", budgetMs: 60_000 }, deps(site, store));
    const before = store.rows.find((r) => r.path === "/p0")!.seoScore;
    const other = store.rows.find((r) => r.path === "/p1")!.seoScore;

    site.overrides["/p0"] = { html: pageHtml("/p0", { title: null, links: ringLinks(0, N) }) };
    const r = await auditSite({ kind: "manual", budgetMs: 60_000, paths: ["/p0"] }, deps(site, store));
    expect(r).toMatchObject({ runId: 1, status: "completa", audited: 1, total: 1 });
    expect(store.runs).toHaveLength(1);
    expect(store.rows.find((x) => x.path === "/p0")!.seoScore).toBeLessThan(before);
    expect(store.rows.find((x) => x.path === "/p1")!.seoScore).toBe(other);
    expect(store.rows.find((x) => x.path === "/p0")!.inlinks).toBe(3); // links das outras páginas continuam contando
    expect(store.issues).toEqual([expect.objectContaining({ path: "/p0", code: "titulo", resolvedAt: null })]);
  });

  test("sem execução completa anterior, pede a auditoria completa", async () => {
    const store = memoryStore(pages(3));
    await expect(auditSite({ kind: "manual", budgetMs: 1000, paths: ["/p0"] }, deps(fakeSite(3), store))).rejects.toThrow("Rode a auditoria completa primeiro");
  });

  test("caminho que não existe no site é recusado", async () => {
    const store = memoryStore(pages(3), { runs: [completeRun(1, 100, new Date())] });
    await expect(auditSite({ kind: "manual", budgetMs: 1000, paths: ["/nao-existe"] }, deps(fakeSite(3), store))).rejects.toThrow("Página não encontrada");
  });
});
