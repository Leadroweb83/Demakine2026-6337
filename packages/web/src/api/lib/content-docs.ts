import type { Role } from "../auth";

/** Coleções editáveis e quem pode salvar cada uma (super admin sempre pode). */
export const CONTENT_COLLECTIONS: Record<string, Role[]> = {
  site: ["admin"],
  produto: ["admin", "editor"],
  post: ["admin", "editor"],
  case: ["admin", "editor"],
};

export const CONTENT_KEY_RE = /^[a-z0-9-]{1,100}$/;
export const CONTENT_MAX_BYTES = 200_000;

export function canEditCollection(role: string | null | undefined, collection: string) {
  const allowed = CONTENT_COLLECTIONS[collection];
  if (!allowed) return false;
  return role === "super_admin" || allowed.includes((role ?? "") as Role);
}
