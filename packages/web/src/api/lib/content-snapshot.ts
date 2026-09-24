import { createHash } from "node:crypto";
import { asc } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

export type ContentSnapshot = {
  docs: Record<string, Record<string, unknown>>;
  deleted: Record<string, string[]>;
  /** muda sempre que algo do painel muda: o site compara com a versão usada na pré-renderização */
  version: string;
};

/** Todo o conteúdo editado no painel, em ordem fixa (a versão não pode depender da ordem do banco). */
export async function getContentSnapshot(): Promise<ContentSnapshot> {
  const rows = await db
    .select()
    .from(schema.contentDocs)
    .orderBy(asc(schema.contentDocs.collection), asc(schema.contentDocs.key));
  const docs: ContentSnapshot["docs"] = {};
  const deleted: ContentSnapshot["deleted"] = {};
  for (const r of rows) {
    if (r.deleted) (deleted[r.collection] ??= []).push(r.key);
    else (docs[r.collection] ??= {})[r.key] = r.data;
  }
  const version = createHash("sha1").update(JSON.stringify({ docs, deleted })).digest("hex").slice(0, 16);
  return { docs, deleted, version };
}
