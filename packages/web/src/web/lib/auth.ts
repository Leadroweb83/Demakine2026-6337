import { createAuthClient } from "better-auth/react";

const TOKEN_KEY = "demakine_admin_token";

export function getAuthToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignora storage bloqueado */
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignora */
  }
}

/**
 * Login do painel. Usa cookie quando disponivel e tambem guarda o bearer token,
 * porque o preview roda dentro de iframe e o cookie pode ser particionado.
 */
export const authClient = createAuthClient({
  baseURL: typeof window === "undefined" ? undefined : window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: { type: "Bearer", token: () => getAuthToken() },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) setAuthToken(token);
    },
  },
});

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  editor: "Editor",
  vendedor: "Vendedor",
};

export type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  mustChangePassword: boolean;
  image?: string | null;
};

export function can(role: string | undefined, area: "leads" | "conteudo" | "loja" | "config" | "usuarios") {
  const r = role ?? "";
  if (r === "super_admin") return true;
  if (r === "admin") return area !== "usuarios";
  if (r === "vendedor") return area === "leads";
  if (r === "editor") return area === "conteudo";
  return false;
}
