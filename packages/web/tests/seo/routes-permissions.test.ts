import { beforeEach, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createSeoRoutes, type SeoData } from "../../src/api/seo-routes";
import type { SessionUser } from "../../src/api/middleware/roles";
import { DEFAULT_RULES, type SeoRules } from "../../src/api/lib/seo/rules";
import type { AuditOptions, AuditResult, StoredPage } from "../../src/api/lib/seo/run-audit";
import { completeRun, memoryStore, sitePage } from "./helpers/audit-fakes";
import { perfectFacts } from "./helpers/facts";
import type { LinkReport } from "../../src/api/lib/seo/links";
import type { OldUrlResult } from "../../src/api/lib/seo/import-old";

type Env = { Variables: { user: SessionUser | null; session: unknown } };

const user = (role: string | null, extra: Partial<SessionUser> = {}): SessionUser | null =>
  role === null ? null : { id: "u1", name: "Fulano", email: "f@x.com", role, active: true, ...extra };

type Fake = SeoData & { audits: AuditOptions[]; saved: SeoRules[]; resets: number; closed: AuditResult[]; verified: number; alts: { slug: string; src: string; alt: string }[]; tested: string[][]; created: { items: { from: string; to: string }[]; userId: string }[]; docs: { key: string; doc: Record<string, unknown>; userId: string }[] };

function fakeData(): Fake {
  const pages = [sitePage("/a"), sitePage("/b", { area: "produtos", label: "Produto B" }), sitePage("/en/a", { lang: "en", label: "A (EN)" })];
  const store = memoryStore(pages, { runs: [completeRun(1, 88, new Date("2026-11-10T13:00:00Z"))] });
  store.rows.push(
    { runId: 1, path: "/a", lang: "pt", area: "institucional", seoScore: 90, checks: [{ item: "titulo", points: 0, max: 15, ok: false, message: "Sem título", fix: "Escreva um título", code: "titulo" }], facts: perfectFacts(), statusCode: 200, indexable: true, inlinks: 2 } satisfies StoredPage,
    { runId: 1, path: "/b", lang: "pt", area: "produtos", seoScore: 70, checks: [], facts: null, statusCode: 404, indexable: false, inlinks: 0 } satisfies StoredPage,
  );
  store.runs[0]!.areaScores = { institucional: 90, produtos: 70 };
  store.runs[0]!.sectorScores = { conteudo: 80 };
  store.runs[0]!.alerts = ["A nota do site caiu 7 pontos"];
  store.issues.push({ path: "/a", code: "titulo", severity: "critico", message: "Sem título", resolvedAt: null, firstSeen: new Date(), lastSeen: new Date() });
  const d: Fake = {
    store,
    audits: [],
    saved: [],
    resets: 0,
    closed: [],
    verified: 0,
    alts: [],
    tips: { today: async () => ({ date: "2026-11-12", tips: [{ id: "x", title: "T", body: "Corpo da dica de teste", tab: "regras" as const, kind: "biblioteca" as const }] }) },
    setImageAlt: async (slug, src, alt) => void d.alts.push({ slug, src, alt }),
    tested: [],
    created: [],
    links: {
      latest: async () => null,
      verify: async () => {
        d.verified++;
        return { at: "2026-11-11T10:00:00.000Z", checked: 12, truncated: false, broken: [{ url: "https://www.demakine.com.br/sumiu", status: 404, chain: [], broken: true, foundOn: ["/a"] }], redirected: [] } satisfies LinkReport;
      },
    },
    importOld: {
      test: async (paths) => {
        d.tested.push(paths);
        return paths.map((path) => ({ path, status: 404, finalPath: null, needsRedirect: true, suggested: null }) satisfies OldUrlResult);
      },
      create: async (items, userId) => {
        d.created.push({ items, userId });
        return { created: items.length, skipped: [] };
      },
    },
    docs: [],
    savePageDoc: async (key, doc, userId) => void d.docs.push({ key, doc, userId }),
    history: async () => [{ date: "2026-11-10", site: 88 }],
    timeline: async () => [{ at: "2026-11-10T13:00:00.000Z", text: "Auditoria completa: nota 88" }],
    visits: async (path) => (path === "/a" ? 120 : 0),
    saveRules: async (r) => void d.saved.push(r),
    resetRules: async () => void d.resets++,
    audit: async (o) => {
      d.audits.push(o);
      return { runId: 1, status: "completa", audited: o.paths?.length ?? 3, total: o.paths?.length ?? 3 };
    },
    onAuditClosed: async (r) => void d.closed.push(r),
  };
  return d;
}

