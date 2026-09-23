import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  firstContactAt: integer("first_contact_at", { mode: "timestamp" }),
  lastContactAt: integer("last_contact_at", { mode: "timestamp" }),
  /** motivo da perda, obrigatorio ao marcar perdido */
  lossReason: text("loss_reason"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export * from "./auth-schema";
