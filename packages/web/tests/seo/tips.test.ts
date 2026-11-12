import { describe, expect, test } from "bun:test";
import { TIP_LIBRARY, type Tip } from "../../src/api/lib/seo/tips-library";
import { pickDailyTips, tipsFromIssues, type TipsState } from "../../src/api/lib/seo/tips";
import { SEO_GEO_TABS } from "../../src/web/admin/seo-geo/tabs";

const issueTips = (n: number): Tip[] =>
  tipsFromIssues(Array.from({ length: n }, (_, i) => ({ path: `/p${i}`, code: "titulo", severity: "critico" as const, message: "A página está sem título", fix: "Escreva um título" })), new Map(Array.from({ length: n }, (_, i) => [`/p${i}`, { label: `Página ${i}` }])));

describe("biblioteca", () => {
  test("tem pelo menos 60 dicas, ids únicos, sem travessão, com aba que existe", () => {
    expect(TIP_LIBRARY.length).toBeGreaterThanOrEqual(60);
    expect(new Set(TIP_LIBRARY.map((t) => t.id)).size).toBe(TIP_LIBRARY.length);
    const tabs = new Set<string>(SEO_GEO_TABS.map((t) => t.id));
    for (const t of TIP_LIBRARY) {
      expect(t.kind).toBe("biblioteca");
      expect(t.title.length).toBeGreaterThan(5);
      expect(t.body.length).toBeGreaterThan(20);
      expect(t.body + t.title, t.id).not.toMatch(/[—–]/);
      expect(tabs.has(t.tab), `${t.id} -> ${t.tab}`).toBe(true);
    }
  });
});

describe("tipsFromIssues", () => {
  test("uma dica por problema, citando o nome da página", () => {
    const t = issueTips(2);
    expect(t).toHaveLength(2);
    expect(t[0]).toMatchObject({ id: "dado:titulo:/p0", kind: "dado" });
    expect(t[0]!.body).toContain("Página 0");
    expect(t[0]!.body).toContain("Escreva um título");
  });

  test("imagens e dados estruturados levam para a aba certa", () => {
    const [a, b, c] = tipsFromIssues(
      [{ path: "/a", code: "imagens", severity: "atencao", message: "m" }, { path: "/a", code: "schema", severity: "atencao", message: "m" }, { path: "/a", code: "h1", severity: "atencao", message: "m" }],
      new Map([["/a", { label: "A" }]]),
    );
    expect([a!.tab, b!.tab, c!.tab]).toEqual(["imagens", "dados-estruturados", "melhorar"]);
  });
});

describe("pickDailyTips", () => {
  test("devolve 15, no máximo 8 de problemas reais, o resto da biblioteca", () => {
    const { tips } = pickDailyTips(null, "2026-11-12", TIP_LIBRARY, issueTips(20));
    expect(tips).toHaveLength(15);
    expect(tips.filter((t) => t.kind === "dado")).toHaveLength(8);
    expect(new Set(tips.map((t) => t.id)).size).toBe(15);
  });

  test("sem problemas reais, as 15 vêm da biblioteca", () => {
    const { tips } = pickDailyTips(null, "2026-11-12", TIP_LIBRARY, []);
    expect(tips).toHaveLength(15);
    expect(tips.every((t) => t.kind === "biblioteca")).toBe(true);
  });

  test("o mesmo dia devolve as mesmas dicas, mesmo chamando de novo", () => {
    const a = pickDailyTips(null, "2026-11-12", TIP_LIBRARY, issueTips(10));
    const b = pickDailyTips(a.state, "2026-11-12", TIP_LIBRARY, issueTips(10));
    expect(b.tips.map((t) => t.id)).toEqual(a.tips.map((t) => t.id));
    expect(b.state).toEqual(a.state);
  });

  test("um dia novo devolve 15 dicas diferentes das do dia anterior", () => {
    const a = pickDailyTips(null, "2026-11-12", TIP_LIBRARY, issueTips(10));
    const b = pickDailyTips(a.state, "2026-11-13", TIP_LIBRARY, issueTips(10));
    expect(b.tips).toHaveLength(15);
    const prev = new Set(a.tips.map((t) => t.id));
    expect(b.tips.filter((t) => prev.has(t.id))).toEqual([]);
  });

  test("a biblioteca não repete enquanto houver dica não vista; esgotada, o ciclo recomeça sem erro", () => {
    let state: TipsState | null = null;
    const shown: string[] = [];
    for (let day = 0; day < 4; day++) {
      const r = pickDailyTips(state, `2026-11-${10 + day}`, TIP_LIBRARY, []);
      shown.push(...r.tips.map((t) => t.id));
      state = r.state;
    }
    expect(new Set(shown).size).toBe(shown.length); // 4 dias x 15 = 60, nenhuma repetida
    const next = pickDailyTips(state, "2026-11-20", TIP_LIBRARY, []);
    expect(next.tips).toHaveLength(15);
  });

  test("biblioteca pequena demais não quebra", () => {
    const small = TIP_LIBRARY.slice(0, 5);
    expect(pickDailyTips(null, "2026-11-12", small, []).tips).toHaveLength(5);
  });
});