let data: Fake;
const appFor = (role: string | null, secret = "segredo") => {
  const app = new Hono<Env>();
  app.use(async (c, next) => {
    c.set("user", user(role));
    await next();
  });
  const routes = createSeoRoutes({ data, cronSecret: () => secret });
  app.route("/", routes);
  return { app, routes };
};
const json = (body: unknown) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const put = (body: unknown) => ({ method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

beforeEach(() => {
  data = fakeData();
});

describe("permissões: só o super_admin entra em /admin/seo/*", () => {
  const { routes } = appFor("super_admin");
  const seoRoutes = routes.routes.filter((r) => r.path.startsWith("/admin/seo"));

  test("a lista de rotas protegidas não está vazia e cobre as da Task 8", () => {
    const sigs = new Set(seoRoutes.map((r) => `${r.method} ${r.path}`));
    for (const s of ["GET /admin/seo/resumo", "GET /admin/seo/paginas", "GET /admin/seo/pagina", "PUT /admin/seo/pagina", "POST /admin/seo/auditar", "GET /admin/seo/links", "GET /admin/seo/dicas", "GET /admin/seo/imagens", "PUT /admin/seo/imagem-alt", "GET /admin/seo/estruturados", "POST /admin/seo/links/verificar", "POST /admin/seo/importar/testar", "POST /admin/seo/importar/criar", "GET /admin/seo/regras", "PUT /admin/seo/regras", "DELETE /admin/seo/regras"]) {
      expect(sigs.has(s), s).toBe(true);
    }
  });

  test("admin, editor, vendedor, rh e visitante recebem 401 ou 403 em TODAS as rotas", async () => {
    for (const role of ["admin", "editor", "vendedor", "rh", null]) {
      const { app } = appFor(role);
      for (const r of seoRoutes) {
        const path = r.path + (r.method === "GET" ? "?path=/a" : "");
        const res = await app.request(path, { method: r.method, headers: { "content-type": "application/json" }, body: r.method === "GET" ? undefined : "{}" });
        expect([401, 403], `${role} ${r.method} ${r.path} -> ${res.status}`).toContain(res.status);
      }
    }
    expect(data.audits).toEqual([]);
    expect(data.saved).toEqual([]);
    expect(data.resets).toBe(0);
  });

  test("usuário desativado, mesmo super_admin, é recusado", async () => {
    const app = new Hono<Env>();
    app.use(async (c, next) => {
      c.set("user", user("super_admin", { active: false }));
      await next();
    });
    app.route("/", createSeoRoutes({ data, cronSecret: () => "x" }));
    expect((await app.request("/admin/seo/regras")).status).toBe(403);
  });

  test("super_admin entra em todas as rotas (nenhuma responde 401 ou 403)", async () => {
    const { app } = appFor("super_admin");
    for (const r of seoRoutes) {
      const path = r.path + (r.method === "GET" ? "?path=/a" : "");
      const res = await app.request(path, { method: r.method, headers: { "content-type": "application/json" }, body: r.method === "GET" ? undefined : "{}" });
      expect([401, 403], `${r.method} ${r.path}`).not.toContain(res.status);
    }
  });

  test("super_admin recebe 200 em /admin/seo/regras", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/regras");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rules: SeoRules; defaults: SeoRules };
    expect(body.rules).toEqual(DEFAULT_RULES);
    expect(body.defaults).toEqual(DEFAULT_RULES);
  });
});

describe("regras", () => {
  test("PUT com pesos somando 99 devolve 400 com a mensagem e não salva", async () => {
    const bad = structuredClone(DEFAULT_RULES);
    bad.weights.titulo -= 1;
    const res = await appFor("super_admin").app.request("/admin/seo/regras", put(bad));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; errors: string[] };
    expect(body.error).toBe("Os pesos precisam somar 100");
    expect(body.errors).toContain("Os pesos precisam somar 100");
    expect(data.saved).toEqual([]);
  });

  test("PUT com regras válidas salva e devolve as regras limpas", async () => {
    const ok = structuredClone(DEFAULT_RULES);
    ok.weights.titulo += 2;
    ok.weights.velocidade -= 2;
    ok.priorityPaths = ["/a-empresa", "/a-empresa", "  "];
    const res = await appFor("super_admin").app.request("/admin/seo/regras", put(ok));
    expect(res.status).toBe(200);
    expect(data.saved).toHaveLength(1);
    expect(data.saved[0]!.priorityPaths).toEqual(["/a-empresa"]);
    expect(((await res.json()) as { rules: SeoRules }).rules.weights.titulo).toBe(17);
  });

  test("PUT com corpo que não é JSON de regras devolve 400", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/regras", { method: "PUT", headers: { "content-type": "application/json" }, body: "isso não é json" });
    expect(res.status).toBe(400);
    expect(data.saved).toEqual([]);
  });

  test("DELETE volta ao padrão", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/regras", { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(data.resets).toBe(1);
    expect(((await res.json()) as { rules: SeoRules }).rules).toEqual(DEFAULT_RULES);
  });
});

