import { describe, expect, test } from "bun:test";
import { runDuel, type DuelResult, type DuelRow, type DuelState, type DuelStore } from "../../src/api/lib/seo/run-duel";
import { completeRun, memoryStore, pageHtml, sitePage } from "./helpers/audit-fakes";
import { perfectFacts } from "./helpers/facts";

const N = 10;
const sitemapOf = (origin: string, n = N) => `<urlset>${Array.from({ length: n }, (_, i) => `<url><loc>${origin}/${i === 0 ? "" : `p${i}`}</loc><lastmod>2026-11-0${(i % 9) + 1}</lastmod></url>`).join("")}</urlset>`;

type Site = { robots?: string; robotsStatus?: number; sitemap?: string | null; home?: string; homeRedirect?: string };
function fakeWeb(sites: Record<string, Site>) {
  const web = {
    t: 1_000_000,
    calls: [] as string[],
    now: () => web.t,
    get: async (url: string, origin: string) => {
      web.calls.push(url);
      web.t += 1000; // 1 requisição por segundo
      const s = sites[origin] ?? {};
      const path = url.slice(origin.length) || "/";
      const ok = (html: string) => ({ status: 200, html, finalUrl: url });
      if (path === "/robots.txt") return s.robotsStatus ? { status: s.robotsStatus, html: "", finalUrl: url } : ok(s.robots ?? "");
      if (path === "/sitemap.xml") return s.sitemap === null ? { status: 404, html: "", finalUrl: url } : ok(s.sitemap ?? sitemapOf(origin));
      if (path === "/" && s.homeRedirect) return { status: 301, html: "", finalUrl: url, location: s.homeRedirect };
      if (path === "/" && s.home) return ok(s.home);
      return ok(pageHtml(path === "/" ? "/home" : path));
    },
  };
  return web;
}

function memoryDuels(comps: { id: number; name: string; url: string }[]) {
  const rows: (DuelRow & { result?: DuelResult })[] = [];
  const finished: DuelResult[] = [];
  const s: DuelStore & { rows: typeof rows; finished: DuelResult[] } = {
    rows,
    finished,
    competitors: async () => comps,
    abandonStale: async (older) => {
      for (const r of rows) if (r.status === "em-andamento" && r.startedAt < older) r.status = "completa";
    },
    findResumable: async (newer) => rows.find((r) => r.status === "em-andamento" && r.startedAt >= newer) ?? null,
    create: async (startedAt) => {
      const r: DuelRow = { id: rows.length + 1, startedAt, status: "em-andamento", state: { sites: {} } };
      rows.push(r);
      return structuredClone(r);
    },
    saveState: async (id, state: DuelState) => {
      rows.find((r) => r.id === id)!.state = structuredClone(state);
    },
    finish: async (id, result) => {
      const r = rows.find((x) => x.id === id)!;
      r.status = "completa";
      finished.push(result);
    },
    latest: async () => finished.at(-1) ?? null,
  };
  return s;
}

function ours() {
  const store = memoryStore([sitePage("/a"), sitePage("/b")], { runs: [completeRun(1, 90, new Date())] });
  for (const p of ["/a", "/b"]) {
    store.rows.push({ runId: 1, path: p, lang: "pt", area: "institucional", seoScore: 90, checks: [{ item: "imagens", points: 2, max: 10, ok: false, message: "m", fix: "f" }], facts: perfectFacts({ words: 100 }), statusCode: 200, indexable: true, inlinks: 3 });
  }
  return store;
}

const A = { id: 1, name: "Rival A", url: "https://rival-a.com.br" };
const B = { id: 2, name: "Rival B", url: "https://rival-b.com.br" };
const base = (web: ReturnType<typeof fakeWeb>, duels: ReturnType<typeof memoryDuels>, audit = ours()) => ({
  store: duels, audit, now: web.now, fetchExternal: web.get, ourSitemap: async () => ({ total: 100, blogLastmods: ["2026-11-01"] }),
});

