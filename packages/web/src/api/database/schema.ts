import { sql } from "drizzle-orm";
import { boolean, date, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone").notNull(),
  email: text("email"),
  city: text("city"),
  /** sigla do estado (SP, MG...) ou "Exterior"; a cidade fica só em city */
  state: text("state"),
  product: text("product"),
  message: text("message"),
  source: text("source").default("site"),
  /** JSON com as keys das fotos enviadas pelo lead (identificacao de peca). */
  attachments: text("attachments"),
  /** CRM: novo | em_contato | ganho | perdido */
  status: text("status").default("novo").notNull(),
  /** id do usuario responsavel pelo lead */
  ownerId: text("owner_id"),
  /** data do primeiro/ultimo contato feito pelo time */
  firstContactAt: timestamp("first_contact_at", { withTimezone: true }),
  lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
  /** motivo da perda, obrigatorio ao marcar perdido */
  lossReason: text("loss_reason"),
  /** próximo retorno combinado com o cliente */
  nextActionAt: timestamp("next_action_at", { withTimezone: true }),
  nextActionNote: text("next_action_note"),
  /** valor da proposta em reais (inteiro); só o dono do lead e o super admin veem */
  proposalValue: integer("proposal_value"),
  /** quando virou ganho, para o fechado do mês */
  wonAt: timestamp("won_at", { withTimezone: true }),
  /** lixeira: apagado aqui fica 30 dias antes de sumir de vez */
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
  /** de onde veio a visita que gerou o lead (Google, Instagram, anúncio...), ver lib/visits.ts */
  trafficSource: text("traffic_source"),
  /** primeira página vista na visita */
  landingPath: text("landing_path"),
  utmCampaign: text("utm_campaign"),
  /** id do envio (UUID do navegador): transaction_id da conversão no Google Ads e chave para conversões offline */
  eventId: text("event_id"),
  /** identificadores de clique do anúncio na entrada da visita (Google Ads e Meta), para subir conversões do CRM */
  gclid: text("gclid"),
  gbraid: text("gbraid"),
  wbraid: text("wbraid"),
  fbclid: text("fbclid"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Conteúdo editável pelo painel. Cada linha substitui o padrão que vem no código
 * (content.json / site.ts): collection "site" (key "main"), "produto" (slug),
 * "post" (slug), "case" (slug). deleted = item do código escondido do site.
 */
export const contentDocs = pgTable(
  "content_docs",
  {
    collection: text("collection").notNull(),
    key: text("key").notNull(),
    data: jsonb("data").notNull(),
    deleted: boolean("deleted").default(false).notNull(),
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.collection, t.key] })],
);

