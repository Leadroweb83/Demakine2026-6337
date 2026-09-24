import { createMiddleware } from "hono/factory";
import { db } from "../database";
import * as schema from "../database/schema";
import type { SessionUser } from "../middleware/auth";

/** Rotas que mudam só preferência pessoal ou preparam envio: não entram no registro. */
const SKIP = [/\/admin\/preferences$/, /\/presign$/, /\/admin\/avatar\/presign$/];

const COLLECTION: Record<string, string> = {
  site: "os dados do site",
  produto: "o produto",
  post: "o post",
  case: "o case",
  lista: "a lista",
  seo: "o SEO da página",
  home: "a home",
  layout: "a ordem das seções",
};

const LAYOUT_PAGE: Record<string, string> = { home: "da home", produto: "das páginas de produto" };

/** Só os nomes dos campos enviados: valores (senha, valor de proposta, texto) nunca vão para o registro. */
const FIELD: Record<string, string> = {
  status: "status",
  ownerId: "responsável",
  lossReason: "motivo da perda",
  nextActionAt: "retorno",
  nextActionNote: "retorno",
  proposalValue: "valor",
  notes: "anotações",
  alt: "descrição",
  name: "nome",
  role: "papel",
  active: "ativo",
  deleted: "visibilidade",
};

function fields(keys: string[]) {
  const names = [...new Set(keys.map((k) => FIELD[k]).filter(Boolean))];
  return names.length ? ` (${names.join(", ")})` : "";
}

export function describe(method: string, path: string, body: Record<string, unknown>) {
  const p = path.replace(/^\/api/, "");
  const keys = Object.keys(body);
  let m: RegExpMatchArray | null;

  if ((m = p.match(/^\/admin\/conteudo\/([^/]+)\/([^/]+)$/))) {
    const suffix = m[1] === "site" || m[1] === "home" ? "" : m[1] === "layout" ? LAYOUT_PAGE[m[2]!] ?? m[2] : m[2];
    const what = `${COLLECTION[m[1]!] ?? m[1]} ${suffix}`.trim();
    if (method === "DELETE") return `Voltou ao original ${what}`;
    if (body.deleted === true) return `Ocultou ${what}`;
    return `Editou ${what}`;
  }
  if ((m = p.match(/^\/admin\/leads\/(\d+)\/eventos$/))) {
    return body.type === "contato" ? `Registrou contato no lead #${m[1]}` : `Anotou no lead #${m[1]}`;
  }
  if ((m = p.match(/^\/admin\/leads\/(\d+)$/))) {
    return method === "DELETE" ? `Mandou o lead #${m[1]} para a lixeira` : `Atualizou o lead #${m[1]}${fields(keys)}`;
  }
  if ((m = p.match(/^\/admin\/vagas\/(\d+)$/))) {
    return method === "DELETE" ? `Mandou a vaga #${m[1]} para a lixeira` : `Editou a vaga #${m[1]}${fields(keys)}`;
  }
  if (p === "/admin/vagas") return `Criou a vaga "${String(body.title ?? "").slice(0, 60)}"`;
  if ((m = p.match(/^\/admin\/candidaturas\/(\d+)$/))) {
    return method === "DELETE" ? `Mandou a candidatura #${m[1]} para a lixeira` : `Atualizou a candidatura #${m[1]}${fields(keys)}`;
  }
  if (p === "/admin/midia") return `Enviou a imagem "${String(body.name ?? "").slice(0, 60)}"`;
  if ((m = p.match(/^\/admin\/midia\/(\d+)$/))) {
    return method === "DELETE" ? `Mandou a imagem #${m[1]} para a lixeira` : `Editou a imagem #${m[1]}${fields(keys)}`;
  }
  if (p === "/admin/users") return `Criou o usuário ${String(body.email ?? "")}`;
  if ((m = p.match(/^\/admin\/users\/([^/]+)\/password$/))) return `Trocou a senha de outro usuário`;
  if ((m = p.match(/^\/admin\/users\/([^/]+)$/))) return `Alterou um usuário${fields(keys)}`;
  if (p === "/admin/change-password") return "Trocou a própria senha";
  if (p === "/admin/avatar") return "Trocou a foto de perfil";
  if (p === "/admin/avisos") return "Alterou os avisos por e-mail";
  if (p === "/admin/avisos/teste") return "Enviou um e-mail de teste";
  if ((m = p.match(/^\/admin\/redirecionamentos(?:\/(\d+))?$/))) {
    return method === "DELETE" ? `Apagou o redirecionamento #${m[1]}` : m[1] ? `Editou o redirecionamento #${m[1]}` : `Criou o redirecionamento ${String(body.from ?? "")}`;
  }
  if ((m = p.match(/^\/admin\/lixeira\/([^/]+)\/(\d+)(\/restaurar)?$/))) {
    return m[3] ? `Restaurou da lixeira: ${m[1]} #${m[2]}` : `Apagou de vez da lixeira: ${m[1]} #${m[2]}`;
  }
  return `${method} ${p}`;
}

/** Registra toda alteração bem-sucedida feita no painel. */
export const auditMiddleware = createMiddleware(async (c, next) => {
  await next();
  const method = c.req.method;
  if (method === "GET" || method === "OPTIONS" || method === "HEAD") return;
  const path = c.req.path;
  if (SKIP.some((re) => re.test(path))) return;
  if (c.res.status >= 400) return;
  const user = c.get("user") as SessionUser | null;
  if (!user) return;
  let body: Record<string, unknown> = {};
  try {
    const parsed = await c.req.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
  } catch {
    body = {};
  }
  try {
    await db.insert(schema.auditLog).values({
      userId: user.id,
      userName: user.name,
      userRole: user.role ?? null,
      method,
      path,
      summary: describe(method, path, body).slice(0, 300),
      status: c.res.status,
    });
  } catch (err) {
    console.error("[auditoria] falhou", err);
  }
});
