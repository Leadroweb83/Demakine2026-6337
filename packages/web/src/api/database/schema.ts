import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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

export * from "./auth-schema";
