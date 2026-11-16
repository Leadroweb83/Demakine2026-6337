/**
 * Persistência dos lotes de correção e escritores do botão "Corrigir". O banco entra por parâmetro (sem importar a
 * conexão aqui), para o módulo carregar nos testes. As partes puras (currentAlt, normalizeOgValue) têm teste; o acesso
 * ao banco não (não há banco nos testes), como o resto de data.ts: conferir com o painel depois de aplicar a 0019.
 */
import { and, desc, eq, lt } from "drizzle-orm";
import type { db as Db } from "../../database";
import * as schema from "../../database/schema";
import { seoKey } from "../../../web/lib/seo-pages";
import { toSeoDoc } from "../../../web/lib/seo-overrides";
import type { BatchItem, FixBatch, FixStore, FixWriters } from "./fix-apply";
import { currentValue, type FixPage } from "./fix-rules";

type Database = typeof Db;

/** Alt gravado no documento do produto (painel) vale mais que o do código; sem nenhum, vazio. */
export function currentAlt(productDoc: { imageAlts?: Record<string, string> } | undefined, codeAlts: Record<string, string> | undefined, key: string): string {
  return productDoc?.imageAlts?.[key] ?? codeAlts?.[key] ?? "";
}

const OWN_ORIGINS = ["https://www.demakine.com.br", "https://demakine.com.br"];
/** O painel devolve a imagem de compartilhamento já com o domínio; a proposta usa o caminho. Compara pelo caminho. */
export function normalizeOgValue(v: string): string {
  for (const o of OWN_ORIGINS) if (v.startsWith(`${o}/`)) return v.slice(o.length);
  return v;
}

const STALE_MS = 2 * 60_000;
const isUniqueViolation = (err: unknown): boolean => {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
};

export function createFixStore(db: Database): FixStore {
  const toBatch = (r: typeof schema.seoFixBatches.$inferSelect): FixBatch => ({
    id: r.id,
    at: r.createdAt.toISOString(),
    userId: r.userId,
    metric: r.metric as FixBatch["metric"],
    status: r.status as FixBatch["status"],
    items: r.items as BatchItem[],
  });
  return {
    async begin(userId, metric) {
      // lote que ficou "aplicando" há mais de 2 minutos caiu no meio: libera a vez
      await db
        .update(schema.seoFixBatches)
        .set({ status: "parcial" })
        .where(and(eq(schema.seoFixBatches.status, "aplicando"), lt(schema.seoFixBatches.createdAt, new Date(Date.now() - STALE_MS))));
      try {
        const [row] = await db.insert(schema.seoFixBatches).values({ userId, metric, status: "aplicando", items: [] }).returning({ id: schema.seoFixBatches.id });
        return { id: row!.id };
      } catch (err) {
        if (isUniqueViolation(err)) return null;
        throw err;
      }
    },
    async finish(id, items, status) {
      await db.update(schema.seoFixBatches).set({ items, status }).where(eq(schema.seoFixBatches.id, id));
    },
    async get(id) {
      const [row] = await db.select().from(schema.seoFixBatches).where(eq(schema.seoFixBatches.id, id)).limit(1);
      return row ? toBatch(row) : null;
    },
    async list(limit) {
      return (await db.select().from(schema.seoFixBatches).orderBy(desc(schema.seoFixBatches.id)).limit(limit)).map(toBatch);
    },
  };
}

type WriterDeps = {
  pages(): Promise<FixPage[]>;
  savePageDoc(key: string, doc: Record<string, unknown>, userId: string): Promise<void>;
  setImageAlt(slug: string, src: string, alt: string, userId: string): Promise<void>;
  /** alt em uso da foto de um produto (documento do painel ou código) */
  productAlt(slug: string, src: string): Promise<string>;
};

const productSlug = (path: string) => /^\/produtos\/([a-z0-9-]+)$/.exec(path)?.[1];

/** "Antes" e "depois" usam o mesmo critério da proposta (override primeiro, depois o que a auditoria leu). */
export function createFixWriters(deps: WriterDeps): FixWriters {
  return {
    async current(item) {
      if (item.field === "alt") {
        const slug = productSlug(item.path);
        return slug && item.target ? deps.productAlt(slug, item.target) : "";
      }
      const page = (await deps.pages()).find((p) => p.path === item.path);
      if (!page) return "";
      const v = currentValue(page, item.field);
      return item.field === "ogImage" ? normalizeOgValue(v) : v;
    },
    async write(item, value, userId) {
      if (item.field === "alt") {
        const slug = productSlug(item.path);
        if (!slug || !item.target) throw new Error("Foto não encontrada neste produto");
        await deps.setImageAlt(slug, item.target, value, userId);
        return;
      }
      const page = (await deps.pages()).find((p) => p.path === item.path);
      if (!page) throw new Error("Página não encontrada");
      const doc: Record<string, unknown> = { ...page.overrides };
      if (value === "") delete doc[item.field];
      else doc[item.field] = value;
      await deps.savePageDoc(seoKey(item.path), toSeoDoc(doc), userId);
    },
  };
}
