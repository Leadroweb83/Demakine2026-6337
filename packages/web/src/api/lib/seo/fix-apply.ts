/**
 * Aplicar e desfazer lotes de correção (puro: a loja e os escritores entram por injeção). Cada item é conferido antes de
 * gravar: se o valor atual não é mais o "antes" mostrado ao Leandro, o item é pulado e ninguém perde edição. O
 * desfazer segue a mesma regra no sentido contrário.
 */
import type { FixField, FixItem, FixKind } from "./fix-rules";

export type ItemResult = "gravado" | "pulado" | "desfeito";
export type BatchItem = FixItem & { result: ItemResult; reason?: string };
export type FixBatch = { id: number; at: string; userId: string; metric: FixKind; status: "aplicando" | "aplicado" | "parcial" | "desfeito"; items: BatchItem[] };

export interface FixStore {
  /** reserva a vez de aplicar; null quando já há um lote aplicando */
  begin(userId: string, metric: FixKind): Promise<{ id: number } | null>;
  finish(id: number, items: BatchItem[], status: FixBatch["status"]): Promise<void>;
  get(id: number): Promise<FixBatch | null>;
  list(limit: number): Promise<FixBatch[]>;
}

type Target = Pick<FixItem, "path" | "field" | "target">;
export interface FixWriters {
  /** valor em uso hoje (o mesmo critério do "antes" da proposta) */
  current(item: Target): Promise<string>;
  /** grava o valor; texto vazio remove o campo do painel */
  write(item: Target, value: string, userId: string): Promise<void>;
}

export const MAX_ITEMS = 200;
const FIELD_OF: Record<FixKind, FixField> = { titulo: "title", descricao: "description", compartilhamento: "ogImage", imagens: "alt" };
const LIMIT: Partial<Record<FixField, [number, string]>> = { title: [120, "título"], description: [320, "descrição"], alt: [150, "alt"] };

/** Motivo da recusa, ou null quando o item pode ser gravado. */
export function validateItem(item: FixItem): string | null {
  if (FIELD_OF[item.kind] !== item.field) return "campo incompatível com o tipo";
  const text = typeof item.after === "string" ? item.after.trim() : "";
  if (text === "") return "texto vazio";
  if (/[<>]/.test(text)) return "o texto não pode ter < nem >";
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(text)) return "caractere inválido";
  const lim = LIMIT[item.field];
  if (lim && text.length > lim[0]) return `${lim[1]} acima de ${lim[0]} caracteres`;
  if (item.field === "ogImage" && !(text.length <= 500 && ((text.startsWith("/") && !text.startsWith("//")) || text.startsWith("https://")))) return "endereço de imagem inválido";
  if (item.field === "alt" && !item.target) return "foto sem endereço";
  return null;
}

type ApplyDeps = { store: FixStore; writers: FixWriters; userId: string; metric: FixKind; knownPaths: Set<string>; onError?: (id: string, err: unknown) => void };

export async function applyFixes(items: FixItem[], deps: ApplyDeps): Promise<{ batchId: number; applied: number; skipped: { id: string; reason: string }[] }> {
  if (items.length === 0) throw new Error("Nenhum item marcado");
  if (items.length > MAX_ITEMS) throw new Error(`Aplique no máximo ${MAX_ITEMS} itens por vez`);
  const slot = await deps.store.begin(deps.userId, deps.metric);
  if (!slot) throw new Error("Já existe uma aplicação em andamento");

  const done: BatchItem[] = [];
  const skipped: { id: string; reason: string }[] = [];
  const skip = (it: FixItem, reason: string) => {
    done.push({ ...it, result: "pulado", reason });
    skipped.push({ id: it.id, reason });
  };
  try {
    for (const it of items) {
      if (it.kind !== deps.metric) skip(it, "tipo diferente do lote");
      else if (validateItem(it)) skip(it, validateItem(it)!);
      else if (!deps.knownPaths.has(it.path)) skip(it, "página não encontrada");
      else if ((await deps.writers.current(it)) !== it.before) skip(it, "mudou desde a proposta");
      else {
        try {
          await deps.writers.write(it, it.after.trim(), deps.userId);
          done.push({ ...it, after: it.after.trim(), result: "gravado" });
        } catch (err) {
          deps.onError?.(it.id, err);
          skip(it, "não foi possível gravar");
        }
      }
    }
  } finally {
    const applied = done.filter((i) => i.result === "gravado").length;
    await deps.store.finish(slot.id, done, applied === items.length ? "aplicado" : "parcial");
  }
  return { batchId: slot.id, applied: done.filter((i) => i.result === "gravado").length, skipped };
}

type UndoDeps = { store: FixStore; writers: FixWriters; userId: string; onError?: (id: string, err: unknown) => void };

export async function undoBatch(batchId: number, ids: string[] | undefined, deps: UndoDeps): Promise<{ undone: number; skipped: { id: string; reason: string }[] }> {
  const batch = await deps.store.get(batchId);
  if (!batch) throw new Error("Lote não encontrado");
  if (batch.status === "desfeito") throw new Error("Lote já desfeito");
  if (!batch.items.some((i) => i.result === "gravado")) throw new Error("Nada para desfazer neste lote");

  const only = ids ? new Set(ids) : null;
  const skipped: { id: string; reason: string }[] = [];
  const items: BatchItem[] = [];
  let undone = 0;
  for (const it of batch.items) {
    if (it.result !== "gravado" || (only && !only.has(it.id))) {
      items.push(it);
      continue;
    }
    if ((await deps.writers.current(it)) !== it.after) {
      skipped.push({ id: it.id, reason: "alterado depois da aplicação" });
      items.push(it);
      continue;
    }
    try {
      await deps.writers.write(it, it.before, deps.userId);
      items.push({ ...it, result: "desfeito" });
      undone++;
    } catch (err) {
      deps.onError?.(it.id, err);
      skipped.push({ id: it.id, reason: "não foi possível desfazer" });
      items.push(it);
    }
  }
  const left = items.some((i) => i.result === "gravado");
  await deps.store.finish(batchId, items, left ? "parcial" : "desfeito");
  return { undone, skipped };
}