/** Redirecionamentos (301/302) aplicados pelo middleware da Vercel: endereço antigo -> novo. */
export const redirects = pgTable("redirects", {
  id: serial("id").primaryKey(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  permanent: boolean("permanent").default(true).notNull(),
  note: text("note"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Registro de atividades do painel: quem alterou o quê e quando (sem valores sensíveis). */
export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id"),
    userName: text("user_name"),
    userRole: text("user_role"),
    method: text("method").notNull(),
    path: text("path").notNull(),
    summary: text("summary").notNull(),
    status: integer("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_created_idx").on(t.createdAt)],
);

/** Configurações internas do painel (nunca vão para o site): avisos por e-mail etc. */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Biblioteca de mídia: imagens no bucket público "midia", usadas por catálogo, blog e cases. */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  alt: text("alt"),
  width: integer("width"),
  height: integer("height"),
  size: integer("size"),
  uploadedBy: text("uploaded_by"),
  /** lixeira: apagado aqui fica 30 dias antes de sumir de vez */
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Histórico do lead: status, responsável, anotação e contato feito, com autor e data. */
export const leadEvents = pgTable(
  "lead_events",
  {
    id: serial("id").primaryKey(),
    leadId: integer("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    userId: text("user_id"),
    /** status | responsavel | nota | contato */
    type: text("type").notNull(),
    text: text("text"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lead_events_lead_idx").on(t.leadId)],
);

/** Vagas publicadas em /vagas. Requisitos e benefícios: um item por linha. */
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  area: text("area").notNull(),
  /** efetivo | estagio | temporario | pj */
  type: text("type").default("efetivo").notNull(),
  location: text("location").default("Limeira/SP").notNull(),
  summary: text("summary").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  salary: text("salary"),
  showSalary: boolean("show_salary").default(false).notNull(),
  /** aberta | pausada | encerrada */
  status: text("status").default("aberta").notNull(),
  /** último dia para se candidatar (inclusive) */
  deadline: date("deadline"),
  /** lixeira: apagado aqui fica 30 dias antes de sumir de vez */
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Candidaturas. jobId nulo = banco de talentos. */
export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    city: text("city"),
    /** sigla do estado (SP, MG...) ou "Exterior" */
    state: text("state"),
    linkedin: text("linkedin"),
    salaryExpectation: text("salary_expectation"),
    message: text("message"),
    /** key do PDF no bucket privado de currículos; opcional (quem não tem escreve a experiência) */
    resumeKey: text("resume_key"),
    /** recebido | analise | entrevista | aprovado | reprovado | banco */
    status: text("status").default("recebido").notNull(),
    notes: text("notes"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    /** lixeira: apagado aqui fica 30 dias antes de sumir de vez */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("applications_job_idx").on(t.jobId)],
);

/**
 * Comentários enviados pelo formulário "Deixe seu comentário" da página Clientes.
 * Entram como "pendente" e só aparecem no site depois de aprovados no painel.
 */
export const siteReviews = pgTable(
  "site_reviews",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    company: text("company").notNull(),
    /** 1 a 5 estrelas */
    rating: integer("rating").notNull(),
    text: text("text").notNull(),
    /** pendente | aprovada | oculta */
    status: text("status").default("pendente").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("site_reviews_status_idx").on(t.status)],
);

/**
 * Contador de tentativas por IP (limite de requisições das rotas públicas e do login). A chave é um
 * hash de rota + IP (o IP não é guardado), com uma linha por chave: a janela troca e o contador zera.
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowId: integer("window_id").notNull(),
  hits: integer("hits").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export * from "./auth-schema";

/**
 * Visitas ao site (medição própria, sem cookie). visitor é um hash do IP + navegador com uma chave
 * que troca todo dia: conta visitantes únicos do dia sem guardar IP nem permitir seguir a pessoa.
 */
export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    visitor: text("visitor").notNull(),
    /** google, instagram, direto, anuncio-google... (lib/visits.ts classifySource) */
    source: text("source").notNull(),
    referrerHost: text("referrer_host"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    /** celular | tablet | computador */
    device: text("device").notNull(),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    /** primeira página da visita (a pessoa chegou por ela) */
    entry: boolean("entry").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("page_views_created_idx").on(t.createdAt)],
);

/**
 * Execução do auditor de SEO (painel "SEO e GEO"). Uma por dia (cron) ou sob demanda (botão). Se a função
 * estoura o tempo, a execução fica "em-andamento" e a próxima chamada continua de `cursor`; as notas do site
 * só são gravadas quando ela fecha.
 */
export const seoRuns = pgTable("seo_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  /** diaria | manual */
  kind: text("kind").notNull().default("diaria"),
  /** em-andamento | completa | parcial */
  status: text("status").notNull().default("em-andamento"),
  pagesTotal: integer("pages_total").notNull().default(0),
  pagesAudited: integer("pages_audited").notNull().default(0),
  /** posição da próxima página a auditar, para retomar uma execução interrompida */
  cursor: integer("cursor").notNull().default(0),
  siteSeoScore: integer("site_seo_score"),
  sectorScores: jsonb("sector_scores").notNull().default({}),
  areaScores: jsonb("area_scores").notNull().default({}),
  /** textos de alerta da execução (queda de nota, problema novo), mostrados só no painel */
  alerts: jsonb("alerts").notNull().default([]),
});

/** Nota e fatos de cada página em cada execução (histórico por página). */
export const seoPageScores = pgTable(
  "seo_page_scores",
  {
    runId: integer("run_id").notNull(),
    path: text("path").notNull(),
    /** pt | en | es */
    lang: text("lang").notNull().default("pt"),
    area: text("area").notNull(),
    seoScore: integer("seo_score").notNull(),
    checks: jsonb("checks").notNull().default([]),
    facts: jsonb("facts"),
    statusCode: integer("status_code").notNull(),
    indexable: boolean("indexable").notNull().default(true),
    inlinks: integer("inlinks").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.runId, t.path] }),
    index("seo_page_scores_path_run_idx").on(t.path, t.runId),
  ],
);

/** Problemas de SEO abertos e resolvidos. Só um aberto por página e código (índice único parcial). */
export const seoIssues = pgTable(
  "seo_issues",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    code: text("code").notNull(),
    /** critico | atencao | info */
    severity: text("severity").notNull(),
    message: text("message").notNull(),
    firstSeen: timestamp("first_seen", { withTimezone: true }).notNull().defaultNow(),
    lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("seo_issues_open_uniq").on(t.path, t.code).where(sql`${t.resolvedAt} is null`)],
);

/** Concorrentes do "Guerra é Guerra" (no máximo 2 ativos). `url` é só a origem, https://site.com.br. */
export const seoCompetitors = pgTable("seo_competitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Duelos: andamento (state, para retomar se a função estourar o tempo) e placar final (result). */
export const seoDuels = pgTable("seo_duels", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  /** em-andamento | completa */
  status: text("status").notNull().default("em-andamento"),
  state: jsonb("state").notNull().default({}),
  result: jsonb("result"),
});
