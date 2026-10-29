import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { MEDIA_BUCKET, RESUME_BUCKET, s3 } from "./s3";

export const TRASH_DAYS = 30;
export const TRASH_TYPES = ["lead", "candidatura", "vaga", "midia"] as const;
export type TrashType = (typeof TRASH_TYPES)[number];
export const isTrashType = (v: string): v is TrashType => (TRASH_TYPES as readonly string[]).includes(v);

const TABLE = {
  lead: schema.leads,
  candidatura: schema.applications,
  vaga: schema.jobs,
  midia: schema.media,
} as const;

export type TrashItem = {
  type: TrashType;
  id: number;
  label: string;
  detail: string | null;
  deletedAt: Date;
  deletedBy: string | null;
};

/** Tudo o que está na lixeira, do mais recente para o mais antigo. */
export async function listTrash(): Promise<TrashItem[]> {
  const [leads, apps, jobs, media] = await Promise.all([
    db.select().from(schema.leads).where(isNotNull(schema.leads.deletedAt)),
    db.select().from(schema.applications).where(isNotNull(schema.applications.deletedAt)),
    db.select().from(schema.jobs).where(isNotNull(schema.jobs.deletedAt)),
    db.select().from(schema.media).where(isNotNull(schema.media.deletedAt)),
  ]);
  const items: TrashItem[] = [
    ...leads.map((l) => ({ type: "lead" as const, id: l.id, label: l.name, detail: [l.company, l.product].filter(Boolean).join(" · ") || null, deletedAt: l.deletedAt!, deletedBy: l.deletedBy })),
    ...apps.map((a) => ({ type: "candidatura" as const, id: a.id, label: a.name, detail: a.email, deletedAt: a.deletedAt!, deletedBy: a.deletedBy })),
    ...jobs.map((j) => ({ type: "vaga" as const, id: j.id, label: j.title, detail: j.area, deletedAt: j.deletedAt!, deletedBy: j.deletedBy })),
    ...media.map((m) => ({ type: "midia" as const, id: m.id, label: m.name, detail: m.url, deletedAt: m.deletedAt!, deletedBy: m.deletedBy })),
  ];
  return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}

export async function restoreFromTrash(type: TrashType, id: number) {
  const t = TABLE[type];
  await db.update(t).set({ deletedAt: null, deletedBy: null }).where(eq(t.id, id));
}

/** Apaga de vez, com os arquivos (currículo, imagem). Só o que já está na lixeira. */
export async function destroy(type: TrashType, ids: number[]) {
  if (!ids.length) return 0;
  if (type === "lead") {
    const rows = await db.delete(schema.leads).where(and(inArray(schema.leads.id, ids), isNotNull(schema.leads.deletedAt))).returning({ id: schema.leads.id });
    return rows.length;
  }
  if (type === "vaga") {
    const rows = await db.delete(schema.jobs).where(and(inArray(schema.jobs.id, ids), isNotNull(schema.jobs.deletedAt))).returning({ id: schema.jobs.id });
    return rows.length;
  }
  if (type === "candidatura") {
    const rows = await db
      .delete(schema.applications)
      .where(and(inArray(schema.applications.id, ids), isNotNull(schema.applications.deletedAt)))
      .returning({ key: schema.applications.resumeKey });
    for (const r of rows) {
      if (r.key) await s3.send(new DeleteObjectCommand({ Bucket: RESUME_BUCKET, Key: r.key })).catch(() => undefined);
    }
    return rows.length;
  }
  const rows = await db
    .delete(schema.media)
    .where(and(inArray(schema.media.id, ids), isNotNull(schema.media.deletedAt)))
    .returning({ key: schema.media.key });
  for (const r of rows) await s3.send(new DeleteObjectCommand({ Bucket: MEDIA_BUCKET, Key: r.key })).catch(() => undefined);
  return rows.length;
}

/** Rotina diária: o que está na lixeira há mais de 30 dias sai de vez. */
export async function purgeTrash() {
  const limit = new Date(Date.now() - TRASH_DAYS * 864e5);
  let total = 0;
  for (const type of TRASH_TYPES) {
    const t = TABLE[type];
    const old = await db.select({ id: t.id }).from(t).where(lt(t.deletedAt, limit));
    total += await destroy(type, old.map((r) => r.id));
  }
  return total;
}
