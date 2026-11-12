import { describe, expect, test } from "bun:test";
import { actionsFor } from "../../src/api/lib/seo/duel-actions";
import type { Verdict } from "../../src/api/lib/seo/duel-metrics";
import type { Check } from "../../src/api/lib/seo/score";

const v = (metric: Verdict["metric"], ours: number, theirs: number, unit: Verdict["unit"] = "pontos"): Verdict => {
  const diff = ours - theirs;
  return { metric, ours, theirs, diff, result: Math.abs(diff) <= 3 ? "empate" : diff > 0 ? "melhor" : "pior", unit };
};
const chk = (item: Check["item"], points: number, max = 10, ok = points >= max): Check => ({ item, points, max, ok, message: "m", fix: "f" });
const pages = [
  { path: "/a", label: "A", checks: [chk("imagens", 2), chk("titulo", 15, 15)] },
  { path: "/b", label: "B", checks: [chk("imagens", 9, 10, false), chk("titulo", 3, 15, false)] },
  { path: "/c", label: "C", checks: [chk("imagens", 10), chk("titulo", 15, 15)] },
];

describe("actionsFor", () => {
  test("perder em imagens gera ação de esforço baixo apontando as páginas piores, e cita o concorrente", () => {
    const a = actionsFor({ "Rival SA": [v("imagens", 60, 80)] }, pages);
    expect(a).toHaveLength(1);
    expect(a[0]).toMatchObject({ metric: "imagens", competitor: "Rival SA", gap: 20, effort: "baixo" });
    expect(a[0]!.pages.map((p) => p.path)).toEqual(["/a", "/b"]);
    expect(a[0]!.title + a[0]!.how).toContain("Rival SA");
  });

  test("tamanho e blog são esforço alto e não apontam página", () => {
    const a = actionsFor({ R: [v("tamanho", 100, 200, "paginas"), v("blog", 1, 10, "posts")] }, pages);
    expect(a.map((x) => x.effort)).toEqual(["alto", "alto"]);
    expect(a.every((x) => x.pages.length === 0)).toBe(true);
    expect(a.find((x) => x.metric === "tamanho")!.gap).toBe(50);
  });

  test("onde ganhamos ou empatamos não gera ação", () => {
    expect(actionsFor({ R: [v("titulo", 90, 50), v("h1", 50, 49)] }, pages)).toEqual([]);
  });

  test("ordena pela diferença e, no empate, pelo esforço", () => {
    const a = actionsFor({ R: [v("conteudo", 40, 60), v("imagens", 40, 60), v("titulo", 10, 80)] }, pages);
    expect(a.map((x) => x.metric)).toEqual(["titulo", "imagens", "conteudo"]);
  });

  test("com 2 concorrentes a métrica aparece uma vez, citando o que ganha por mais", () => {
    const a = actionsFor({ Pequeno: [v("imagens", 70, 75)], Grande: [v("imagens", 70, 95)] }, pages);
    expect(a).toHaveLength(1);
    expect(a[0]).toMatchObject({ competitor: "Grande", gap: 25 });
  });

  test("nenhum texto tem travessão", () => {
    const all = actionsFor({ R: (["titulo", "descricao", "h1", "conteudo", "imagens", "schema", "idiomas", "compartilhamento"] as const).map((m) => v(m, 10, 90)).concat([v("tamanho", 1, 9, "paginas"), v("blog", 0, 5, "posts")]) }, pages);
    expect(all).toHaveLength(10);
    for (const x of all) expect(x.title + x.how, x.metric).not.toMatch(/[—–]/);
  });
});
