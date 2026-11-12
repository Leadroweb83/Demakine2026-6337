/**
 * Guardas de acesso por papel. Arquivo à parte de auth.ts de propósito: este não importa o banco nem o better-auth,
 * então os testes de permissão usam o guarda de verdade (middleware/auth.ts reexporta tudo daqui).
 */
import { createMiddleware } from "hono/factory";
import type { Role } from "../auth";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  active?: boolean | null;
  mustChangePassword?: boolean | null;
};

export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get("user") as SessionUser | null;
  if (!user) return c.json({ error: "Não autorizado" }, 401);
  if (user.active === false) return c.json({ error: "Usuário desativado" }, 403);
  return next();
});

/** Permite apenas os papéis informados. super_admin passa sempre; sem argumentos, só o super_admin. */
export function requireRole(...roles: Role[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "Não autorizado" }, 401);
    if (user.active === false) return c.json({ error: "Usuário desativado" }, 403);
    const role = (user.role ?? "editor") as Role;
    if (role !== "super_admin" && !roles.includes(role)) {
      return c.json({ error: "Sem permissão para esta área" }, 403);
    }
    return next();
  });
}

export type { SessionUser };