describe("cron /cron/seo", () => {
  test("sem Authorization devolve 401 e não audita", async () => {
    expect((await appFor(null).app.request("/cron/seo")).status).toBe(401);
    expect(data.audits).toEqual([]);
  });

  test("segredo errado, ou parecido, devolve 401", async () => {
    for (const h of ["Bearer outro", "Bearer segredo2", "bearer segredo", "segredo", "Bearer", ""]) {
      expect((await appFor(null).app.request("/cron/seo", { headers: { authorization: h } })).status, h).toBe(401);
    }
    expect(data.audits).toEqual([]);
  });

  test("sem CRON_SECRET configurado, ninguém entra", async () => {
    expect((await appFor(null, "").app.request("/cron/seo", { headers: { authorization: "Bearer " } })).status).toBe(401);
  });

  test("com o segredo certo audita (diária) e devolve 200, mesmo sem usuário logado", async () => {
    const res = await appFor(null).app.request("/cron/seo", { headers: { authorization: "Bearer segredo" } });
    expect(res.status).toBe(200);
    expect(data.audits).toHaveLength(1);
    expect(data.audits[0]).toMatchObject({ kind: "diaria" });
    expect(data.audits[0]!.budgetMs).toBeGreaterThan(5_000);
    expect(((await res.json()) as { status: string }).status).toBe("completa");
  });

  test("quando a execução fecha, o gancho do fim da auditoria roda (dicas do dia)", async () => {
    await appFor(null).app.request("/cron/seo", { headers: { authorization: "Bearer segredo" } });
    expect(data.closed).toHaveLength(1);
  });
});

