import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "./database";

/** Papéis do painel Demakine. */
export const ROLES = ["super_admin", "admin", "editor", "vendedor"] as const;
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
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  plugins: [bearer()],
});
