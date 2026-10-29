/**
 * Origens que podem chamar a API com cookie: o próprio endereço que recebeu a requisição (o site e a
 * API ficam no mesmo domínio, inclusive nas prévias da Vercel) e os domínios oficiais da Demakine.
 * Qualquer outra origem (outro site tentando usar a sessão de quem está logado) é recusada.
 */
const OFFICIAL = ["https://demakine.com.br", "https://www.demakine.com.br"];
const DEV = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"];

/** origem (esquema + domínio) de onde a requisição chegou, vista pelo servidor */
export function ownOrigins(req: Request): string[] {
  try {
    const u = new URL(req.url);
    const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || u.protocol.replace(":", "");
    const host = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || req.headers.get("host") || u.host;
    return [u.origin, `${proto}://${host}`];
  } catch {
    return [];
  }
}

export function trustedOriginList(req?: Request): string[] {
  const site = process.env.WEBSITE_URL;
  return [
    ...OFFICIAL,
    ...(site ? [site.replace(/\/$/, "")] : []),
    ...(req ? ownOrigins(req) : []),
    ...(process.env.NODE_ENV === "production" ? [] : DEV),
  ];
}

export const isTrustedOrigin = (origin: string, req?: Request) => !!origin && trustedOriginList(req).includes(origin);
