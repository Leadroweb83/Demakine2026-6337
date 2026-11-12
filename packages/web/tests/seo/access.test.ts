import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { allowed, type Area } from "../../src/web/admin/access";
import { SEO_GEO_TABS } from "../../src/web/admin/seo-geo/tabs";
import { SeoGeo } from "../../src/web/admin/seo-geo";

const ROLES = ["super_admin", "admin", "editor", "vendedor", "rh"] as const;
const AREAS: Area[] = ["livre", "config", "leads", "conteudo", "loja", "vagas", "usuarios", "seo-geo"];

/** O que cada papel enxerga: a tabela do painel antes de existir a área SEO e GEO, mais a nova. */
const TABLE: Record<string, Area[]> = {
  super_admin: AREAS,
  admin: ["livre", "config", "leads", "conteudo", "loja", "vagas"],
  editor: ["livre", "conteudo", "vagas"],
  vendedor: ["livre", "leads"],
  rh: ["livre", "vagas"],
};

describe("allowed", () => {
  for (const role of ROLES) {
    test(`${role} enxerga exatamente as áreas esperadas`, () => {
      expect(AREAS.filter((a) => allowed(role, a))).toEqual(AREAS.filter((a) => TABLE[role]!.includes(a)));
    });
  }

  test("SEO e GEO é só do super_admin", () => {
    expect(allowed("super_admin", "seo-geo")).toBe(true);
    for (const role of ["admin", "editor", "vendedor", "rh", "", "qualquer", "SUPER_ADMIN"]) expect(allowed(role, "seo-geo"), role).toBe(false);
  });

  test("área livre vale para todos; papel desconhecido não entra em área restrita", () => {
    expect(allowed("qualquer", "livre")).toBe(true);
    for (const a of AREAS.filter((x) => x !== "livre")) expect(allowed("qualquer", a), a).toBe(false);
  });

  test("o admin continua sem acesso a usuários, o editor a conteúdo e vagas, o rh só a vagas", () => {
    expect(allowed("admin", "usuarios")).toBe(false);
    expect(allowed("editor", "conteudo") && allowed("editor", "vagas")).toBe(true);
    expect(allowed("rh", "vagas") && !allowed("rh", "conteudo")).toBe(true);
  });
});

describe("abas da área SEO e GEO", () => {
  test("são nove, na ordem combinada, com ids únicos", () => {
    expect(SEO_GEO_TABS.map((t) => t.label)).toEqual(["Visão geral", "Páginas", "O que melhorar", "Regras", "Links", "Endereços antigos", "Imagens", "Dados estruturados", "Dicas"]);
    expect(SEO_GEO_TABS.map((t) => t.id)).toEqual(["visao-geral", "paginas", "melhorar", "regras", "links", "enderecos-antigos", "imagens", "dados-estruturados", "dicas"]);
    expect(new Set(SEO_GEO_TABS.map((t) => t.id)).size).toBe(SEO_GEO_TABS.length);
  });

  test("a casca desenha o título e todas as abas, com a primeira selecionada", () => {
    const html = renderToString(createElement(QueryClientProvider, { client: new QueryClient() }, createElement(SeoGeo)));
    expect(html).toContain("SEO e GEO");
    for (const t of SEO_GEO_TABS) expect(html, t.label).toContain(t.label);
    expect(html).toContain('role="tablist"');
    expect((html.match(/role="tab"/g) ?? []).length).toBe(9);
    expect(html).toMatch(/<button[^>]*aria-selected="true"[^>]*>Visão geral<\/button>/);
    expect((html.match(/aria-selected="true"/g) ?? []).length).toBe(1);
  });
});

describe("menu do painel", () => {
  const src = () => Bun.file(new URL("../../src/web/pages/admin.tsx", import.meta.url)).text();

  test("o item SEO e GEO vem logo abaixo de SEO das páginas", async () => {
    const s = await src();
    const seo = s.indexOf('{ id: "seo", label: "SEO das páginas"');
    const geo = s.indexOf('{ id: "seo-geo", label: "SEO e GEO", Icon: Radar, area: "seo-geo" }');
    expect(seo).toBeGreaterThan(0);
    expect(geo).toBeGreaterThan(seo);
    expect(s.slice(seo, geo).split("\n").length).toBeLessThanOrEqual(2); // a linha seguinte
  });

  test("admin.tsx usa o allowed de access.ts e não guarda uma cópia", async () => {
    const s = await src();
    expect(s).toContain('import { allowed, type Area } from "../admin/access"');
    expect(s).not.toContain("function allowed(");
    expect(s).toContain('{current === "seo-geo" && <SeoGeo />}');
  });
});
