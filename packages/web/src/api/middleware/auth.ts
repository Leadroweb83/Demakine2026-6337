import { createMiddleware } from "hono/factory";
import { auth, type Role } from "../auth";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  active?: boolean | null;
  mustChangePassword?: boolean | null;
};

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", (session?.user as SessionUser | undefined) ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get("user") as SessionUser | null;
  if (!user) return c.json({ error: "Não autorizado" }, 401);
  if (user.active === false) return c.json({ error: "Usuário desativado" }, 403);
  return next();
});

/** Permite apenas os papéis informados. super_admin passa sempre. */
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
