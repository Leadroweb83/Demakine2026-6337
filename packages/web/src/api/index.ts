import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { cors } from "hono/cors"
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET, ALLOWED_IMAGE_TYPES, AVATAR_BUCKET, AVATAR_TYPES, avatarPublicUrl, safeName } from "./lib/s3";
import { db } from "./database";
import * as schema from "./database/schema";
import { desc, eq } from "drizzle-orm";
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
          image: (user as { image?: string | null }).image ?? null,
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
  .get('/admin/dashboard', requireRole('admin', 'vendedor'), async (c) => {
    const rawDays = Number(c.req.query('dias') ?? '90');
    const days = Number.isFinite(rawDays) && rawDays >= 0 ? Math.min(rawDays, 3650) : 90;
    const onlyMine = c.req.query('escopo') === 'meus';
    const me = c.get('user')!;
    const now = Date.now();
    const allRows = await db.select().from(schema.leads);
    const rows = onlyMine ? allRows.filter((r) => r.ownerId === me.id) : allRows;
    const users = await db
      .select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
      .from(schema.user);
    const userName = new Map(users.map((u) => [u.id, u.name]));
    const imageByName = new Map(users.map((u) => [u.name, u.image]));

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
      previous: previous.filter((r) => (r.status ?? 'novo') === s).length,
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

    // datas no fuso da fabrica: o servidor roda em UTC
    const spFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      hourCycle: 'h23',
    });
    const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const sp = (d: Date) => {
      const p = Object.fromEntries(spFmt.formatToParts(d).map((x) => [x.type, x.value]));
      return {
        year: Number(p.year),
        month: Number(p.month),
        weekday: WEEKDAY_INDEX[p.weekday ?? 'Sun'] ?? 0,
        hour: Number(p.hour) % 24,
      };
    };
    const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

    // serie de 12 meses (total e ganhos), com o mesmo mes do ano anterior
    const monthTotals = new Map<string, { total: number; won: number }>();
    for (const r of rows) {
      const d = sp(r.createdAt ?? new Date());
      const k = monthKey(d.year, d.month);
      const cur = monthTotals.get(k) ?? { total: 0, won: 0 };
      cur.total += 1;
      if (r.status === 'ganho') cur.won += 1;
      monthTotals.set(k, cur);
    }
    const byMonth: { month: string; total: number; won: number; lastYear: number }[] = [];
    const today = sp(new Date());
    for (let i = 11; i >= 0; i--) {
      const idx = today.year * 12 + (today.month - 1) - i;
      const year = Math.floor(idx / 12);
      const month = (idx % 12) + 1;
      const k = monthKey(year, month);
      byMonth.push({
        month: k,
        total: monthTotals.get(k)?.total ?? 0,
        won: monthTotals.get(k)?.won ?? 0,
        lastYear: monthTotals.get(monthKey(year - 1, month))?.total ?? 0,
      });
    }

    // tempo medio ate o primeiro contato (horas)
    const avgFirstContact = (list: typeof rows) => {
      const contacted = list.filter((r) => r.firstContactAt && r.createdAt);
      if (!contacted.length) return null;
      const sum = contacted.reduce((acc, r) => acc + (at(r.firstContactAt) - at(r.createdAt)), 0);
      return Math.round((sum / contacted.length / 36e5) * 10) / 10;
    };
    const conversionOf = (list: typeof rows) => {
      const w = list.filter((r) => r.status === 'ganho').length;
      const cl = list.filter((r) => r.status === 'ganho' || r.status === 'perdido').length;
      return cl ? Math.round((w / cl) * 100) : null;
    };

    // leads parados: sem contato e criados ha mais de 48h (assinante de newsletter nao espera contato)
    const staleAll = rows
      .filter(
        (r) =>
          (r.status ?? 'novo') === 'novo' &&
          !r.firstContactAt &&
          !(r.source ?? '').startsWith('newsletter') &&
          at(r.createdAt) < now - 48 * 36e5,
      )
      .sort((a, b) => at(a.createdAt) - at(b.createdAt));
    const stale = staleAll.slice(0, 12).map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      company: r.company,
      source: r.source ?? 'site',
      product: r.product,
      createdAt: r.createdAt,
      hours: Math.round((now - at(r.createdAt)) / 36e5),
    }));

    const recent = [...rows]
      .sort((a, b) => at(b.createdAt) - at(a.createdAt))
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        name: r.name,
        company: r.company,
        phone: r.phone,
        city: r.city,
        product: r.product,
        source: r.source ?? 'site',
        status: r.status ?? 'novo',
        createdAt: r.createdAt,
      }));

    // mapa de calor: 7 dias x 8 faixas de 3 horas
    const byWeekHour = Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => 0));
    for (const r of period) {
      const d = sp(r.createdAt ?? new Date());
      byWeekHour[d.weekday]![Math.floor(d.hour / 3)]! += 1;
    }

    // UF a partir da cidade digitada ("Limeira/SP", "Limeira - SP", "Limeira, SP")
    const UFS = new Set([
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
      'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    ]);
    const ufOf = (city: string | null) => {
      const m = (city ?? '').trim().match(/(?:[/,–-]\s*|\s)([A-Za-z]{2})\.?$/);
      const uf = m?.[1]?.toUpperCase();
      return uf && UFS.has(uf) ? uf : null;
    };
    const byState = countBy(period, (r) => ufOf(r.city));
    const stateUnknown = period.filter((r) => !ufOf(r.city)).length;

    const byOwner = countBy(period, (r) => (r.ownerId ? userName.get(r.ownerId) ?? 'Removido' : null)).map(
      (o) => ({ ...o, image: imageByName.get(o.label) ?? null }),
    );
    const unassigned = period.filter((r) => !r.ownerId).length;
    const isOpen = (r: (typeof rows)[number]) =>
      (r.status ?? 'novo') === 'novo' || r.status === 'em_contato';

    return c.json(
      {
        days,
        scope: onlyMine ? 'meus' : 'todos',
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
          previousConversion: conversionOf(previous),
          openLeads: period.filter(isOpen).length,
          previousOpenLeads: previous.filter(isOpen).length,
          avgFirstContactHours: avgFirstContact(period),
          previousAvgFirstContactHours: avgFirstContact(previous),
          staleCount: staleAll.length,
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
        byWeekHour,
        byState,
        stateUnknown,
        byOwner,
        unassigned,
        stale,
        recent,
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
        image: schema.user.image,
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
  .patch(
    '/admin/users/:id',
    requireRole(),
    validator('json', (v) => v as { name?: string; role?: string; active?: boolean }),
    async (c) => {
    const id = c.req.param('id');
    const me = c.get('user')!;
    const body = c.req.valid('json');

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
    },
  )
  .post(
    '/admin/users/:id/password',
    requireRole(),
    validator('json', (v) => (v ?? {}) as { password?: string }),
    async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
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
    },
  )
  // ------------------------------------------------- preferências do dashboard
  .get('/admin/preferences', requireAuth, async (c) => {
    const [row] = await db
      .select({ layout: schema.user.dashboardLayout })
      .from(schema.user)
      .where(eq(schema.user.id, c.get('user')!.id));
    let layout: { order: string[]; hidden: string[] } | null = null;
    try {
      layout = row?.layout ? JSON.parse(row.layout) : null;
    } catch {
      layout = null;
    }
    return c.json({ layout }, 200);
  })
  .put('/admin/preferences', requireAuth, async (c) => {
    const body = await c.req.json<{ layout: { order?: unknown; hidden?: unknown } | null }>();
    const ids = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && /^[a-z0-9-]{1,40}$/.test(x)).slice(0, 60) : [];
    const layout = body.layout ? { order: ids(body.layout.order), hidden: ids(body.layout.hidden) } : null;
    await db
      .update(schema.user)
      .set({ dashboardLayout: layout ? JSON.stringify(layout) : null })
      .where(eq(schema.user.id, c.get('user')!.id));
    return c.json({ layout }, 200);
  })
  // ------------------------------------------------------------ foto de perfil
  .post('/admin/avatar/presign', requireAuth, async (c) => {
    const me = c.get('user')!;
    const body = await c.req.json<{ contentType?: string; size?: number; userId?: string }>();
    const target = body.userId && body.userId !== me.id ? body.userId : me.id;
    if (target !== me.id && me.role !== 'super_admin') {
      return c.json({ error: 'Só o super admin troca a foto de outra pessoa' }, 403);
    }
    if (!AVATAR_TYPES.includes(body.contentType ?? '')) {
      return c.json({ error: 'Envie a foto em WEBP, JPG ou PNG' }, 400);
    }
    if (typeof body.size === 'number' && body.size > 2 * 1024 * 1024) {
      return c.json({ error: 'A foto pode ter no máximo 2 MB' }, 400);
    }
    const ext = body.contentType === 'image/png' ? 'png' : body.contentType === 'image/jpeg' ? 'jpg' : 'webp';
    const key = `${target}/${crypto.randomUUID()}.${ext}`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: AVATAR_BUCKET, Key: key, ContentType: body.contentType }),
      { expiresIn: 300 },
    );
    return c.json({ url, key }, 200);
  })
  .post('/admin/avatar', requireAuth, async (c) => {
    const me = c.get('user')!;
    const body = await c.req.json<{ key?: string | null; userId?: string }>();
    const target = body.userId && body.userId !== me.id ? body.userId : me.id;
    if (target !== me.id && me.role !== 'super_admin') {
      return c.json({ error: 'Só o super admin troca a foto de outra pessoa' }, 403);
    }
    const key = body.key ?? null;
    if (key !== null && !new RegExp(`^${target}/[0-9a-f-]{36}\\.(webp|jpg|png)$`).test(key)) {
      return c.json({ error: 'Arquivo de foto inválido' }, 400);
    }
    const [current] = await db
      .select({ image: schema.user.image })
      .from(schema.user)
      .where(eq(schema.user.id, target));
    const image = key ? avatarPublicUrl(key) : null;
    await db.update(schema.user).set({ image }).where(eq(schema.user.id, target));
    // apaga a foto anterior para não acumular arquivo órfão no bucket
    const prefix = avatarPublicUrl('');
    if (current?.image && current.image !== image && current.image.startsWith(prefix)) {
      await s3
        .send(new DeleteObjectCommand({ Bucket: AVATAR_BUCKET, Key: current.image.slice(prefix.length) }))
        .catch(() => undefined);
    }
    return c.json({ image }, 200);
  });

export type AppType = typeof app;
export default app;