describe("resumo, páginas e página", () => {
  test("resumo: nota, histórico, setores, áreas, problemas com a correção, alertas e linha do tempo", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/resumo");
    expect(res.status).toBe(200);
    const b = (await res.json()) as Record<string, any>;
    expect(b.latest.siteSeoScore).toBe(88);
    expect(b.history).toEqual([{ date: "2026-11-10", site: 88 }]);
    expect(b.byArea).toEqual({ institucional: 90, produtos: 70 });
    expect(b.bySector).toEqual({ conteudo: 80 });
    expect(b.alerts).toEqual(["A nota do site caiu 7 pontos"]);
    expect(b.issues).toEqual([{ path: "/a", code: "titulo", severity: "critico", message: "Sem título", fix: "Escreva um título" }]);
    expect(b.timeline).toHaveLength(1);
    expect(b.running).toBeNull();
  });

  test("resumo sem nenhuma execução devolve latest nulo e listas vazias", async () => {
    const m = data.store as ReturnType<typeof memoryStore>;
    m.runs.length = 0;
    m.rows.length = 0;
    m.issues.length = 0;
    const b = (await (await appFor("super_admin").app.request("/admin/seo/resumo")).json()) as Record<string, any>;
    expect(b.latest).toBeNull();
    expect(b.issues).toEqual([]);
    expect(b.byArea).toEqual({});
  });

  test("resumo mostra a execução em andamento", async () => {
    const m = data.store as ReturnType<typeof memoryStore>;
    m.runs.push({ ...completeRun(2, 0, new Date()), status: "em-andamento", finishedAt: null, siteSeoScore: null, pagesTotal: 10, pagesAudited: 4 });
    const b = (await (await appFor("super_admin").app.request("/admin/seo/resumo")).json()) as Record<string, any>;
    expect(b.running).toEqual({ audited: 4, total: 10 });
    expect(b.latest.id).toBe(1); // a nota mostrada continua a da última execução completa
  });

  test("páginas: todas, com nota (ou não auditada), e filtros por área, idioma e busca", async () => {
    const { app } = appFor("super_admin");
    const all = ((await (await app.request("/admin/seo/paginas")).json()) as { pages: any[] }).pages;
    expect(all.map((p) => p.path)).toEqual(["/a", "/b", "/en/a"]);
    expect(all[0]).toMatchObject({ seoScore: 90, audited: true });
    expect(all[2]).toMatchObject({ seoScore: null, audited: false }); // página nova: ainda não auditada
    const prod = ((await (await app.request("/admin/seo/paginas?area=produtos")).json()) as { pages: any[] }).pages;
    expect(prod.map((p) => p.path)).toEqual(["/b"]);
    const en = ((await (await app.request("/admin/seo/paginas?lang=en")).json()) as { pages: any[] }).pages;
    expect(en.map((p) => p.path)).toEqual(["/en/a"]);
    const q = ((await (await app.request("/admin/seo/paginas?q=produto")).json()) as { pages: any[] }).pages;
    expect(q.map((p) => p.path)).toEqual(["/b"]);
  });

  test("páginas: filtro com valor inválido devolve 400", async () => {
    expect((await appFor("super_admin").app.request("/admin/seo/paginas?area=inventada")).status).toBe(400);
    expect((await appFor("super_admin").app.request("/admin/seo/paginas?lang=fr")).status).toBe(400);
  });

  test("página: nota item a item, fatos e visitas dos últimos 30 dias", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/pagina?path=/a");
    expect(res.status).toBe(200);
    const b = (await res.json()) as Record<string, any>;
    expect(b.page.path).toBe("/a");
    expect(b.checks[0].item).toBe("titulo");
    expect(b.facts.title).toContain("Título perfeito");
    expect(b.visits30d).toBe(120);
  });

  test("página sem auditoria devolve checks vazios e facts nulo; endereço inexistente devolve 404; sem endereço devolve 400", async () => {
    const { app } = appFor("super_admin");
    const en = (await (await app.request("/admin/seo/pagina?path=/en/a")).json()) as Record<string, any>;
    expect(en.checks).toEqual([]);
    expect(en.facts).toBeNull();
    expect((await app.request("/admin/seo/pagina?path=/nao-existe")).status).toBe(404);
    expect((await app.request("/admin/seo/pagina")).status).toBe(400);
    expect((await app.request("/admin/seo/pagina?path=https://evil.com/")).status).toBe(400);
  });
});

describe("salvar as regras de uma página", () => {
  test("grava o documento na chave da página, com o id de quem salvou", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/pagina", put({ path: "/b", doc: { title: "  Novo  ", noindex: true, canonical: "/a" } }));
    expect(res.status).toBe(200);
    expect(data.docs).toEqual([{ key: "b", doc: { title: "Novo", noindex: true, canonical: "https://www.demakine.com.br/a" }, userId: "u1" }]);
  });

  test("a chave de uma página em outro idioma leva o prefixo", async () => {
    await appFor("super_admin").app.request("/admin/seo/pagina", put({ path: "/en/a", doc: { noindex: true } }));
    expect(data.docs[0]!.key).toBe("en-a");
  });

  test("documento vazio também é enviado (a camada de dados apaga a linha)", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/pagina", put({ path: "/a", doc: {} }));
    expect(res.status).toBe(200);
    expect(data.docs).toEqual([{ key: "a", doc: {}, userId: "u1" }]);
  });

  test("recusa documento inválido com a mensagem, página que não existe e endereço que não é do site", async () => {
    const { app } = appFor("super_admin");
    const bad = await app.request("/admin/seo/pagina", put({ path: "/a", doc: { canonical: "https://outro.com" } }));
    expect(bad.status).toBe(400);
    expect(((await bad.json()) as { error: string }).error).toBe("O endereço canônico precisa ser do próprio site");
    expect((await app.request("/admin/seo/pagina", put({ path: "/nao-existe", doc: {} }))).status).toBe(404);
    for (const body of [{ path: "https://evil.com/", doc: {} }, { path: "/a" }, { path: "/a", doc: [] }, { path: "/a", doc: "x" }, { doc: {} }]) {
      expect((await app.request("/admin/seo/pagina", put(body))).status, JSON.stringify(body)).toBe(400);
    }
    expect(data.docs).toEqual([]);
  });

  test("o registro de alterações descreve a edição da página", async () => {
    process.env.DATABASE_URL ??= "postgres://teste:teste@localhost:5432/teste";
    const { describe: describeAudit, } = await import("../../src/api/lib/audit");
    expect(describeAudit("PUT", "/api/admin/seo/pagina", { path: "/a-empresa" })).toBe("Editou o SEO da página /a-empresa");
    const { affectsSite } = await import("../../src/api/lib/publish");
    expect(affectsSite("/api/admin/seo/pagina")).toBe(true);
    expect(affectsSite("/api/admin/seo/regras")).toBe(false);
  });
});

