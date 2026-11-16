import { describe, expect, test } from "bun:test";
import { applyFixes, undoBatch, validateItem, type BatchItem } from "../../src/api/lib/seo/fix-apply";
import type { FixItem, FixKind } from "../../src/api/lib/seo/fix-rules";
import { memory } from "./helpers/fix-fakes";

const item = (over: Partial<FixItem> = {}): FixItem => ({ id: "titulo:/a:", kind: "titulo", path: "/a", label: "A", field: "title", before: "Antigo", after: "Novo título da página A", ...over });

const known = new Set(["/a", "/b", "/produtos/p"]);
const deps = (m: ReturnType<typeof memory>, metric: FixKind = "titulo") => ({ store: m.store, writers: m.writers, userId: "u1", metric, knownPaths: known });

describe("validateItem", () => {
  test("aceita um item correto de cada tipo", () => {
    expect(validateItem(item())).toBeNull();
    expect(validateItem(item({ kind: "descricao", field: "description", after: "d".repeat(100) }))).toBeNull();
    expect(validateItem(item({ kind: "compartilhamento", field: "ogImage", after: "/img/a.webp" }))).toBeNull();
    expect(validateItem(item({ kind: "compartilhamento", field: "ogImage", after: "https://www.demakine.com.br/a.webp" }))).toBeNull();
    expect(validateItem(item({ kind: "imagens", field: "alt", target: "https://www.demakine.com.br/img/produtos/p/1.webp", after: "Foto 1" }))).toBeNull();
  });

  test("recusa o que é perigoso, vazio ou grande demais", () => {
    expect(validateItem(item({ after: "<b>oi</b>" }))).toMatch(/< nem >/);
    expect(validateItem(item({ after: "oi > tchau" }))).toMatch(/< nem >/);
    expect(validateItem(item({ after: "   " }))).toMatch(/vazio/);
    expect(validateItem(item({ after: "t".repeat(121) }))).toMatch(/120/);
    expect(validateItem(item({ kind: "descricao", field: "description", after: "d".repeat(321) }))).toMatch(/320/);
    expect(validateItem(item({ kind: "imagens", field: "alt", target: "https://x/y.webp", after: "a".repeat(151) }))).toMatch(/150/);
    expect(validateItem(item({ after: "linha\u0000nula" }))).toMatch(/inválido/);
    expect(validateItem(item({ kind: "compartilhamento", field: "ogImage", after: "//outro.com/x.webp" }))).toMatch(/imagem/);
    expect(validateItem(item({ kind: "compartilhamento", field: "ogImage", after: "http://www.demakine.com.br/x.webp" }))).toMatch(/imagem/);
    expect(validateItem(item({ kind: "imagens", field: "alt", after: "Foto sem endereço" }))).toMatch(/foto/);
    expect(validateItem(item({ kind: "titulo", field: "description" }))).toMatch(/incompatível/);
  });
});

