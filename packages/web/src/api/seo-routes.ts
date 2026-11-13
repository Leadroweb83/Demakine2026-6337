/**
 * Rotas do painel "SEO e GEO" e o cron diário do auditor. TODAS as /admin/seo/* exigem requireRole() sem argumentos
 * (só o super_admin). Os dados entram por SeoData, para os testes usarem uma versão em memória; index.ts monta com o
 * banco de verdade (lib/seo/data.ts).
 */
import { timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { requireRole, type SessionUser } from "./middleware/roles";
import { SeoDocError, toSeoDoc } from "../web/lib/seo-overrides";
import { seoKey } from "../web/lib/seo-pages";
import type { Issue } from "./lib/seo/issues";
import type { LinkReport } from "./lib/seo/links";
import type { Tip } from "./lib/seo/tips-library";
import { assertPublicUrl } from "./lib/seo/crawl-external";
import type { DuelResult } from "./lib/seo/run-duel";
import { imageIssues } from "./lib/seo/images";
import { checkSchema } from "./lib/seo/schema-check";
import { expectedSchema } from "./lib/seo/pages";
import { parseOldUrls, type OldUrlResult } from "./lib/seo/import-old";
import type { SiteArea } from "./lib/seo/types";
import type { AuditOptions, AuditResult, AuditStore } from "./lib/seo/run-audit";
import { DEFAULT_RULES, validateRules, type SeoRules } from "./lib/seo/rules";

export interface SeoData {
  store: AuditStore;
  /** nota do site por dia (a última execução completa de cada dia), mais antigo primeiro */
  history(days: number): Promise<{ date: string; site: number }[]>;
  /** auditorias e alterações de SEO dos últimos dias, mais novo primeiro */
  timeline(days: number): Promise<{ at: string; text: string }[]>;
  visits(path: string, days: number): Promise<number>;
  /** grava o documento de SEO de uma página (coleção "seo"); documento vazio apaga a linha */
  savePageDoc(key: string, doc: Record<string, unknown>, userId: string): Promise<void>;
  saveRules(rules: SeoRules, userId: string): Promise<void>;
  duel: {
    competitors(): Promise<{ id: number; name: string; url: string }[]>;
    /** troca a lista de concorrentes (já validada) */
    save(items: { name: string; url: string }[]): Promise<void>;
    latest(): Promise<DuelResult | null>;
    running(): Promise<{ done: number; total: number } | null>;
    run(opts: { budgetMs: number }): Promise<{ duelId: number; status: "completa" | "parcial"; done: number; total: number }>;
  };
  /** as 15 dicas do dia (escolhe e guarda se o dia mudou) */
  tips: { today(): Promise<{ date: string; tips: Tip[] }> };
  /** grava a descrição (alt) de uma foto de produto no documento do produto */
  setImageAlt(slug: string, src: string, alt: string, userId: string): Promise<void>;
  links: { latest(): Promise<LinkReport | null>; verify(): Promise<LinkReport> };
  importOld: {
    test(paths: string[]): Promise<OldUrlResult[]>;
    create(items: { from: string; to: string }[], userId: string): Promise<{ created: number; skipped: { from: string; reason: string }[] }>;
  };
  resetRules(): Promise<void>;
  audit(opts: AuditOptions): Promise<AuditResult>;
  /** roda quando uma auditoria DIÁRIA fecha (escolhe as dicas do dia) */
  onAuditClosed?(result: AuditResult): Promise<void>;
}

type Env = { Variables: { user: SessionUser | null; session: unknown } };

const AREAS: SiteArea[] = ["produtos", "categorias", "comerciais", "blog", "cases", "segmentos", "vagas", "exportacao", "institucional", "tecnica"];
const LANGS = ["pt", "en", "es"];
/** limite de tempo da função da Vercel é 60 s (vercel.json); sobra margem para fechar a execução */
const BUDGET_MS = 45_000;
const RESUME_WINDOW_MS = 30 * 60_000;

/** Caminho de página do site: começa com "/", sem espaço, consulta nem #, tamanho razoável. */
const isSitePath = (v: unknown): v is string => typeof v === "string" && v.length <= 300 && /^\/(?!\/)[^\s?#]*$/.test(v);

export function createSeoRoutes(deps: { data: SeoData; cronSecret?: () => string | undefined; resolve?: (host: string) => Promise<string[]> }) {
  const { data } = deps;
  const guard = requireRole();

  return new Hono<Env>()
    .get("/admin/seo/resumo", guard, async (c) => {
      const store = data.store;
      const latest = await store.latestCompleteRun();
      const rows = latest ? await store.loadRunPages(latest.id) : [];
      const fixes = new Map<string, string>();
      for (const r of rows) for (const ch of r.checks) fixes.set(`${r.path}\u0000${ch.code ?? ch.item}`, ch.fix);
      const open: Issue[] = await store.openIssues();
      const live = await store.findResumable(new Date(Date.now() - RESUME_WINDOW_MS));
      return c.json(
        {
          latest,
          running: live ? { audited: live.pagesAudited, total: live.pagesTotal } : null,
          history: await data.history(30),
          byArea: latest?.areaScores ?? {},
          bySector: latest?.sectorScores ?? {},
          issues: open.map((i) => ({ ...i, fix: fixes.get(`${i.path}\u0000${i.code}`) ?? "" })),
          alerts: latest?.alerts ?? [],
          timeline: await data.timeline(30),
        },
        200,
      );
    })

    .get("/admin/seo/paginas", guard, async (c) => {
      const area = c.req.query("area");
      const lang = c.req.query("lang");
      const q = (c.req.query("q") ?? "").trim().toLowerCase().slice(0, 100);
      if (area && !AREAS.includes(area as SiteArea)) return c.json({ error: "Área inválida" }, 400);
      if (lang && !LANGS.includes(lang)) return c.json({ error: "Idioma inválido" }, 400);
      const store = data.store;
      const latest = await store.latestCompleteRun();
      const scores = new Map((latest ? await store.loadRunPages(latest.id) : []).map((r) => [r.path, r.seoScore]));
      const pages = (await store.loadPages())
        .filter((p) => (!area || p.area === area) && (!lang || p.lang === lang) && (!q || p.path.toLowerCase().includes(q) || p.label.toLowerCase().includes(q)))
        .sort((a, b) => a.path.localeCompare(b.path))
        .map((p) => ({ ...p, seoScore: scores.get(p.path) ?? null, audited: scores.has(p.path) }));
      return c.json({ pages }, 200);
    })

    .get("/admin/seo/pagina", guard, async (c) => {
      const path = c.req.query("path");
      if (!isSitePath(path)) return c.json({ error: "Endereço inválido" }, 400);
      const store = data.store;
      const page = (await store.loadPages()).find((p) => p.path === path);
      if (!page) return c.json({ error: "Página não encontrada" }, 404);
      const latest = await store.latestCompleteRun();
      const row = latest ? (await store.loadRunPages(latest.id)).find((r) => r.path === path) : undefined;
      return c.json({ page, checks: row?.checks ?? [], facts: row?.facts ?? null, visits30d: await data.visits(path, 30) }, 200);
    })

    .put(
      "/admin/seo/pagina",
      guard,
      validator("json", (v, c) => {
        const b = v as { path?: unknown; doc?: unknown } | null;
        if (!isSitePath(b?.path)) return c.json({ error: "Endereço inválido" }, 400);
        if (typeof b?.doc !== "object" || b.doc === null || Array.isArray(b.doc)) return c.json({ error: "Documento inválido" }, 400);
        return { path: b.path, doc: b.doc as Record<string, unknown> };
      }),
      async (c) => {
        const { path, doc } = c.req.valid("json");
        let clean: Record<string, unknown>;
        try {
          clean = toSeoDoc(doc);
        } catch (err) {
          if (err instanceof SeoDocError) return c.json({ error: err.message }, 400);
          throw err;
        }
        // só páginas que existem no site: a chave do documento sai do endereço
        if (!(await data.store.loadPages()).some((p) => p.path === path)) return c.json({ error: "Página não encontrada" }, 404);
        await data.savePageDoc(seoKey(path), clean, (c.get("user") as SessionUser).id);
        return c.json({ ok: true, doc: clean }, 200);
      },
    )

    .post(
      "/admin/seo/auditar",
      guard,
      validator("json", (v, c) => {
        const path = (v as { path?: unknown } | null)?.path;
        if (path !== undefined && !isSitePath(path)) return c.json({ error: "Endereço inválido" }, 400);
        return { path } as { path?: string };
      }),
      async (c) => {
        const { path } = c.req.valid("json");
        try {
          return c.json(await data.audit({ kind: "manual", budgetMs: BUDGET_MS, ...(path ? { paths: [path] } : {}) }), 200);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (msg === "Rode a auditoria completa primeiro") return c.json({ error: msg }, 409);
          if (msg === "Página não encontrada") return c.json({ error: msg }, 404);
          console.error("[seo] auditoria falhou", err);
          return c.json({ error: "Não foi possível auditar agora. Tente de novo em instantes." }, 500);
        }
      },
    )

    .get("/admin/seo/imagens", guard, async (c) => {
      const store = data.store;
      const latest = await store.latestCompleteRun();
      const rows = latest ? (await store.loadRunPages(latest.id)).filter((r) => r.facts) : [];
      const issues = imageIssues(rows.map((r) => ({ path: r.path, images: r.facts!.images })), new Map()).map((i) => {
        const m = /^\/produtos\/([a-z0-9-]+)$/.exec(i.page);
        return { ...i, ...(m ? { product: m[1] } : {}) };
      });
      return c.json({ issues }, 200);
    })

    .put(
      "/admin/seo/imagem-alt",
      guard,
      validator("json", (v, c) => {
        const b = v as { slug?: unknown; src?: unknown; alt?: unknown } | null;
        const alt = typeof b?.alt === "string" ? b.alt.trim() : "";
        const ok = typeof b?.slug === "string" && /^[a-z0-9-]{1,100}$/.test(b.slug) && typeof b.src === "string" && b.src.length > 0 && b.src.length <= 500 && alt.length > 0 && alt.length <= 150;
        if (!ok) return c.json({ error: "Dados inválidos: a descrição vai de 1 a 150 caracteres" }, 400);
        return { slug: b!.slug as string, src: b!.src as string, alt };
      }),
      async (c) => {
        const { slug, src, alt } = c.req.valid("json");
        try {
          await data.setImageAlt(slug, src, alt, (c.get("user") as SessionUser).id);
          return c.json({ ok: true }, 200);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (msg === "Foto não encontrada neste produto" || msg === "Produto não encontrado") return c.json({ error: msg }, 404);
          console.error("[seo] salvar alt falhou", err);
          return c.json({ error: "Não foi possível salvar a descrição agora." }, 500);
        }
      },
    )

    .get("/admin/seo/estruturados", guard, async (c) => {
      const store = data.store;
      const latest = await store.latestCompleteRun();
      const labels = new Map((await store.loadPages()).map((p) => [p.path, p.label]));
      const rows = latest ? (await store.loadRunPages(latest.id)).filter((r) => r.facts) : [];
      const pages = rows
        .map((r) => ({ path: r.path, label: labels.get(r.path) ?? r.path, findings: checkSchema(r.facts!.jsonLd, expectedSchema(r.path)) }))
        .sort((a, b) => a.path.localeCompare(b.path));
      return c.json({ pages }, 200);
    })

    .get("/admin/seo/concorrentes", guard, async (c) => {
      const competitors = await data.duel.competitors();
      const latest = await data.duel.latest();
      // o último duelo só vale para os concorrentes de hoje (trocou um, o duelo dele sai)
      const current = new Set(competitors.map((x) => x.url));
      const valid = latest && latest.sites.length > 0 && latest.sites.every((s) => current.has(s.url)) ? latest : null;
      return c.json({ competitors, latest: valid, running: await data.duel.running() }, 200);
    })

    .put(
      "/admin/seo/concorrentes",
      guard,
      validator("json", (v, c) => {
        const items = (v as { items?: unknown } | null)?.items;
        const ok = Array.isArray(items) && items.length <= 2 && items.every((i) => typeof i?.name === "string" && typeof i?.url === "string");
        if (!ok) return c.json({ error: "Informe até 2 concorrentes, cada um com nome e endereço" }, 400);
        return { items: (items as { name: string; url: string }[]).map((i) => ({ name: i.name.trim(), url: i.url.trim() })) };
      }),
      async (c) => {
        const { items } = c.req.valid("json");
        const clean: { name: string; url: string }[] = [];
        for (const i of items) {
          if (!i.name || i.name.length > 60) return c.json({ error: "O nome do concorrente precisa ter de 1 a 60 caracteres" }, 400);
          try {
            const u = await assertPublicUrl(i.url, deps.resolve);
            clean.push({ name: i.name, url: u.origin });
          } catch {
            return c.json({ error: `Endereço não permitido: use o site público do concorrente, em https (${i.name})` }, 400);
          }
        }
        if (new Set(clean.map((x) => x.url.replace("://www.", "://"))).size !== clean.length) return c.json({ error: "Os dois concorrentes são o mesmo site" }, 400);
        await data.duel.save(clean);
        return c.json({ ok: true, competitors: clean }, 200);
      },
    )

    .post("/admin/seo/duelar", guard, async (c) => {
      try {
        return c.json(await data.duel.run({ budgetMs: BUDGET_MS }), 200);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "Cadastre um concorrente primeiro" || msg === "Rode a auditoria completa primeiro") return c.json({ error: msg }, 409);
        console.error("[seo] duelo falhou", err);
        return c.json({ error: "Não foi possível rodar o duelo agora. Tente de novo em instantes." }, 500);
      }
    })

    .get("/admin/seo/dicas", guard, async (c) => c.json(await data.tips.today(), 200))

    .get("/admin/seo/links", guard, async (c) => c.json({ report: await data.links.latest() }, 200))

    .post("/admin/seo/links/verificar", guard, async (c) => {
      try {
        return c.json({ report: await data.links.verify() }, 200);
      } catch (err) {
        if (err instanceof Error && err.message === "Rode a auditoria completa primeiro") return c.json({ error: err.message }, 409);
        console.error("[seo] verificação de links falhou", err);
        return c.json({ error: "Não foi possível verificar os links agora. Tente de novo em instantes." }, 500);
      }
    })

    .post(
      "/admin/seo/importar/testar",
      guard,
      validator("json", (v, c) => {
        const text = (v as { text?: unknown } | null)?.text;
        if (typeof text !== "string" || text.length > 200_000) return c.json({ error: "Lista inválida ou grande demais" }, 400);
        return { text };
      }),
      async (c) => {
        const { valid, rejected } = parseOldUrls(c.req.valid("json").text);
        const paths = valid.slice(0, 500);
        const results = paths.length ? await data.importOld.test(paths) : [];
        return c.json({ valid, rejected, results, truncated: valid.length > 500 }, 200);
      },
    )

    .post(
      "/admin/seo/importar/criar",
      guard,
      validator("json", (v, c) => {
        const items = (v as { items?: unknown } | null)?.items;
        const ok = Array.isArray(items) && items.length <= 500 && items.every((i) => typeof i?.from === "string" && typeof i?.to === "string");
        if (!ok) return c.json({ error: "Lista de redirecionamentos inválida (até 500 itens)" }, 400);
        return { items: (items as { from: string; to: string }[]).map((i) => ({ from: i.from, to: i.to })) };
      }),
      async (c) => c.json(await data.importOld.create(c.req.valid("json").items, (c.get("user") as SessionUser).id), 200),
    )

    .get("/admin/seo/regras", guard, async (c) => c.json({ rules: await data.store.loadRules(), defaults: DEFAULT_RULES }, 200))

    .put(
      "/admin/seo/regras",
      guard,
      validator("json", (v) => v as unknown),
      async (c) => {
        const parsed = validateRules(c.req.valid("json"));
        if (!parsed.ok) return c.json({ error: parsed.errors[0]!, errors: parsed.errors }, 400);
        await data.saveRules(parsed.rules, (c.get("user") as SessionUser).id);
        return c.json({ rules: parsed.rules }, 200);
      },
    )

    .delete("/admin/seo/regras", guard, async (c) => {
      await data.resetRules();
      return c.json({ rules: DEFAULT_RULES }, 200);
    })

    // ---- duelo semanal com concorrentes (segunda, 08h de Brasília)
    .get("/cron/seo-duelo", async (c) => {
      const secret = (deps.cronSecret ?? (() => process.env.CRON_SECRET))();
      const sent = Buffer.from(c.req.header("authorization") ?? "");
      const want = Buffer.from(`Bearer ${secret ?? ""}`);
      if (!secret || sent.length !== want.length || !timingSafeEqual(sent, want)) return c.json({ error: "Não autorizado" }, 401);
      try {
        return c.json({ ok: true, ...(await data.duel.run({ budgetMs: BUDGET_MS })) }, 200);
      } catch (err) {
        console.error("[seo] duelo semanal falhou", err);
        return c.json({ error: "Falha no duelo semanal" }, 500);
      }
    })

    // ---- auditoria diária (Vercel Cron, 07h de Brasília): protegida pelo mesmo CRON_SECRET do /cron/diario
    .get("/cron/seo", async (c) => {
      const secret = (deps.cronSecret ?? (() => process.env.CRON_SECRET))();
      const sent = Buffer.from(c.req.header("authorization") ?? "");
      const want = Buffer.from(`Bearer ${secret ?? ""}`);
      if (!secret || sent.length !== want.length || !timingSafeEqual(sent, want)) return c.json({ error: "Não autorizado" }, 401);
      try {
        const result = await data.audit({ kind: "diaria", budgetMs: BUDGET_MS });
        if (result.status === "completa") await data.onAuditClosed?.(result);
        return c.json({ ok: true, ...result }, 200);
      } catch (err) {
        console.error("[seo] auditoria diária falhou", err);
        return c.json({ error: "Falha na auditoria diária" }, 500);
      }
    });
}

export type SeoRoutes = ReturnType<typeof createSeoRoutes>;