describe("imagens e dados estruturados", () => {
  test("imagens: problemas das páginas auditadas, com o produto quando é página de produto", async () => {
    const m = data.store as ReturnType<typeof memoryStore>;
    m.rows[0]!.facts = perfectFacts({ images: [{ src: "https://www.demakine.com.br/img/produtos/rosca/1.webp", alt: null }] });
    m.rows[0]!.path = "/produtos/rosca";
    const b = (await (await appFor("super_admin").app.request("/admin/seo/imagens")).json()) as { issues: { page: string; product?: string; problems: string[] }[] };
    expect(b.issues).toEqual([expect.objectContaining({ page: "/produtos/rosca", product: "rosca", problems: ["sem-alt", "nome-numerico"] })]);
  });

  test("salvar descrição de foto: valida e repassa; erros conhecidos viram 404", async () => {
    const { app } = appFor("super_admin");
    const ok = await app.request("/admin/seo/imagem-alt", put({ slug: "rosca", src: "https://www.demakine.com.br/img/produtos/rosca/1.webp", alt: "  Rosca Demakine  " }));
    expect(ok.status).toBe(200);
    expect(data.alts).toEqual([{ slug: "rosca", src: "https://www.demakine.com.br/img/produtos/rosca/1.webp", alt: "Rosca Demakine" }]);
    for (const body of [{ slug: "R OSCA", src: "/a.webp", alt: "x" }, { slug: "rosca", src: "", alt: "x" }, { slug: "rosca", src: "/a.webp", alt: "" }, { slug: "rosca", src: "/a.webp", alt: "x".repeat(151) }, {}]) {
      expect((await app.request("/admin/seo/imagem-alt", put(body))).status, JSON.stringify(body).slice(0, 40)).toBe(400);
    }
    data.setImageAlt = async () => {
      throw new Error("Foto não encontrada neste produto");
    };
    expect((await app.request("/admin/seo/imagem-alt", put({ slug: "rosca", src: "/a.webp", alt: "x" }))).status).toBe(404);
  });

  test("estruturados: o que cada página tem e o que falta", async () => {
    const m = data.store as ReturnType<typeof memoryStore>;
    m.rows[0]!.facts = perfectFacts({ jsonLd: [{ "@type": "BreadcrumbList", itemListElement: [{}] }] });
    m.rows[0]!.path = "/produtos/rosca";
    m.pages.push(sitePage("/produtos/rosca", { area: "produtos", label: "Rosca" }));
    const b = (await (await appFor("super_admin").app.request("/admin/seo/estruturados")).json()) as { pages: { path: string; label: string; findings: { type: string; level: string }[] }[] };
    const p = b.pages.find((x) => x.path === "/produtos/rosca")!;
    expect(p.label).toBe("Rosca");
    expect(p.findings.find((f) => f.type === "Product")?.level).toBe("faltando");
  });
});

describe("dicas do dia", () => {
  test("devolve a data e as dicas", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/dicas");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ date: "2026-11-12", tips: [{ id: "x" }] });
  });
});

