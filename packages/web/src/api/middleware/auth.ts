import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import type { SessionUser } from "./roles";

export { requireAuth, requireRole } from "./roles";
export type { SessionUser } from "./roles";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", (session?.user as SessionUser | undefined) ?? null);
  c.set("session", session?.session ?? null);
  return next();
});
