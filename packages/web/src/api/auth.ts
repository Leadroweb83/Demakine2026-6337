import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "./database";
import { trustedOriginList } from "./lib/origins";

/** Papéis do painel Demakine. */
export const ROLES = ["super_admin", "admin", "editor", "vendedor", "rh"] as const;
export type Role = (typeof ROLES)[number];

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    // Ninguém se cadastra sozinho: o super admin cria os usuários no painel.
    disableSignUp: true,
    minPasswordLength: 8,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "editor", input: false },
      active: { type: "boolean", required: false, defaultValue: true, input: false },
      mustChangePassword: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  // só o próprio site e os domínios oficiais: confiar em qualquer origem desligaria a defesa contra CSRF
  trustedOrigins: (request) => trustedOriginList(request),
  // cookie de sessão: só HTTPS em produção, nunca legível por script e não vai em pedido entre sites
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
  },
  plugins: [bearer()],
});
