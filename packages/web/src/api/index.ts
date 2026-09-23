import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { cors } from "hono/cors"
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  s3,
  S3_BUCKET,
  ALLOWED_IMAGE_TYPES,
  AVATAR_BUCKET,
  AVATAR_TYPES,
  avatarPublicUrl,
  RESUME_BUCKET,
  RESUME_MAX_BYTES,
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_TYPES,
  publicUrl,
  safeName,
} from "./lib/s3";
import { db } from "./database";
import * as schema from "./database/schema";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { auth } from "./auth";
import { authMiddleware, requireAuth, requireRole, type SessionUser } from "./middleware/auth";
import { createPanelUser, isRole, randomPassword, setUserPassword } from "./lib/users";
import {
  APPLICATION_STATUSES,
  RESUME_KEY_RE,
  isJobOpen,
  parseJobInput,
  publicJob,
  slugify,
  type JobInput,
} from "./lib/jobs";
import { isLeadStatus } from "./lib/leads";
import { CONTENT_COLLECTIONS, CONTENT_KEY_RE, CONTENT_MAX_BYTES, canEditCollection } from "./lib/content-docs";

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
  // -------------------------------------------------- conteúdo editável (site)
  .get('/conteudo', async (c) => {
    const rows = await db.select().from(schema.contentDocs);
    const out: Record<string, Record<string, unknown>> = {};
    const deleted: Record<string, string[]> = {};
    for (const r of rows) {
      if (r.deleted) (deleted[r.collection] ??= []).push(r.key);
      else (out[r.collection] ??= {})[r.key] = r.data;
    }
    // navegador sempre confere; só a borda da Vercel guarda (30 s): edição aparece em até ~1 min.
    // stale-while-revalidate no Cache-Control valeria também no navegador e mostraria versão velha.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    c.header('CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    return c.json({ docs: out, deleted }, 200);
  })
  // ------------------------------------------------------------------ vagas
  .get('/vagas', async (c) => {
    const rows = await db.select().from(schema.jobs).orderBy(desc(schema.jobs.createdAt));
    const jobs = rows.filter(isJobOpen).map(publicJob);
    return c.json({ jobs }, 200);
  })
  .get('/vagas/:slug', async (c) => {
    const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.slug, c.req.param('slug')));
    if (!job) return c.json({ error: 'Vaga não encontrada' }, 404);
    return c.json({ job: publicJob(job) }, 200);
  })
  .post('/vagas/curriculo', async (c) => {
    const body = await c.req.json<{ contentType?: string; size?: number }>();
    if (body.contentType !== 'application/pdf') {
      return c.json({ error: 'Envie o currículo em PDF' }, 400);
    }
    if (typeof body.size === 'number' && body.size > RESUME_MAX_BYTES) {
      return c.json({ error: 'O PDF pode ter no máximo 5 MB' }, 400);
    }
    const month = new Date().toISOString().slice(0, 7);
    const key = `${month}/${crypto.randomUUID()}.pdf`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: RESUME_BUCKET, Key: key, ContentType: 'application/pdf' }),
      { expiresIn: 600 },
    );
    return c.json({ url, key }, 200);
  })
  .post('/vagas/candidatura', async (c) => {
    const body = await c.req.json<{
      jobSlug?: string | null;
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      linkedin?: string;
      salaryExpectation?: string;
      message?: string;
      resumeKey?: string | null;
      consent?: boolean;
      website?: string;
    }>();
    // campo invisível: robô preenche, gente não
    if (body.website) return c.json({ ok: true }, 201);

    const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const name = text(body.name, 120);
    const email = text(body.email, 160).toLowerCase();
    const phone = text(body.phone, 40);
    const message = text(body.message, 3000);
    const resumeKey = body.resumeKey || null;

    if (name.length < 3) return c.json({ error: 'Informe seu nome completo' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: 'Informe um e-mail válido' }, 400);
    if (phone.replace(/\D/g, '').length < 10) return c.json({ error: 'Informe um telefone com DDD' }, 400);
    if (!body.consent) return c.json({ error: 'É preciso autorizar o uso dos seus dados para a seleção' }, 400);
    if (!resumeKey && message.length < 20) {
      return c.json({ error: 'Envie o currículo em PDF ou conte um pouco da sua experiência' }, 400);
    }
    if (resumeKey) {
      if (!RESUME_KEY_RE.test(resumeKey)) return c.json({ error: 'Arquivo de currículo inválido' }, 400);
      const exists = await s3
        .send(new HeadObjectCommand({ Bucket: RESUME_BUCKET, Key: resumeKey }))
        .then(() => true)
        .catch(() => false);
      if (!exists) return c.json({ error: 'O currículo não terminou de enviar. Tente de novo.' }, 400);
    }

    let jobId: number | null = null;
    if (body.jobSlug) {
      const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.slug, body.jobSlug));
      if (!job || !isJobOpen(job)) return c.json({ error: 'Esta vaga não está mais aberta' }, 400);
      jobId = job.id;
    }

    await db.insert(schema.applications).values({
      jobId,
      name,
      email,
      phone,
      city: text(body.city, 80) || null,
      linkedin: text(body.linkedin, 200) || null,
      salaryExpectation: text(body.salaryExpectation, 60) || null,
      message: message || null,
      resumeKey,
      status: jobId ? 'recebido' : 'banco',
      consentAt: new Date(),
    });
    return c.json({ ok: true }, 201);
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
  // ------------------------------------------------------- vagas (painel)
  .get('/admin/vagas', requireRole('admin', 'editor', 'rh'), async (c) => {
    const role = c.get('user')!.role;
    const seesCandidates = role === 'super_admin' || role === 'admin' || role === 'rh';
    const jobs = await db.select().from(schema.jobs).orderBy(desc(schema.jobs.createdAt));
    const counts = seesCandidates
      ? await db
          .select({ jobId: schema.applications.jobId, total: sql<number>`count(*)::int` })
          .from(schema.applications)
          .groupBy(schema.applications.jobId)
      : [];
    const byJob = new Map(counts.map((r) => [r.jobId, r.total]));
    return c.json(
      {
        jobs: jobs.map((j) => ({ ...j, open: isJobOpen(j), applications: byJob.get(j.id) ?? 0 })),
        talentPool: byJob.get(null) ?? 0,
        seesCandidates,
      },
      200,
    );
  })
  .post('/admin/vagas', requireRole('admin', 'editor', 'rh'), async (c) => {
    const parsed = parseJobInput(await c.req.json<JobInput>(), false);
    if ('error' in parsed) return c.json({ error: parsed.error }, 400);
    const base = slugify(parsed.data.title as string) || 'vaga';
    const taken = new Set(
      (await db.select({ slug: schema.jobs.slug }).from(schema.jobs)).map((r) => r.slug),
    );
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    const [job] = await db
      .insert(schema.jobs)
      .values({ ...(parsed.data as typeof schema.jobs.$inferInsert), slug })
      .returning();
    return c.json({ job }, 201);
  })
  .patch(
    '/admin/vagas/:id',
    requireRole('admin', 'editor', 'rh'),
    validator('json', (v) => (v ?? {}) as JobInput),
    async (c) => {
    const id = Number(c.req.param('id'));
    const parsed = parseJobInput(c.req.valid('json'), true);
    if ('error' in parsed) return c.json({ error: parsed.error }, 400);
    const [job] = await db
      .update(schema.jobs)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.jobs.id, id))
      .returning();
    if (!job) return c.json({ error: 'Vaga não encontrada' }, 404);
    return c.json({ job }, 200);
    },
  )
  .delete('/admin/vagas/:id', requireRole('admin', 'rh'), async (c) => {
    const id = Number(c.req.param('id'));
    const [used] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(schema.applications)
      .where(eq(schema.applications.jobId, id));
    if ((used?.total ?? 0) > 0) {
      return c.json({ error: 'Esta vaga tem candidatos. Encerre a vaga em vez de apagar.' }, 409);
    }
    await db.delete(schema.jobs).where(eq(schema.jobs.id, id));
    return c.json({ ok: true }, 200);
  })
  .get('/admin/candidaturas/novas', requireRole('admin', 'rh'), async (c) => {
    const [row] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(schema.applications)
      .where(eq(schema.applications.status, 'recebido'));
    return c.json({ total: row?.total ?? 0 }, 200);
  })
  .get('/admin/candidaturas', requireRole('admin', 'rh'), async (c) => {
    const rows = await db
      .select({
        application: schema.applications,
        jobTitle: schema.jobs.title,
        jobSlug: schema.jobs.slug,
      })
      .from(schema.applications)
      .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
      .orderBy(desc(schema.applications.createdAt));
    return c.json(
      { applications: rows.map((r) => ({ ...r.application, jobTitle: r.jobTitle, jobSlug: r.jobSlug })) },
      200,
    );
  })
  .patch(
    '/admin/candidaturas/:id',
    requireRole('admin', 'rh'),
    validator('json', (v) => (v ?? {}) as { status?: string; notes?: string | null }),
    async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!(APPLICATION_STATUSES as readonly string[]).includes(body.status)) {
        return c.json({ error: 'Status inválido' }, 400);
      }
      patch.status = body.status;
    }
    if (body.notes !== undefined) patch.notes = body.notes?.trim().slice(0, 4000) || null;
    if (!Object.keys(patch).length) return c.json({ error: 'Nada para atualizar' }, 400);
    await db.update(schema.applications).set(patch).where(eq(schema.applications.id, id));
    return c.json({ ok: true }, 200);
    },
  )
  .delete('/admin/candidaturas/:id', requireRole('admin', 'rh'), async (c) => {
    const id = Number(c.req.param('id'));
    const [row] = await db
      .delete(schema.applications)
      .where(eq(schema.applications.id, id))
      .returning({ resumeKey: schema.applications.resumeKey });
    if (row?.resumeKey) {
      await s3
        .send(new DeleteObjectCommand({ Bucket: RESUME_BUCKET, Key: row.resumeKey }))
        .catch(() => undefined);
    }
    return c.json({ ok: true }, 200);
  })
  .get('/admin/curriculo/:id', requireRole('admin', 'rh'), async (c) => {
    const id = Number(c.req.param('id'));
    const [row] = await db
      .select({ key: schema.applications.resumeKey, name: schema.applications.name })
      .from(schema.applications)
      .where(eq(schema.applications.id, id));
    if (!row?.key) return c.json({ error: 'Candidatura sem currículo' }, 404);
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: RESUME_BUCKET,
        Key: row.key,
        ResponseContentDisposition: `inline; filename="curriculo-${safeName(row.name).replace(/\./g, '')}.pdf"`,
      }),
      { expiresIn: 300 },
    );
    return c.json({ url }, 200);
  })
  .get('/admin/leads', requireRole('admin', 'vendedor'), async (c) => {
    const leads = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
    return c.json({ leads }, 200);
  })
  // ------------------------------------------------------ biblioteca de mídia
  .get('/admin/midia', requireRole('admin', 'editor'), async (c) => {
    const items = await db
      .select({
        id: schema.media.id,
        key: schema.media.key,
        url: schema.media.url,
        name: schema.media.name,
        alt: schema.media.alt,
        width: schema.media.width,
        height: schema.media.height,
        size: schema.media.size,
        uploadedBy: schema.media.uploadedBy,
        uploaderName: schema.user.name,
        createdAt: schema.media.createdAt,
      })
      .from(schema.media)
      .leftJoin(schema.user, eq(schema.media.uploadedBy, schema.user.id))
      .orderBy(desc(schema.media.createdAt));
    return c.json({ items }, 200);
  })
  .post('/admin/midia/presign', requireRole('admin', 'editor'), async (c) => {
    const body = await c.req.json<{ contentType?: string; size?: number }>();
    const type = body.contentType ?? '';
    if (!MEDIA_TYPES.includes(type)) return c.json({ error: 'Envie imagem em WEBP, JPG ou PNG' }, 400);
    if (typeof body.size === 'number' && body.size > MEDIA_MAX_BYTES) {
      return c.json({ error: 'A imagem pode ter no máximo 8 MB' }, 400);
    }
    const ext = type === 'image/png' ? 'png' : type === 'image/jpeg' ? 'jpg' : 'webp';
    const key = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: MEDIA_BUCKET, Key: key, ContentType: type }),
      { expiresIn: 600 },
    );
    return c.json({ url, key }, 200);
  })
  .post(
    '/admin/midia',
    requireRole('admin', 'editor'),
    validator(
      'json',
      (v) =>
        (v ?? {}) as { key?: string; name?: string; alt?: string; width?: number; height?: number; size?: number },
    ),
    async (c) => {
      const body = c.req.valid('json');
      const key = body.key ?? '';
      if (!/^\d{4}-\d{2}\/[0-9a-f-]{36}\.(webp|jpg|png)$/.test(key)) return c.json({ error: 'Arquivo inválido' }, 400);
      const exists = await s3
        .send(new HeadObjectCommand({ Bucket: MEDIA_BUCKET, Key: key }))
        .then(() => true)
        .catch(() => false);
      if (!exists) return c.json({ error: 'A imagem não terminou de enviar' }, 400);
      const int = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : null);
      const [item] = await db
        .insert(schema.media)
        .values({
          key,
          url: publicUrl(MEDIA_BUCKET, key),
          name: body.name?.trim().slice(0, 160) || key,
          alt: body.alt?.trim().slice(0, 300) || null,
          width: int(body.width),
          height: int(body.height),
          size: int(body.size),
          uploadedBy: c.get('user')!.id,
        })
        .returning();
      return c.json({ item }, 201);
    },
  )
  .patch(
    '/admin/midia/:id',
    requireRole('admin', 'editor'),
    validator('json', (v) => (v ?? {}) as { alt?: string | null; name?: string }),
    async (c) => {
      const body = c.req.valid('json');
      const patch: Partial<typeof schema.media.$inferInsert> = {};
      if (body.alt !== undefined) patch.alt = body.alt?.trim().slice(0, 300) || null;
      if (body.name?.trim()) patch.name = body.name.trim().slice(0, 160);
      if (!Object.keys(patch).length) return c.json({ error: 'Nada para atualizar' }, 400);
      await db.update(schema.media).set(patch).where(eq(schema.media.id, Number(c.req.param('id'))));
      return c.json({ ok: true }, 200);
    },
  )
  .delete('/admin/midia/:id', requireRole('admin', 'editor'), async (c) => {
    const me = c.get('user')!;
    const id = Number(c.req.param('id'));
    const [item] = await db.select().from(schema.media).where(eq(schema.media.id, id));
    if (!item) return c.json({ error: 'Imagem não encontrada' }, 404);
    if (me.role === 'editor' && item.uploadedBy !== me.id) {
      return c.json({ error: 'O editor só apaga imagens que ele mesmo enviou' }, 403);
    }
    await db.delete(schema.media).where(eq(schema.media.id, id));
    await s3.send(new DeleteObjectCommand({ Bucket: MEDIA_BUCKET, Key: item.key })).catch(() => undefined);
    return c.json({ ok: true }, 200);
  })
  // -------------------------------------------------- conteúdo editável (painel)
  .get('/admin/conteudo/:collection', requireAuth, async (c) => {
    const collection = c.req.param('collection');
    if (!canEditCollection(c.get('user')!.role, collection)) return c.json({ error: 'Sem permissão' }, 403);
    const rows = await db
      .select({
        key: schema.contentDocs.key,
        data: schema.contentDocs.data,
        deleted: schema.contentDocs.deleted,
        updatedAt: schema.contentDocs.updatedAt,
        updatedBy: schema.user.name,
      })
      .from(schema.contentDocs)
      .leftJoin(schema.user, eq(schema.contentDocs.updatedBy, schema.user.id))
      .where(eq(schema.contentDocs.collection, collection));
    return c.json({ docs: rows }, 200);
  })
  .put(
    '/admin/conteudo/:collection/:key',
    requireAuth,
    validator('json', (v) => (v ?? {}) as { data?: unknown; deleted?: boolean }),
    async (c) => {
      const me = c.get('user')!;
      const collection = c.req.param('collection');
      const key = c.req.param('key');
      if (!CONTENT_COLLECTIONS[collection] || !CONTENT_KEY_RE.test(key)) {
        return c.json({ error: 'Conteúdo inválido' }, 400);
      }
      if (!canEditCollection(me.role, collection)) return c.json({ error: 'Sem permissão' }, 403);
      const body = c.req.valid('json');
      const data = body.data ?? {};
      if (typeof data !== 'object' || Array.isArray(data)) return c.json({ error: 'Formato inválido' }, 400);
      if (JSON.stringify(data).length > CONTENT_MAX_BYTES) return c.json({ error: 'Conteúdo grande demais' }, 400);
      const values = {
        collection,
        key,
        data,
        deleted: body.deleted === true,
        updatedBy: me.id,
        updatedAt: new Date(),
      };
      await db
        .insert(schema.contentDocs)
        .values(values)
        .onConflictDoUpdate({
          target: [schema.contentDocs.collection, schema.contentDocs.key],
          set: { data: values.data, deleted: values.deleted, updatedBy: values.updatedBy, updatedAt: values.updatedAt },
        });
      return c.json({ ok: true }, 200);
    },
  )
  .delete('/admin/conteudo/:collection/:key', requireAuth, async (c) => {
    const collection = c.req.param('collection');
    if (!canEditCollection(c.get('user')!.role, collection)) return c.json({ error: 'Sem permissão' }, 403);
    await db
      .delete(schema.contentDocs)
      .where(and(eq(schema.contentDocs.collection, collection), eq(schema.contentDocs.key, c.req.param('key'))));
    return c.json({ ok: true }, 200);
  })
  // ------------------------------------------------------------- CRM de leads
  .get('/admin/equipe', requireRole('admin', 'vendedor'), async (c) => {
    const team = await db
      .select({ id: schema.user.id, name: schema.user.name, image: schema.user.image, role: schema.user.role })
      .from(schema.user)
      .where(and(eq(schema.user.active, true), inArray(schema.user.role, ['super_admin', 'admin', 'vendedor'])))
      .orderBy(asc(schema.user.name));
    return c.json({ team }, 200);
  })
  .get('/admin/leads/:id/eventos', requireRole('admin', 'vendedor'), async (c) => {
    const id = Number(c.req.param('id'));
    const events = await db
      .select({
        id: schema.leadEvents.id,
        type: schema.leadEvents.type,
        text: schema.leadEvents.text,
        createdAt: schema.leadEvents.createdAt,
        userName: schema.user.name,
      })
      .from(schema.leadEvents)
      .leftJoin(schema.user, eq(schema.leadEvents.userId, schema.user.id))
      .where(eq(schema.leadEvents.leadId, id))
      .orderBy(desc(schema.leadEvents.createdAt));
    return c.json({ events }, 200);
  })
  .patch(
    '/admin/leads/:id',
    requireRole('admin', 'vendedor'),
    validator('json', (v) => (v ?? {}) as { status?: string; ownerId?: string | null; lossReason?: string | null }),
    async (c) => {
      const id = Number(c.req.param('id'));
      const me = c.get('user')!;
      const body = c.req.valid('json');
      const [lead] = await db.select().from(schema.leads).where(eq(schema.leads.id, id));
      if (!lead) return c.json({ error: 'Lead não encontrado' }, 404);

      const patch: Partial<typeof schema.leads.$inferInsert> = {};
      const events: { type: string; text: string }[] = [];
      const now = new Date();

      if (body.status !== undefined && body.status !== lead.status) {
        if (!isLeadStatus(body.status)) return c.json({ error: 'Status inválido' }, 400);
        const reason = body.lossReason?.trim().slice(0, 120) || null;
        if (body.status === 'perdido' && !reason) {
          return c.json({ error: 'Informe o motivo da perda' }, 400);
        }
        patch.status = body.status;
        patch.lossReason = body.status === 'perdido' ? reason : null;
        // sair de "novo" conta como primeiro contato, para o tempo médio do dashboard
        if (body.status !== 'novo' && !lead.firstContactAt) {
          patch.firstContactAt = now;
          patch.lastContactAt = now;
        }
        events.push({
          type: 'status',
          text: `${lead.status ?? 'novo'} > ${body.status}${reason && body.status === 'perdido' ? ` (${reason})` : ''}`,
        });
      }

      if (body.ownerId !== undefined && body.ownerId !== lead.ownerId) {
        let ownerName = 'ninguém';
        if (body.ownerId) {
          const [owner] = await db
            .select({ id: schema.user.id, name: schema.user.name })
            .from(schema.user)
            .where(eq(schema.user.id, body.ownerId));
          if (!owner) return c.json({ error: 'Responsável inválido' }, 400);
          ownerName = owner.name;
        }
        patch.ownerId = body.ownerId || null;
        events.push({ type: 'responsavel', text: ownerName });
      }

      if (!Object.keys(patch).length) return c.json({ ok: true }, 200);
      await db.update(schema.leads).set(patch).where(eq(schema.leads.id, id));
      await db
        .insert(schema.leadEvents)
        .values(events.map((e) => ({ leadId: id, userId: me.id, type: e.type, text: e.text })));
      return c.json({ ok: true }, 200);
    },
  )
  .post(
    '/admin/leads/:id/eventos',
    requireRole('admin', 'vendedor'),
    validator('json', (v) => (v ?? {}) as { type?: string; text?: string }),
    async (c) => {
      const id = Number(c.req.param('id'));
      const me = c.get('user')!;
      const body = c.req.valid('json');
      const text = body.text?.trim().slice(0, 2000) ?? '';
      if (body.type !== 'nota' && body.type !== 'contato') return c.json({ error: 'Tipo inválido' }, 400);
      if (body.type === 'nota' && !text) return c.json({ error: 'Escreva a anotação' }, 400);

      const [lead] = await db.select().from(schema.leads).where(eq(schema.leads.id, id));
      if (!lead) return c.json({ error: 'Lead não encontrado' }, 404);

      const rows: { leadId: number; userId: string; type: string; text: string | null }[] = [
        { leadId: id, userId: me.id, type: body.type, text: text || null },
      ];
      if (body.type === 'contato') {
        const now = new Date();
        const patch: Partial<typeof schema.leads.$inferInsert> = { lastContactAt: now };
        if (!lead.firstContactAt) patch.firstContactAt = now;
        if ((lead.status ?? 'novo') === 'novo') {
          patch.status = 'em_contato';
          rows.push({ leadId: id, userId: me.id, type: 'status', text: 'novo > em_contato' });
        }
        await db.update(schema.leads).set(patch).where(eq(schema.leads.id, id));
      }
      await db.insert(schema.leadEvents).values(rows);
      return c.json({ ok: true }, 201);
    },
  )
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
