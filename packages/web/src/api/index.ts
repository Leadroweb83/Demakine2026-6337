import { Hono } from 'hono';
import { cors } from "hono/cors"
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "./database";
import * as schema from "./database/schema";
import { desc } from "drizzle-orm";

const ADMIN_COOKIE = "demakine_admin_session";

function signToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", secret).update("demakine-admin").digest("hex");
}

const requireAdmin = createMiddleware(async (c, next) => {
  const cookie = getCookie(c, ADMIN_COOKIE);
  const expected = signToken();
  if (!cookie || !expected || cookie.length !== expected.length || !timingSafeEqual(Buffer.from(cookie), Buffer.from(expected))) {
    return c.json({ error: "Não autorizado" }, 401);
  }
  await next();
});

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .post('/leads', async (c) => {
    const body = await c.req.json<{
      name: string;
      company?: string;
      phone: string;
      email?: string;
      city?: string;
      product?: string;
      message?: string;
      source?: string;
    }>();

    if (!body.name || !body.phone) {
      return c.json({ error: 'Nome e telefone sao obrigatorios' }, 400);
    }

    const [lead] = await db
      .insert(schema.leads)
      .values({
        name: body.name.trim(),
        company: body.company?.trim() || null,
        phone: body.phone.trim(),
        email: body.email?.trim() || null,
        city: body.city?.trim() || null,
        product: body.product?.trim() || null,
        message: body.message?.trim() || null,
        source: body.source?.trim() || 'site',
      })
      .returning();

    return c.json({ lead }, 201);
  })
  .post('/admin/login', async (c) => {
    const body = await c.req.json<{ password: string }>();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "";

    if (!adminPassword || body.password !== adminPassword) {
      return c.json({ error: "Senha incorreta" }, 401);
    }

    setCookie(c, ADMIN_COOKIE, signToken(), {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return c.json({ ok: true }, 200);
  })
  .post('/admin/logout', async (c) => {
    deleteCookie(c, ADMIN_COOKIE, { path: "/" });
    return c.json({ ok: true }, 200);
  })
  .get('/admin/me', async (c) => {
    const cookie = getCookie(c, ADMIN_COOKIE);
    const expected = signToken();
    const authenticated = !!cookie && !!expected && cookie.length === expected.length && timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));
    return c.json({ authenticated }, 200);
  })
  .get('/admin/leads', requireAdmin, async (c) => {
    const leads = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
    return c.json({ leads }, 200);
  });

export type AppType = typeof app;
export default app;
