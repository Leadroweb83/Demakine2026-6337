import { classifySource } from "./traffic";

/**
 * Medição própria de visitas (painel > Visitas). Sem cookie: manda só a página, de onde a pessoa
 * veio e a largura da tela; o servidor calcula aparelho, cidade e o visitante do dia sem guardar IP.
 * A origem da primeira página da visita fica na aba (sessionStorage) para ir junto com o lead.
 */
const KEY = "dm_visita";

/** valor dos identificadores de clique da entrada (anúncio): o time precisa deles para subir conversões ao Google Ads */
export type ClickIds = Partial<Record<"gclid" | "gbraid" | "wbraid" | "fbclid", string>>;

export type VisitAttribution = { source: string; landing: string; campaign: string | null; clickIds?: ClickIds };

let current: VisitAttribution | null = null;

function readStored(): VisitAttribution | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as VisitAttribution) : null;
  } catch {
    return null;
  }
}

/** Origem da visita atual, para gravar no lead (orçamento). */
export function visitAttribution(): VisitAttribution | null {
  return current ?? readStored();
}

const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid", "fbclid"] as const;

function readClickIds(params: URLSearchParams): ClickIds | undefined {
  const ids: ClickIds = {};
  for (const k of CLICK_ID_KEYS) {
    const v = params.get(k)?.trim();
    if (v) ids[k] = v.slice(0, 200);
  }
  return Object.keys(ids).length ? ids : undefined;
}

let lastPath = "";

/** Uma página vista. Chamado na abertura e a cada troca de página dentro do site. */
export function recordView(path: string) {
  if (typeof window === "undefined" || path.startsWith("/admin") || path === lastPath) return;
  lastPath = path;
  const stored = readStored();
  const entry = !stored && !current;
  const params = new URLSearchParams(location.search);
  const utm = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
  };
  const gclid = params.has("gclid") || params.has("gbraid") || params.has("wbraid");
  const fbclid = params.has("fbclid");
  if (entry) {
    current = {
      source: classifySource({
        referrer: document.referrer,
        utmSource: utm.source,
        utmMedium: utm.medium,
        gclid,
        fbclid,
        ownHost: location.hostname,
      }),
      landing: path,
      campaign: utm.campaign,
      clickIds: readClickIds(params),
    };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* aba sem armazenamento: a origem vale só até recarregar */
    }
  }
  const body = JSON.stringify({
    path,
    entry,
    referrer: entry ? document.referrer : null,
    utm: entry ? utm : null,
    gclid: entry && gclid,
    fbclid: entry && fbclid,
    w: window.innerWidth,
  });
  try {
    if (!navigator.sendBeacon?.("/api/v", new Blob([body], { type: "text/plain" }))) {
      void fetch("/api/v", { method: "POST", body, keepalive: true }).catch(() => undefined);
    }
  } catch {
    /* medição nunca pode atrapalhar o site */
  }
}
