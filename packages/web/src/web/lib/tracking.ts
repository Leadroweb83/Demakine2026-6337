/**
 * Medição do site: Google Tag Manager (GTM-W4686GTS) com GA4 e Google Ads dentro dele.
 *
 * O código só carrega o GTM e empurra eventos no dataLayer; as tags do GA4 e do Google Ads
 * (conversões "Formulário Novo" e "Whatsapp Novo") vivem no contêiner do GTM. Por isso este arquivo
 * NÃO carrega mais o gtag.js do Ads (carregar nos dois lugares duplica a tag Google).
 *
 * Consentimento (Consent Mode v2): tudo nasce negado e vira concedido no aceite do banner. O painel
 * (/admin) não é medido.
 *
 * Regra de contagem (definida pelo cliente):
 *  - Formulário Novo: conta quando a página de obrigado carrega depois de um envio com sucesso
 *    (`queueLead` guarda a pendência, `fireLeadOnThankYou` consome uma vez). Recarregar, voltar no
 *    navegador ou abrir /obrigado direto NÃO conta.
 *  - Whatsapp Novo: envio do pop-up do botão flutuante da Mailbiz. Medido só pelo GTM (tag
 *    "Listener - WhatsApp flutuante (Mailbiz)"); nada a fazer aqui.
 *  - Outros links de WhatsApp e telefone: eventos whatsapp_click e phone_click, só no GA4.
 *  - Kit do comprador (downloads:kit): evento download_kit, não conta como conversão.
 */
const GTM_ID = "GTM-W4686GTS";

// Quando o GTM Server-Side estiver no ar, troque por o domínio próprio (ex.: https://sst.demakine.com.br).
const GTM_HOST = "https://www.googletagmanager.com";

/** Mesma chave do banner (components/cookie-consent.tsx). */
const CONSENT_KEY = "demakine_cookie_consent";

type Dict = Record<string, unknown>;
type TrackWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

let gtmLoaded = false;
let consentGranted = false;

const w = () => (typeof window === "undefined" ? null : (window as TrackWindow));
const isAdmin = () => w()?.location.pathname.startsWith("/admin") ?? true;

// o gtag.js espera o objeto "arguments" no dataLayer, não um array: por isso function e não arrow
function gtag(..._args: unknown[]) {
  const win = w();
  if (!win) return;
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push(arguments);
}