describe("runDuel", () => {
  test("dois concorrentes com 10 páginas cada terminam completos, com placar e ações", async () => {
    const web = fakeWeb({ [A.url]: {}, [B.url]: {} });
    const duels = memoryDuels([A, B]);
    const r = await runDuel({ budgetMs: 10_000_000 }, base(web, duels));
    expect(r).toMatchObject({ status: "completa", done: 2 * N, total: 2 * N });
    expect(duels.finished).toHaveLength(1);
    const res = duels.finished[0]!;
    expect(res.sites.map((s) => [s.name, s.status, s.metrics?.pages])).toEqual([["Rival A", "ok", N], ["Rival B", "ok", N]]);
    expect(Object.keys(res.verdicts)).toEqual(["Rival A", "Rival B"]);
    expect(res.board["Rival A"]!.better + res.board["Rival A"]!.worse + res.board["Rival A"]!.tie).toBeGreaterThan(0);
    expect(res.ours.samples).toBe(2);
    expect(res.actions.length).toBeGreaterThan(0); // concorrente com mais texto que a Demakine do teste
  });

  test("tempo curto devolve parcial; a segunda chamada continua sem reler páginas e só então grava o placar", async () => {
    const web = fakeWeb({ [A.url]: {}, [B.url]: {} });
    const duels = memoryDuels([A, B]);
    const first = await runDuel({ budgetMs: 8000 }, base(web, duels));
    expect(first.status).toBe("parcial");
    expect(first.done).toBeLessThan(first.total);
    expect(duels.finished).toEqual([]);
    expect(duels.rows).toHaveLength(1);
    const second = await runDuel({ budgetMs: 10_000_000 }, base(web, duels));
    expect(second).toMatchObject({ status: "completa", done: 2 * N });
    expect(duels.rows).toHaveLength(1);
    expect(duels.finished).toHaveLength(1);
    const pageCalls = web.calls.filter((c) => /\/(p\d+)$/.test(c));
    expect(new Set(pageCalls).size).toBe(pageCalls.length); // nenhuma página lida duas vezes
  });

  test("concorrente que bloqueia o robô no robots.txt é pulado e o outro segue", async () => {
    const web = fakeWeb({ [A.url]: { robots: "User-agent: *\nDisallow: /" }, [B.url]: {} });
    const duels = memoryDuels([A, B]);
    await runDuel({ budgetMs: 10_000_000 }, base(web, duels));
    const res = duels.finished[0]!;
    expect(res.sites[0]).toMatchObject({ status: "bloqueado-robots", metrics: null });
    expect(res.sites[1]!.status).toBe("ok");
    expect(web.calls.some((c) => c.startsWith(A.url) && !c.endsWith("/robots.txt"))).toBe(false); // nem sitemap nem páginas
    expect(Object.keys(res.verdicts)).toEqual(["Rival B"]);
  });

  test("robots.txt com erro do servidor vira 'erro'; site sem sitemap e sem links vira 'sem-paginas'", async () => {
    const web = fakeWeb({ [A.url]: { robotsStatus: 503 }, [B.url]: { sitemap: null, home: "<html></html>" } });
    const duels = memoryDuels([A, B]);
    await runDuel({ budgetMs: 10_000_000 }, base(web, duels));
    expect(duels.finished[0]!.sites.map((s) => s.status)).toEqual(["erro", "sem-paginas"]);
    expect(duels.finished[0]!.actions).toEqual([]);
  });

  test("site que redireciona para outro endereço vira 'redireciona', com o destino, em vez de 'sem páginas'", async () => {
    const web = fakeWeb({ [A.url]: { sitemap: null, homeRedirect: "https://www.outro.com/" } });
    const duels = memoryDuels([A]);
    await runDuel({ budgetMs: 10_000_000 }, base(web, duels));
    expect(duels.finished[0]!.sites[0]).toMatchObject({ status: "redireciona", redirectTo: "https://www.outro.com/", metrics: null });
  });

  test("página só em português (de propósito) não derruba a nota de idiomas da Demakine", async () => {
    const web = fakeWeb({ [A.url]: {} });
    const duels = memoryDuels([A]);
    const audit = ours();
    audit.pages.push(sitePage("/esteira-transportadora-preco"));
    audit.rows.push({ runId: 1, path: "/esteira-transportadora-preco", lang: "pt", area: "comerciais", seoScore: 90, checks: [], facts: perfectFacts({ hreflangs: [] }), statusCode: 200, indexable: true, inlinks: 3 });
    await runDuel({ budgetMs: 10_000_000 }, base(web, duels, audit));
    const res = duels.finished[0]!;
    expect(res.ours.samples).toBe(3);
    expect(res.ours.scores.idiomas).toBe(100); // /a e /b têm os 4 idiomas; a página só em português fica fora
    expect(res.ours.scores.titulo).toBe(100);
  });

  test("sem auditoria completa da Demakine ou sem concorrente cadastrado, pede o passo que falta", async () => {
    const web = fakeWeb({});
    await expect(runDuel({ budgetMs: 1000 }, base(web, memoryDuels([A]), memoryStore([])))).rejects.toThrow("Rode a auditoria completa primeiro");
    await expect(runDuel({ budgetMs: 1000 }, base(web, memoryDuels([])))).rejects.toThrow("Cadastre um concorrente primeiro");
  });

  test("duelo parado há mais de 30 minutos é abandonado e um novo começa", async () => {
    const web = fakeWeb({ [A.url]: {} });
    const duels = memoryDuels([A]);
    duels.rows.push({ id: 1, startedAt: new Date(web.now() - 31 * 60_000), status: "em-andamento", state: { sites: {} } });
    await runDuel({ budgetMs: 10_000_000 }, base(web, duels));
    expect(duels.rows).toHaveLength(2);
    expect(duels.rows[0]!.status).toBe("completa");
  });
});
