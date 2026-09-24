import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * Republica o site (novo build com a pré-renderização) quando o conteúdo muda no painel.
 * Usa o Deploy Hook da Vercel em DEPLOY_HOOK_URL; sem ele, nada acontece e o navegador continua
 * redesenhando com o conteúdo novo (main.tsx), só o HTML pré-renderizado fica para o próximo build.
 *
 * Várias edições seguidas não disparam vários builds: no máximo um a cada 60 s. Uma edição que
 * chegue depois de o build ler o banco é pega por afterPrerender, que pede outro build.
 */
const KEY = "publicacao";
const MIN_INTERVAL_MS = 60_000;

type State = { requestedAt?: string; triggeredAt?: string };

/** Rotas do painel cujo resultado aparece nas páginas pré-renderizadas. */
const AFFECTS_SITE = [/^\/api\/admin\/conteudo\//, /^\/api\/admin\/vagas(\/|$)/, /^\/api\/admin\/lixeira\/vaga\//];

export const affectsSite = (path: string) => AFFECTS_SITE.some((re) => re.test(path));

async function readState(): Promise<State> {
  const [row] = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, KEY));
  return (row?.value as State | undefined) ?? {};
}

async function writeState(value: State) {
  await db
    .insert(schema.appSettings)
    .values({ key: KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.appSettings.key, set: { value, updatedAt: new Date() } });
}

async function callHook() {
  const url = process.env.DEPLOY_HOOK_URL;
  if (!url) return false;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, { method: "POST", signal: ctrl.signal });
    return res.ok;
  } catch (err) {
    console.error("[publicacao] deploy hook falhou", err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function requestPublish() {
  const now = new Date();
  const state = await readState();
  state.requestedAt = now.toISOString();
  const last = state.triggeredAt ? new Date(state.triggeredAt).getTime() : 0;
  if (now.getTime() - last >= MIN_INTERVAL_MS && (await callHook())) state.triggeredAt = now.toISOString();
  await writeState(state);
}

/** Fim da pré-renderização: se o painel mudou depois que este build leu o banco, pede outro. */
export async function afterPrerender(buildStartedAt: Date) {
  const state = await readState();
  if (!state.requestedAt || new Date(state.requestedAt) <= buildStartedAt) return;
  if (await callHook()) {
    await writeState({ ...state, triggeredAt: new Date().toISOString() });
    console.log("[prerender] o painel mudou durante o build: novo build pedido");
  }
}
