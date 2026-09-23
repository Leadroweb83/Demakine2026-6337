/**
 * Cria (ou reseta a senha de) o super admin do painel.
 * Uso: cd packages/web && bun --env-file=../../.env seed-superadmin.ts
 * Senha: usa SUPER_ADMIN_PASSWORD do .env; se nao existir, gera uma forte e imprime.
 */
import { eq } from "drizzle-orm";
import { db } from "./src/api/database";
import * as schema from "./src/api/database/schema";
import { createPanelUser, randomPassword, setUserPassword } from "./src/api/lib/users";

const EMAIL = "leandroweb83@gmail.com";
const NAME = "Leandro";

const password = process.env.SUPER_ADMIN_PASSWORD?.trim() || randomPassword(14);
const fromEnv = !!process.env.SUPER_ADMIN_PASSWORD?.trim();

const existing = await db.select().from(schema.user).where(eq(schema.user.email, EMAIL)).limit(1);

if (existing.length) {
  await setUserPassword(existing[0]!.id, password);
  await db
    .update(schema.user)
    .set({ role: "super_admin", active: true, mustChangePassword: !fromEnv, name: NAME })
    .where(eq(schema.user.id, existing[0]!.id));
  console.log(JSON.stringify({ action: "reset", email: EMAIL, password, fromEnv }, null, 2));
} else {
  const created = await createPanelUser({
    name: NAME,
    email: EMAIL,
    password,
    role: "super_admin",
    mustChangePassword: !fromEnv,
  });
  console.log(
    JSON.stringify({ action: "created", id: created.id, email: EMAIL, password, fromEnv }, null, 2),
  );
}

process.exit(0);