describe("verificador de links", () => {
  test("sem verificação anterior o relatório é nulo; verificar devolve o relatório", async () => {
    const { app } = appFor("super_admin");
    expect(await (await app.request("/admin/seo/links")).json()).toEqual({ report: null });
    const res = await app.request("/admin/seo/links/verificar", json({}));
    expect(res.status).toBe(200);
    const b = (await res.json()) as { report: LinkReport };
    expect(b.report.broken[0]).toMatchObject({ status: 404, foundOn: ["/a"] });
    expect(data.verified).toBe(1);
  });

  test("sem auditoria completa devolve 409; erro inesperado vira 500 sem vazar o texto", async () => {
    data.links.verify = async () => {
      throw new Error("Rode a auditoria completa primeiro");
    };
    expect((await appFor("super_admin").app.request("/admin/seo/links/verificar", json({}))).status).toBe(409);
    data.links.verify = async () => {
      throw new Error("senha do banco: abc");
    };
    const original = console.error;
    console.error = () => undefined;
    try {
      const res = await appFor("super_admin").app.request("/admin/seo/links/verificar", json({}));
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("senha");
    } finally {
      console.error = original;
    }
  });
});

describe("importador de endereços antigos", () => {
  test("testar: lê a lista, rejeita o que não é do site e testa só os válidos", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/importar/testar", json({ text: "/produto/x/\nhttps://outro.com/y\n/produto/x" }));
    expect(res.status).toBe(200);
    const b = (await res.json()) as { valid: string[]; rejected: { raw: string; reason: string }[]; results: OldUrlResult[]; truncated: boolean };
    expect(b.valid).toEqual(["/produto/x"]);
    expect(b.rejected).toEqual([{ raw: "https://outro.com/y", reason: "fora do domínio" }]);
    expect(b.results).toHaveLength(1);
    expect(data.tested).toEqual([["/produto/x"]]);
    expect(b.truncated).toBe(false);
  });

  test("testar: no máximo 500 endereços por vez, avisando que cortou", async () => {
    const text = Array.from({ length: 600 }, (_, i) => `/p${i}`).join("\n");
    const b = (await (await appFor("super_admin").app.request("/admin/seo/importar/testar", json({ text }))).json()) as { truncated: boolean; results: unknown[] };
    expect(b.truncated).toBe(true);
    expect(b.results).toHaveLength(500);
    expect(data.tested[0]).toHaveLength(500);
  });

  test("testar: corpo inválido ou gigante devolve 400 e não testa nada", async () => {
    const { app } = appFor("super_admin");
    for (const body of [{}, { text: 5 }, { text: "x".repeat(300_000) }]) {
      expect((await app.request("/admin/seo/importar/testar", json(body))).status).toBe(400);
    }
    expect(data.tested).toEqual([]);
  });

  test("criar: manda os itens com o id de quem criou", async () => {
    const items = [{ from: "/a", to: "/b" }];
    const res = await appFor("super_admin").app.request("/admin/seo/importar/criar", json({ items }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ created: 1, skipped: [] });
    expect(data.created).toEqual([{ items, userId: "u1" }]);
  });

  test("criar: itens malformados ou mais de 500 devolvem 400", async () => {
    const { app } = appFor("super_admin");
    for (const body of [{}, { items: "x" }, { items: [{ from: 1, to: "/b" }] }, { items: [{ from: "/a" }] }, { items: Array.from({ length: 501 }, (_, i) => ({ from: `/p${i}`, to: "/x" })) }]) {
      expect((await app.request("/admin/seo/importar/criar", json(body))).status, JSON.stringify(body).slice(0, 40)).toBe(400);
    }
    expect(data.created).toEqual([]);
  });

  test("o registro de alterações descreve cada ação", async () => {
    process.env.DATABASE_URL ??= "postgres://teste:teste@localhost:5432/teste";
    const { describe: describeAudit } = await import("../../src/api/lib/audit");
    expect(describeAudit("POST", "/api/admin/seo/links/verificar", {})).toBe("Verificou os links do site");
    expect(describeAudit("POST", "/api/admin/seo/importar/testar", {})).toBe("Testou uma lista de endereços antigos");
    expect(describeAudit("POST", "/api/admin/seo/importar/criar", { items: [{}, {}] })).toBe("Criou 2 redirecionamentos pelo importador de endereços antigos");
  });
});

