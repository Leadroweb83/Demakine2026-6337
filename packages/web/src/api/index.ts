import { Hono } from 'hono';
import { cors } from "hono/cors"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET, ALLOWED_IMAGE_TYPES, safeName } from "./lib/s3";
import { db } from "./database";
import * as schema from "./database/schema";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "./auth";
import { authMiddleware, requireAuth, requireRole, type SessionUser } from "./middleware/auth";
import { createPanelUser, isRole, randomPassword, setUserPassword } from "./lib/users";

type Env = {
  Variables: {
    user: SessionUser | null;
    session: unknown;
  };
};

const app = new Hono<Env>()
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath('api')
  .use(authMiddleware)
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
      attachments?: string[];
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
        attachments:
          Array.isArray(body.attachments) && body.attachments.length
            ? JSON.stringify(body.attachments.slice(0, 3))
            : null,
      })
      .returning();

    return c.json({ lead }, 201);
  })
  .post('/newsletter', async (c) => {
    const body = await c.req.json<{ email: string; source?: string }>();
    const email = body.email?.trim().toLowerCase() ?? '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: 'Informe um e-mail valido' }, 400);
    }

    const [lead] = await db
      .insert(schema.leads)
      .values({
        name: email.split('@')[0] ?? 'Assinante',
        phone: '-',
        email,
        message: 'Assinatura da newsletter tecnica (1 e-mail por mes)',
        source: body.source?.trim() || 'newsletter-rodape',
      })
      .returning();

    return c.json({ lead }, 201);
  })
  .post('/upload/presign', async (c) => {
    const body = await c.req.json<{ filename: string; contentType: string; size?: number }>();
    const contentType = body.contentType ?? '';

    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return c.json({ error: 'Envie uma foto em JPG, PNG, WEBP ou HEIC' }, 400);
    }
    if (typeof body.size === 'number' && body.size > 10 * 1024 * 1024) {
      return c.json({ error: 'Cada foto pode ter no maximo 10MB' }, 400);
    }

    const key = `leads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(body.filename ?? 'foto.jpg')}`;

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 600 },
    );

    return c.json({ url, key }, 200);
  })
  // ---------------------------------------------------------------- painel
  .get('/admin/me', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ user: null }, 200);
    return c.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role ?? 'editor') as string,
          active: user.active !== false,
          mustChangePassword: user.mustChangePassword === true,
        },
      },
      200,
    );
  })
  .get('/admin/attachment', requireRole('admin', 'vendedor'), async (c) => {
    const key = c.req.query('key') ?? '';
    if (!key.startsWith('leads/')) {
      return c.json({ error: 'Chave invalida' }, 400);
    }
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), {
      expiresIn: 600,
    });
    return c.json({ url }, 200);
  })
  .get('/admin/leads', requireRole('admin', 'vendedor'), async (c) => {
    const leads = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
    return c.json({ leads }, 200);
  })
  .get('/admin/overview', requireAuth, async (c) => {
    const user = c.get('user')!;
    const role = (user.role ?? 'editor') as string;
    const canSeeLeads = role === 'super_admin' || role === 'admin' || role === 'vendedor';

    let totalLeads = 0;
    let leadsLast30 = 0;
    let bySource: { source: string; total: number }[] = [];
    let byMonth: { month: string; total: number }[] = [];

    if (canSeeLeads) {
      const rows = await db.select().from(schema.leads);
      totalLeads = rows.length;
      const cut = Date.now() - 30 * 24 * 60 * 60 * 1000;
      leadsLast30 = rows.filter((r) => (r.createdAt?.getTime() ?? 0) >= cut).length;

      const sourceMap = new Map<string, number>();
      const monthMap = new Map<string, number>();
      for (const r of rows) {
        const s = r.source ?? 'site';
        sourceMap.set(s, (sourceMap.get(s) ?? 0) + 1);
        const d = r.createdAt ?? new Date();
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
      }
      bySource = [...sourceMap.entries()]
        .map(([source, total]) => ({ source, total }))
        .sort((a, b) => b.total - a.total);
      byMonth = [...monthMap.entries()]
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);
    }

    const [{ total: totalUsers } = { total: 0 }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(schema.user);

    return c.json({ canSeeLeads, totalLeads, leadsLast30, bySource, byMonth, totalUsers }, 200);
  })
  .get('/admin/dashboard', requireRole('admin', 'vendedor'), async (c) => {
    const days = Number(c.req.query('dias') ?? '90');
    const now = Date.now();
    const rows = await db.select().from(schema.leads);
    const users = await db
      .select({ id: schema.user.id, name: schema.user.name })
      .from(schema.user);
    const userName = new Map(users.map((u) => [u.id, u.name]));

    const ms = (d: number) => d * 24 * 60 * 60 * 1000;
    const inPeriod = (t: number) => (days > 0 ? t >= now - ms(days) : true);
    const inPrevPeriod = (t: number) =>
      days > 0 ? t >= now - ms(days * 2) && t < now - ms(days) : false;

    const at = (d: Date | null | undefined) => (d ? d.getTime() : 0);
    const period = rows.filter((r) => inPeriod(at(r.createdAt)));
    const previous = rows.filter((r) => inPrevPeriod(at(r.createdAt)));

    const countBy = <T>(list: T[], key: (item: T) => string | null | undefined) => {
      const map = new Map<string, number>();
      for (const item of list) {
        const k = (key(item) ?? '').trim();
        if (!k) continue;
        map.set(k, (map.get(k) ?? 0) + 1);
      }
      return [...map.entries()]
        .map(([label, total]) => ({ label, total }))
        .sort((a, b) => b.total - a.total);
    };

    // funil por status
    const STATUS = ['novo', 'em_contato', 'ganho', 'perdido'] as const;
    const byStatus = STATUS.map((s) => ({
      status: s,
      total: period.filter((r) => (r.status ?? 'novo') === s).length,
    }));

    const won = period.filter((r) => r.status === 'ganho').length;
    const closed = period.filter((r) => r.status === 'ganho' || r.status === 'perdido').length;
    const conversion = closed ? Math.round((won / closed) * 100) : null;

    // origem com taxa de ganho
    const sourceMap = new Map<string, { total: number; won: number; lost: number }>();
    for (const r of period) {
      const k = (r.source ?? 'site').trim() || 'site';
      const cur = sourceMap.get(k) ?? { total: 0, won: 0, lost: 0 };
      cur.total += 1;
      if (r.status === 'ganho') cur.won += 1;
      if (r.status === 'perdido') cur.lost += 1;
      sourceMap.set(k, cur);
    }
    const bySource = [...sourceMap.entries()]
      .map(([label, v]) => ({
        label,
        total: v.total,
        won: v.won,
        rate: v.won + v.lost ? Math.round((v.won / (v.won + v.lost)) * 100) : null,
      }))
      .sort((a, b) => b.total - a.total);

    // serie de 12 meses (total e ganhos), com o mesmo mes do ano anterior
    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthTotals = new Map<string, { total: number; won: number }>();
    for (const r of rows) {
      const d = r.createdAt ?? new Date();
      const k = monthKey(d);
      const cur = monthTotals.get(k) ?? { total: 0, won: 0 };
      cur.total += 1;
      if (r.status === 'ganho') cur.won += 1;
      monthTotals.set(k, cur);
    }
    const byMonth: { month: string; total: number; won: number; lastYear: number }[] = [];
    const cursor = new Date();
    cursor.setDate(1);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      const k = monthKey(d);
      const ly = monthKey(new Date(d.getFullYear() - 1, d.getMonth(), 1));
      byMonth.push({
        month: k,
        total: monthTotals.get(k)?.total ?? 0,
        won: monthTotals.get(k)?.won ?? 0,
        lastYear: monthTotals.get(ly)?.total ?? 0,
      });
    }

    // tempo medio ate o primeiro contato (horas)
    const contacted = period.filter((r) => r.firstContactAt && r.createdAt);
    const avgFirstContactHours = contacted.length
      ? Math.round(
          (contacted.reduce((acc, r) => acc + (at(r.firstContactAt) - at(r.createdAt)), 0) /
            contacted.length /
            36e5) *
            10,
        ) / 10
      : null;

    // leads parados: sem contato e criados ha mais de 48h
    const stale = rows
      .filter(
        (r) =>
          (r.status ?? 'novo') === 'novo' &&
          !r.firstContactAt &&
          at(r.createdAt) < now - 48 * 36e5,
      )
      .sort((a, b) => at(a.createdAt) - at(b.createdAt))
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        company: r.company,
        source: r.source ?? 'site',
        product: r.product,
        createdAt: r.createdAt,
        hours: Math.round((now - at(r.createdAt)) / 36e5),
      }));

    const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const byWeekday = WEEKDAYS.map((label, i) => ({
      label,
      total: period.filter((r) => (r.createdAt ?? new Date()).getDay() === i).length,
    }));

    const byHourMap = new Map<number, number>();
    for (const r of period) {
      const h = (r.createdAt ?? new Date()).getHours();
      byHourMap.set(h, (byHourMap.get(h) ?? 0) + 1);
    }
    const byHour = Array.from({ length: 24 }, (_, h) => ({
      label: String(h).padStart(2, '0'),
      total: byHourMap.get(h) ?? 0,
    }));

    const byOwner = countBy(period, (r) => (r.ownerId ? userName.get(r.ownerId) ?? 'Removido' : null));

    return c.json(
      {
        days,
        generatedAt: new Date().toISOString(),
        kpi: {
          total: period.length,
          previousTotal: previous.length,
          delta:
            previous.length > 0
              ? Math.round(((period.length - previous.length) / previous.length) * 100)
              : null,
          allTime: rows.length,
          won,
          conversion,
          openLeads: period.filter((r) => (r.status ?? 'novo') === 'novo' || r.status === 'em_contato')
            .length,
          avgFirstContactHours,
          staleCount: stale.length,
          withPhotos: period.filter((r) => !!r.attachments).length,
        },
        byStatus,
        bySource,
        byMonth,
        topProducts: countBy(period, (r) => r.product).slice(0, 8),
        topCities: countBy(period, (r) => r.city).slice(0, 8),
        lossReasons: countBy(
          period.filter((r) => r.status === 'perdido'),
          (r) => r.lossReason,
        ).slice(0, 6),
        byWeekday,
        byHour,
        byOwner,
        stale,
      },
      200,
    );
  })
  .post('/admin/change-password', requireAuth, async (c) => {
    const body = await c.req.json<{ currentPassword: string; newPassword: string }>();
    if (!body.newPassword || body.newPassword.length < 8) {
      return c.json({ error: 'A nova senha precisa de no mínimo 8 caracteres' }, 400);
    }
    const res = await auth.api.changePassword({
      body: {
        currentPassword: body.currentPassword ?? '',
        newPassword: body.newPassword,
        revokeOtherSessions: true,
      },
      headers: c.req.raw.headers,
      asResponse: true,
    });
    if (!res.ok) return c.json({ error: 'Senha atual incorreta' }, 400);
    await db
      .update(schema.user)
      .set({ mustChangePassword: false })
      .where(eq(schema.user.id, c.get('user')!.id));
    return c.json({ ok: true }, 200);
  })
  // ------------------------------------------------- usuários (super admin)
  .get('/admin/users', requireRole(), async (c) => {
    const users = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        role: schema.user.role,
        active: schema.user.active,
        mustChangePassword: schema.user.mustChangePassword,
        createdAt: schema.user.createdAt,
      })
      .from(schema.user)
      .orderBy(desc(schema.user.createdAt));
    return c.json({ users }, 200);
  })
  .post('/admin/users', requireRole(), async (c) => {
    const body = await c.req.json<{ name: string; email: string; role: string; password?: string }>();
    if (!body.name?.trim() || !body.email?.trim()) {
      return c.json({ error: 'Nome e e-mail são obrigatórios' }, 400);
    }
    if (!isRole(body.role)) return c.json({ error: 'Papel inválido' }, 400);
    if (body.password && body.password.length < 8) {
      return c.json({ error: 'A senha precisa de no mínimo 8 caracteres' }, 400);
    }
    const password = body.password?.trim() || randomPassword();
    try {
      const created = await createPanelUser({
        name: body.name,
        email: body.email,
        password,
        role: body.role,
        mustChangePassword: true,
      });
      return c.json({ user: { id: created.id, email: created.email }, password }, 201);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : 'Falha ao criar usuário' }, 400);
    }
  })
  .patch('/admin/users/:id', requireRole(), async (c) => {
    const id = c.req.param('id');
    const me = c.get('user')!;
    const body = await c.req.json<{ name?: string; role?: string; active?: boolean }>();

    if (id === me.id && (body.role !== undefined || body.active === false)) {
      return c.json({ error: 'Você não pode alterar o próprio papel nem se desativar' }, 400);
    }
    const patch: Record<string, unknown> = {};
    if (body.name?.trim()) patch.name = body.name.trim();
    if (body.role !== undefined) {
      if (!isRole(body.role)) return c.json({ error: 'Papel inválido' }, 400);
      patch.role = body.role;
    }
    if (body.active !== undefined) patch.active = body.active;
    if (!Object.keys(patch).length) return c.json({ error: 'Nada para atualizar' }, 400);

    await db.update(schema.user).set(patch).where(eq(schema.user.id, id));
    return c.json({ ok: true }, 200);
  })
  .post('/admin/users/:id/password', requireRole(), async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ password?: string }>().catch(() => ({ password: undefined }));
    if (body.password && body.password.length < 8) {
      return c.json({ error: 'A senha precisa de no mínimo 8 caracteres' }, 400);
    }
    const password = body.password?.trim() || randomPassword();
    try {
      await setUserPassword(id, password);
      await db.update(schema.user).set({ mustChangePassword: true }).where(eq(schema.user.id, id));
      return c.json({ password }, 200);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : 'Falha ao trocar a senha' }, 400);
    }
  });

export type AppType = typeof app;
export default app;
