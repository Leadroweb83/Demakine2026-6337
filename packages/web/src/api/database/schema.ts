import { boolean, date, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone").notNull(),
  email: text("email"),
  city: text("city"),
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
    linkedin: text("linkedin"),
    salaryExpectation: text("salary_expectation"),
    message: text("message"),
    /** key do PDF no bucket privado de currículos; opcional (quem não tem escreve a experiência) */
    resumeKey: text("resume_key"),
    /** recebido | analise | entrevista | aprovado | reprovado | banco */
    status: text("status").default("recebido").notNull(),
    notes: text("notes"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("applications_job_idx").on(t.jobId)],
);

export * from "./auth-schema";
