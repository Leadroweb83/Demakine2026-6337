import type { FixBatch, FixStore, FixWriters } from "../../../src/api/lib/seo/fix-apply";
import type { FixItem } from "../../../src/api/lib/seo/fix-rules";

/** Loja e escritores de correção em memória, para os testes de aplicar, desfazer e das rotas. */
export function memory(opts: { busy?: boolean } = {}) {
  const batches = new Map<number, FixBatch>();
  let seq = 0;
  const store: FixStore = {
    async begin(userId, metric) {
      if (opts.busy) return null;
      const id = ++seq;
      batches.set(id, { id, at: "2026-11-16T10:00:00.000Z", userId, metric, status: "aplicando", items: [] });
      return { id };
    },
    async finish(id, items, status) {
      const b = batches.get(id)!;
      batches.set(id, { ...b, items, status });
    },
    async get(id) {
      return batches.get(id) ?? null;
    },
    async list(limit) {
      return [...batches.values()].reverse().slice(0, limit);
    },
  };
  const values = new Map<string, string>();
  const writes: { key: string; value: string; userId: string }[] = [];
  const key = (i: Pick<FixItem, "path" | "field" | "target">) => `${i.path}|${i.field}|${i.target ?? ""}`;
  const writers: FixWriters & { failOn?: string } = {
    async current(i) {
      return values.get(key(i)) ?? "";
    },
    async write(i, value, userId) {
      if (writers.failOn === key(i)) throw new Error("banco fora do ar");
      values.set(key(i), value);
      writes.push({ key: key(i), value, userId });
    },
  };
  return { store, writers, values, writes, batches, key };
}
