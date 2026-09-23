import { eq } from "drizzle-orm";
import { auth, ROLES, type Role } from "../auth";
import { db } from "../database";
import * as schema from "../database/schema";

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/**
 * Cria um usuário do painel direto pelo contexto do Better Auth.
 * Usamos o adapter interno porque o cadastro público está desativado
 * (só o super admin cria gente).
 */
export async function createPanelUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  mustChangePassword?: boolean;
}) {
  const ctx = await auth.$context;
  const email = input.email.trim().toLowerCase();

  const existing = await db.select().from(schema.user).where(eq(schema.user.email, email)).limit(1);
  if (existing.length) throw new Error("Já existe um usuário com este e-mail");

  const created = await ctx.internalAdapter.createUser({
    name: input.name.trim(),
    email,
    emailVerified: false,
    role: input.role,
    active: true,
    mustChangePassword: input.mustChangePassword ?? true,
  } as never);

  const hash = await ctx.password.hash(input.password);
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: "credential",
    accountId: created.id,
    password: hash,
  } as never);

  return created;
}

/** Troca a senha de um usuário (usado no reset feito pelo super admin). */
export async function setUserPassword(userId: string, password: string) {
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const accounts = await ctx.internalAdapter.findAccounts(userId);
  const credential = accounts.find((a) => a.providerId === "credential");
  if (!credential) throw new Error("Usuário sem login por senha");
  await ctx.internalAdapter.updateAccount(credential.id, { password: hash });
  return true;
}

export function randomPassword(len = 12) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