describe("applyFixes", () => {
  test("grava os itens, guarda o lote com o resultado e fecha como aplicado", async () => {
    const m = memory();
    m.values.set("/a|title|", "Antigo");
    m.values.set("/b|title|", "Velho");
    const r = await applyFixes([item(), item({ id: "titulo:/b:", path: "/b", before: "Velho", after: "Título novo de B" })], deps(m));
    expect(r).toEqual({ batchId: 1, applied: 2, skipped: [] });
    expect(m.writes.map((w) => [w.key, w.value, w.userId])).toEqual([["/a|title|", "Novo título da página A", "u1"], ["/b|title|", "Título novo de B", "u1"]]);
    const b = m.batches.get(1)!;
    expect(b.status).toBe("aplicado");
    expect(b.items.map((i) => i.result)).toEqual(["gravado", "gravado"]);
  });

  test("a página mudou desde a proposta: pula e não grava", async () => {
    const m = memory();
    m.values.set("/a|title|", "Alguém editou isto");
    const r = await applyFixes([item()], deps(m));
    expect(r.applied).toBe(0);
    expect(r.skipped).toEqual([{ id: "titulo:/a:", reason: "mudou desde a proposta" }]);
    expect(m.writes).toEqual([]);
    expect(m.batches.get(1)!.status).toBe("parcial");
  });

  test("pula item inválido, de página desconhecida ou de outro tipo, e segue com os demais", async () => {
    const m = memory();
    m.values.set("/a|title|", "Antigo");
    const r = await applyFixes(
      [item(), item({ id: "x", path: "/nao-existe" }), item({ id: "y", path: "/b", after: "<i>x</i>" }), item({ id: "z", path: "/b", kind: "descricao", field: "description", after: "d".repeat(80) })],
      deps(m),
    );
    expect(r.applied).toBe(1);
    expect(r.skipped).toEqual([
      { id: "x", reason: "página não encontrada" },
      { id: "y", reason: expect.stringMatching(/< nem >/) },
      { id: "z", reason: "tipo diferente do lote" },
    ]);
  });

  test("erro ao gravar um item vira item pulado e o lote segue", async () => {
    const m = memory();
    m.values.set("/a|title|", "Antigo");
    m.values.set("/b|title|", "Velho");
    m.writers.failOn = "/a|title|";
    const r = await applyFixes([item(), item({ id: "titulo:/b:", path: "/b", before: "Velho", after: "Título novo de B" })], deps(m));
    expect(r.applied).toBe(1);
    expect(r.skipped).toEqual([{ id: "titulo:/a:", reason: "não foi possível gravar" }]);
  });

  test("já existe aplicação em andamento: recusa sem gravar nada", async () => {
    const m = memory({ busy: true });
    await expect(applyFixes([item()], deps(m))).rejects.toThrow("Já existe uma aplicação em andamento");
    expect(m.writes).toEqual([]);
  });

  test("recusa lote vazio e lote com mais de 200 itens, antes de reservar a vez", async () => {
    const m = memory();
    await expect(applyFixes([], deps(m))).rejects.toThrow("Nenhum item marcado");
    const many = Array.from({ length: 201 }, (_, i) => item({ id: `t:${i}` }));
    await expect(applyFixes(many, deps(m))).rejects.toThrow("Aplique no máximo 200 itens por vez");
    expect(m.batches.size).toBe(0);
  });
});

describe("undoBatch", () => {
  async function applied(m: ReturnType<typeof memory>) {
    m.values.set("/a|title|", "Antigo");
    m.values.set("/b|title|", "Velho");
    await applyFixes([item(), item({ id: "titulo:/b:", path: "/b", before: "Velho", after: "Título novo de B" })], deps(m));
  }
  const ud = (m: ReturnType<typeof memory>) => ({ store: m.store, writers: m.writers, userId: "u2" });

  test("devolve o valor de antes e fecha o lote como desfeito", async () => {
    const m = memory();
    await applied(m);
    const r = await undoBatch(1, undefined, ud(m));
    expect(r).toEqual({ undone: 2, skipped: [] });
    expect(m.values.get("/a|title|")).toBe("Antigo");
    expect(m.values.get("/b|title|")).toBe("Velho");
    expect(m.batches.get(1)!.status).toBe("desfeito");
    expect((m.batches.get(1)!.items as BatchItem[]).map((i) => i.result)).toEqual(["desfeito", "desfeito"]);
  });

  test("edição manual depois da aplicação: pula esse item e não apaga o trabalho de ninguém", async () => {
    const m = memory();
    await applied(m);
    m.values.set("/a|title|", "Editado à mão depois");
    const r = await undoBatch(1, undefined, ud(m));
    expect(r.undone).toBe(1);
    expect(r.skipped).toEqual([{ id: "titulo:/a:", reason: "alterado depois da aplicação" }]);
    expect(m.values.get("/a|title|")).toBe("Editado à mão depois");
    expect(m.batches.get(1)!.status).toBe("parcial");
  });

  test("com ids, desfaz só esses itens", async () => {
    const m = memory();
    await applied(m);
    const r = await undoBatch(1, ["titulo:/b:"], ud(m));
    expect(r.undone).toBe(1);
    expect(m.values.get("/a|title|")).toBe("Novo título da página A");
    expect(m.values.get("/b|title|")).toBe("Velho");
  });

  test("lote inexistente e lote já desfeito dão erro", async () => {
    const m = memory();
    await expect(undoBatch(99, undefined, ud(m))).rejects.toThrow("Lote não encontrado");
    await applied(m);
    await undoBatch(1, undefined, ud(m));
    await expect(undoBatch(1, undefined, ud(m))).rejects.toThrow("Lote já desfeito");
  });
});