describe("auditar agora", () => {
  test("sem corpo começa ou continua a execução completa", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/auditar", json({}));
    expect(res.status).toBe(200);
    expect(data.audits).toEqual([expect.objectContaining({ kind: "manual" })]);
    expect(data.audits[0]!.paths).toBeUndefined();
    expect(await res.json()).toEqual({ runId: 1, status: "completa", audited: 3, total: 3 });
  });

  test("com path audita só aquela página", async () => {
    const res = await appFor("super_admin").app.request("/admin/seo/auditar", json({ path: "/a" }));
    expect(res.status).toBe(200);
    expect(data.audits[0]!.paths).toEqual(["/a"]);
  });

  test("path inválido (não começa com /, não é texto, gigante) devolve 400 e não audita", async () => {
    const { app } = appFor("super_admin");
    for (const body of [{ path: "a" }, { path: 5 }, { path: "https://evil.com/" }, { path: "/" + "x".repeat(400) }]) {
      expect((await app.request("/admin/seo/auditar", json(body))).status, JSON.stringify(body).slice(0, 40)).toBe(400);
    }
    expect(data.audits).toEqual([]);
  });

  test("erros conhecidos do auditor viram 409 e 404 com a mensagem", async () => {
    data.audit = async () => {
      throw new Error("Rode a auditoria completa primeiro");
    };
    const a = await appFor("super_admin").app.request("/admin/seo/auditar", json({ path: "/a" }));
    expect(a.status).toBe(409);
    expect(((await a.json()) as { error: string }).error).toBe("Rode a auditoria completa primeiro");
    data.audit = async () => {
      throw new Error("Página não encontrada");
    };
    expect((await appFor("super_admin").app.request("/admin/seo/auditar", json({ path: "/zzz" }))).status).toBe(404);
  });

  test("erro inesperado vira 500 genérico, sem vazar o texto interno", async () => {
    data.audit = async () => {
      throw new Error("connection string postgres://secreto");
    };
    const original = console.error;
    console.error = () => undefined; // o servidor registra o erro de propósito; o teste só confere o que o usuário vê
    try {
      const res = await appFor("super_admin").app.request("/admin/seo/auditar", json({}));
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("secreto");
    } finally {
      console.error = original;
    }
  });
});

describe("registro de alterações", () => {
  test("as alterações de SEO têm descrição legível no registro", async () => {
    // audit.ts importa o banco no topo: o cliente é preguiçoso (não conecta), mas precisa de uma URL para existir
    process.env.DATABASE_URL ??= "postgres://teste:teste@localhost:5432/teste";
    const { describe: describeAudit } = await import("../../src/api/lib/audit");
    expect(describeAudit("PUT", "/api/admin/seo/regras", {})).toBe("Alterou as regras da nota de SEO");
    expect(describeAudit("DELETE", "/api/admin/seo/regras", {})).toBe("Voltou as regras da nota de SEO ao padrão");
    expect(describeAudit("POST", "/api/admin/seo/auditar", {})).toBe("Rodou a auditoria de SEO");
    expect(describeAudit("POST", "/api/admin/seo/auditar", { path: "/a-empresa" })).toBe("Rodou a auditoria de SEO da página /a-empresa");
  });
});

describe("fiação", () => {
  test("index.ts monta as rotas de SEO com o banco de verdade", async () => {
    const src = await Bun.file(new URL("../../src/api/index.ts", import.meta.url)).text();
    expect(src).toContain('import { createSeoRoutes } from "./seo-routes"');
    expect(src).toContain('import { dbSeoData } from "./lib/seo/data"');
    expect(src).toContain(".route('/', createSeoRoutes({ data: dbSeoData }))");
  });

  test("vercel.json tem o cron diário às 10h UTC (07h de Brasília) e a função aguenta 60 s", async () => {
    const v = (await Bun.file(new URL("../../vercel.json", import.meta.url)).json()) as { crons: { path: string; schedule: string }[]; functions?: Record<string, { maxDuration?: number }> };
    expect(v.crons).toContainEqual({ path: "/api/cron/seo", schedule: "0 10 * * *" });
    expect(v.crons).toContainEqual({ path: "/api/cron/diario", schedule: "0 11 * * *" }); // o antigo continua
    expect(v.functions?.["api/index.ts"]?.maxDuration).toBeGreaterThanOrEqual(60);
  });
});
