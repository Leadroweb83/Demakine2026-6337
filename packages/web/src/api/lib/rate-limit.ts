import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { db } from "../database";

const SALT = process.env.VISITS_SALT ?? process.env.BETTER_AUTH_SECRET ?? "demakine-limite";

/** IP de quem chamou, como a Vercel informa (ela sobrescreve esses cabeçalhos, o visitante não consegue forjar). */
export function clientIp(h: Headers) {
  const raw = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for") ?? "";
  return raw.split(",")[0]!.trim() || "desconhecido";
}

const ipHash = (ip: string) => createHash("sha256").update(`${SALT}|${ip}`).digest("hex").slice(0, 24);

/** Contador em memória: segura rajadas dentro de uma instância e cobre a falha do banco. */
const memory = new Map<string, { n: number; resetAt: number }>();

function memoryHit(key: string, windowMs: number) {
  const now = Date.now();
  if (memory.size > 5000) for (const [k, v] of memory) if (v.resetAt < now) memory.delete(k);
  const cur = memory.get(key);
  if (!cur || cur.resetAt < now) {
    memory.set(key, { n: 1, resetAt: now + windowMs });
    return 1;
  }
  cur.n += 1;
  return cur.n;
}

/**
 * Conta uma tentativa e diz se ainda cabe no limite. O contador principal fica no banco (vale entre
 * todas as instâncias da Vercel); se o banco falhar, vale só o da memória, sem derrubar o site.
 */
export async function hit(key: string, max: number, windowSec: number) {
  const inMemory = memoryHit(key, windowSec * 1000);
  let count = inMemory;
  try {
    const windowId = Math.floor(Date.now() / 1000 / windowSec);
    const rows = (await db.execute(sql`
      insert into rate_limits (key, window_id, hits, updated_at) values (${key}, ${windowId}, 1, now())
      on conflict (key) do update set
        hits = case when rate_limits.window_id = excluded.window_id then rate_limits.hits + 1 else 1 end,
        window_id = excluded.window_id,
        updated_at = now()
      returning hits
    `)) as unknown as { hits: number }[];
    const fromDb = Number(rows[0]?.hits);
    if (Number.isFinite(fromDb)) count = Math.max(count, fromDb);
  } catch {
    /* tabela ainda não existe ou banco indisponível: segue só com a memória */
  }
  return { ok: count <= max, retryAfter: windowSec };
}

/** Limite por IP para uma rota: `limit("leads", 8, 600)` = 8 chamadas a cada 10 minutos. */
export const limit = (bucket: string, max: number, windowSec: number) =>
  createMiddleware(async (c, next) => {
    const r = await hit(`${bucket}:${ipHash(clientIp(c.req.raw.headers))}`, max, windowSec);
    if (!r.ok) {
      c.header("Retry-After", String(r.retryAfter));
      return c.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." }, 429);
    }
    return next();
  });

/** Apaga contadores parados há mais de 2 dias (rotina diária). */
export async function purgeRateLimits() {
  try {
    const rows = (await db.execute(sql`delete from rate_limits where updated_at < now() - interval '2 days' returning key`)) as unknown as unknown[];
    return rows.length;
  } catch {
    return 0;
  }
}