describe("C1: tempo e progresso do lote", () => {
  const many = (n: number) => Array.from({ length: n }, (_, i) => item({ id: `titulo:/p${i}:`, path: `/p${i}`, before: `Antigo ${i}`, after: `Título novo número ${i} da página` }));
  const seeded = (n: number) => {
    const m = memory();
    for (let i = 0; i < n; i++) m.values.set(`/p${i}|title|`, `Antigo ${i}`);
    return m;
  };
  const knownMany = new Set(Array.from({ length: 30 }, (_, i) => `/p${i}`));

  test("o progresso é gravado a cada 5 itens, antes do fim (queda no meio não perde o registro)", async () => {
    const m = seeded(8);
    let writes = 0;
    let snapshot: { n: number; status: string } | null = null;
    const original = m.writers.write;
    m.writers.write = async (i, v, u) => {
      writes++;
      if (writes === 6) snapshot = { n: m.batches.get(1)!.items.length, status: m.batches.get(1)!.status };
      return original(i, v, u);
    };
    await applyFixes(many(8), { store: m.store, writers: m.writers, userId: "u1", metric: "titulo", knownPaths: knownMany });
    expect(snapshot).toEqual({ n: 5, status: "aplicando" });
    expect(m.batches.get(1)!.items).toHaveLength(8);
  });

  test("passou do orçamento de tempo: os itens que faltam são pulados com o motivo e o lote fecha parcial", async () => {
    const m = seeded(5);
    let t = 0;
    const r = await applyFixes(many(5), { store: m.store, writers: m.writers, userId: "u1", metric: "titulo", knownPaths: knownMany, budgetMs: 25_000, now: () => (t += 10_000) });
    expect(r.applied).toBe(2);
    expect(r.skipped.map((s) => s.reason)).toEqual(["tempo esgotado, aplique de novo", "tempo esgotado, aplique de novo", "tempo esgotado, aplique de novo"]);
    expect(m.batches.get(1)!.status).toBe("parcial");
  });

  test("o desfazer também respeita o orçamento: o que sobra fica gravado e o lote continua parcial", async () => {
    const m = seeded(5);
    await applyFixes(many(5), { store: m.store, writers: m.writers, userId: "u1", metric: "titulo", knownPaths: knownMany });
    let t = 0;
    const r = await undoBatch(1, undefined, { store: m.store, writers: m.writers, userId: "u2", budgetMs: 25_000, now: () => (t += 10_000) });
    expect(r.undone).toBe(2);
    expect(r.skipped.map((s) => s.reason)).toEqual(["tempo esgotado, desfaça de novo", "tempo esgotado, desfaça de novo", "tempo esgotado, desfaça de novo"]);
    expect(m.batches.get(1)!.status).toBe("parcial");
  });
});

describe("I3: desfazer devolve o estado de antes, sem criar override", () => {
  test("sem override antes: o desfazer remove o campo (grava vazio) em vez de fixar o texto lido na auditoria", async () => {
    const m = memory();
    m.values.set("/a|title|", "Título do código");
    await applyFixes([item({ before: "Título do código", hadOverride: false })], deps(m));
    await undoBatch(1, undefined, { store: m.store, writers: m.writers, userId: "u2" });
    expect(m.writes.at(-1)).toEqual({ key: "/a|title|", value: "", userId: "u2" });
  });

  test("com override antes: o desfazer devolve o texto de antes", async () => {
    const m = memory();
    m.values.set("/a|title|", "Texto do painel");
    await applyFixes([item({ before: "Texto do painel", hadOverride: true })], deps(m));
    await undoBatch(1, undefined, { store: m.store, writers: m.writers, userId: "u2" });
    expect(m.writes.at(-1)).toEqual({ key: "/a|title|", value: "Texto do painel", userId: "u2" });
  });
});