function loadGtm() {
  const win = w();
  if (!win || gtmLoaded || isAdmin()) return;
  gtmLoaded = true;
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.async = true;
  s.src = `${GTM_HOST}/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

/** Identificador único de um envio (vai ao servidor e ao GTM, para não contar a mesma conversão duas vezes). */
export function newEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/** Evento para o GTM. Sem aceite de cookies, o Google recebe só o sinal anônimo do Modo de Consentimento. */
export function pushEvent(event: string, params: Dict = {}) {
  const win = w();
  if (!win || isAdmin()) return;
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...params });
}

/** Nome antigo, usado por vários componentes (page_view_spa, job_application, vídeos). */
export const track = pushEvent;

/**
 * Na abertura do site: consentimento negado por padrão (ou concedido, se o visitante já aceitou
 * numa visita anterior) e GTM carregado na hora.
 */
export function initTracking() {
  const win = w();
  if (!win) return;
  win.dataLayer = win.dataLayer ?? [];
  win.gtag = gtag;

  let stored: string | null = null;
  try {
    stored = win.localStorage.getItem(CONSENT_KEY);
  } catch {
    /* armazenamento bloqueado: segue negado */
  }
  consentGranted = stored === "all";

  gtag("consent", "default", consentGranted ? GRANTED : { ...DENIED, wait_for_update: 500 });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);

  loadGtm();
  bindClickTracking();
}

/** Escolha feita no banner de cookies ("all" = aceitar tudo). */
export function updateConsent(choice: string) {
  const granted = choice === "all";
  if (granted !== consentGranted) gtag("consent", "update", granted ? GRANTED : DENIED);
  consentGranted = granted;
  // quem abriu direto no /admin e depois foi para o site ainda não tem o GTM
  loadGtm();
  // o GTM usa este evento para liberar tags que dependem de consentimento
  pushEvent("consent_update", { consent_ads: granted ? "granted" : "denied" });
}

/* ------------------------------------------------------------------ */
/* Conversão pendente: guardada no envio, consumida uma vez no obrigado */
/* ------------------------------------------------------------------ */

const LEAD_KEY = "dm_lead_pending";
const PENDING_TTL_MS = 10 * 60 * 1000; // a pendência expira em 10 minutos

function savePending(key: string, data: Dict) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...data, _ts: Date.now() }));
  } catch {
    /* sem armazenamento, sem conversão: melhor que contar errado */
  }
}

/** Lê e APAGA a pendência (uso único). */
function consumePending(key: string): Dict | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    localStorage.removeItem(key);
    const data = JSON.parse(raw) as Dict & { _ts?: number };
    if (!data._ts || Date.now() - data._ts > PENDING_TTL_MS) return null;
    delete data._ts;
    return data;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Cliques em WhatsApp (wa.me) e telefone: só GA4                       */
/* (o botão flutuante da Mailbiz é medido pelo GTM, não por aqui)       */
/* ------------------------------------------------------------------ */

/**
 * click_location: `data-track-location="header|footer|produto|contato|blog"` no link ou num pai.
 * Sem o atributo, vale o primeiro bloco encontrado. "floating" é reservado ao botão da Mailbiz.
 */
function clickLocation(el: Element): string {
  const tagged = el.closest("[data-track-location]");
  if (tagged) return tagged.getAttribute("data-track-location") ?? "unknown";
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("form, #formulario")) return "form";
  return "content";
}

// wa.me/<número> ou api.whatsapp.com/send; ignora wa.me/?text= (botão de compartilhar do blog)
const WA_LINK = /^https:\/\/(wa\.me\/\d|api\.whatsapp\.com\/send)/;

let clickBound = false;
function bindClickTracking() {
  if (clickBound) return;
  clickBound = true;
  const handler = (e: MouseEvent) => {
    if (e.type === "auxclick" && e.button !== 1) return; // só o botão do meio (nova aba)
    const a = (e.target as Element | null)?.closest?.("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") ?? "";
    const base = {
      event_id: newEventId(),
      page_path: location.pathname,
      origin_path: location.pathname,
      click_location: clickLocation(a),
    };
    if (WA_LINK.test(href)) pushEvent("whatsapp_click", base);
    else if (href.startsWith("tel:")) pushEvent("phone_click", base);
  };
  document.addEventListener("click", handler, { capture: true });
  document.addEventListener("auxclick", handler, { capture: true });
}

/* ------------------------------------------------------------------ */
/* Lead (formulário): sucesso no POST → /obrigado → generate_lead       */
/* ------------------------------------------------------------------ */

type LeadForm = {
  name: string;
  company?: string;
  phone: string;
  email: string;
  city?: string;
  uf?: string;
};

/** Normaliza telefone brasileiro para E.164 (+55DDDNUMERO). */
export function toE164BR(raw: string): string | undefined {
  let d = raw.replace(/\D/g, "");
  if (!d) return undefined;
  d = d.replace(/^0+/, "");
  if (!d.startsWith("55") || d.length <= 11) d = `55${d}`;
  return d.length >= 12 && d.length <= 13 ? `+${d}` : undefined;
}

function buildUserData(f: LeadForm, country: string | undefined) {
  const [first, ...rest] = f.name.trim().split(/\s+/);
  return {
    email: f.email.trim().toLowerCase(),
    phone_number: country === "BR" ? toE164BR(f.phone) : undefined,
    address: {
      first_name: first?.toLowerCase(),
      last_name: rest.join(" ").toLowerCase() || undefined,
      city: f.city?.trim().toLowerCase() || undefined,
      region: f.uf?.trim().toLowerCase() || undefined,
      country,
    },
  };
}

/**
 * Chamar no onSuccess do envio, logo antes de navegar para a página de obrigado. Devolve o caminho
 * da página de obrigado SEM prefixo de idioma (o roteador do site já põe /en ou /es); quem navega com
 * `window.location` precisa somar o prefixo (formulário de exportação).
 *
 * Todo formulário que conta como "Formulário Novo" precisa passar por aqui e ir ao obrigado.
 */
export function queueLead(opts: {
  form: LeadForm;
  source: string;
  product?: string | null;
  eventId: string;
  /** "BR" no site em português; nos formulários export-* fica vazio */
  country?: string;
}): string {
  const isExport = opts.source.startsWith("export-");
  const country = opts.country ?? (isExport ? undefined : "BR");
  savePending(LEAD_KEY, {
    event_id: opts.eventId,
    form_source: opts.source,
    product: opts.product ?? null,
    lead_type: isExport ? "export" : "orcamento",
    origin_path: location.pathname,
    user_data: buildUserData(opts.form, country),
  });
  return `/obrigado?origem=${encodeURIComponent(opts.source)}`;
}

/**
 * Chamar ao montar a página de obrigado. Só envia `generate_lead` se existir um envio real pendente.
 * Sem aceite dos cookies, os dados pessoais (e-mail, telefone) nem entram no dataLayer: o Google não
 * poderia usá-los e não há por que expô-los às outras tags do contêiner.
 */
export function fireLeadOnThankYou() {
  const pending = consumePending(LEAD_KEY);
  if (!pending) return;
  if (!consentGranted) delete pending.user_data;
  pushEvent("generate_lead", { ...pending, page_path: location.pathname });
}

/**
 * Kit do comprador industrial (source "downloads:kit"): NÃO conta como Formulário Novo (decisão do
 * cliente). Evento secundário só no GA4; o formulário continua mostrando os links na própria tela.
 */
export function trackKitDownload(opts: { source: string; product?: string | null; eventId: string }) {
  pushEvent("download_kit", {
    event_id: opts.eventId,
    form_source: opts.source,
    product: opts.product ?? null,
    page_path: location.pathname,
  });
}
