/**
 * Medição do site: Google Tag Manager (GTM-W4686GTS), Google Analytics 4 (G-4E4C8CCSVE) e
 * Google Ads (AW-969480580), com as duas conversões.
 *
 * O GTM carrega a tag da Mailbiz (botão flutuante de WhatsApp). GA4, tag base do Ads e as conversões
 * são enviados direto daqui (gtag.js), sem depender do que está publicado no contêiner.
 *
 * Regra de contagem (definida pelo cliente):
 *  - Formulário Novo (Ads, rótulo gpVZCPen--gYEISzpM4D): conta quando a página de obrigado carrega
 *    depois de um envio com sucesso (`queueLead` guarda a pendência, `fireLeadOnThankYou` consome uma
 *    vez). Recarregar, voltar no navegador ou abrir /obrigado direto NÃO conta.
 *  - Whatsapp Novo (Ads, rótulo Er2mCPKx--gYEISzpM4D): envio válido do pop-up "Iniciar conversa" do
 *    botão flutuante da Mailbiz (o evento `submit` do navegador só ocorre com os campos válidos).
 *  - Kit do comprador (downloads:kit): evento download_kit no GA4, não conta como conversão.
 *
 * ATENÇÃO, contagem em dobro: se o GTM publicar "GA4 - Google tag", "Google Ads - Google tag
 * (AW-969480580)", as conversões 210/211 ou o "Listener - WhatsApp flutuante (Mailbiz)", apague o item
 * correspondente daqui.
 *
 * Consentimento (Consent Mode v2): tudo nasce negado e vira concedido no aceite do banner. Dados
 * pessoais (conversões otimizadas) só são enviados com aceite. O /admin não é medido.
 */
const GTM_ID = "GTM-W4686GTS";
const GA4_ID = "G-4E4C8CCSVE";
const ADS_ID = "AW-969480580";
const ADS_LABEL_FORM = "gpVZCPen--gYEISzpM4D";
const ADS_LABEL_WHATSAPP = "Er2mCPKx--gYEISzpM4D";

/** Mesma chave do banner (components/cookie-consent.tsx). */
const CONSENT_KEY = "demakine_cookie_consent";

type Dict = Record<string, unknown>;
type GtmWindow = Window & { dataLayer?: unknown[] };

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

let loaded = false;
let granted = false;

const w = () => (typeof window === "undefined" ? null : (window as GtmWindow));
const isAdmin = () => w()?.location.pathname.startsWith("/admin") ?? true;

// o gtag.js espera o objeto "arguments" no dataLayer, não um array: por isso function e não arrow
function gtag(..._args: unknown[]) {
  const win = w();
  if (!win) return;
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push(arguments);
}

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadTags() {
  const win = w();
  if (!win || loaded || isAdmin()) return;
  loaded = true;
  win.dataLayer = win.dataLayer ?? [];
  // GA4: as páginas trocadas dentro do site (SPA) são contadas pela medição otimizada do próprio GA4
  gtag("js", new Date());
  gtag("config", GA4_ID);
  gtag("config", ADS_ID, { allow_enhanced_conversions: true });
  addScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  // GTM
  win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  addScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  bindMailbizListener();
}

/** Na abertura do site: consentimento negado (ou concedido, se já aceitou antes) e tags carregadas. */
export function initGtm() {
  const win = w();
  if (!win) return;
  win.dataLayer = win.dataLayer ?? [];

  let stored: string | null = null;
  try {
    stored = win.localStorage.getItem(CONSENT_KEY);
  } catch {
    /* armazenamento bloqueado: segue negado */
  }
  granted = stored === "all";

  gtag("consent", "default", granted ? GRANTED : { ...DENIED, wait_for_update: 500 });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);
  loadTags();
}

/** Escolha feita no banner de cookies ("all" = aceitar tudo). */
export function updateConsent(choice: string) {
  const next = choice === "all";
  if (next !== granted) gtag("consent", "update", next ? GRANTED : DENIED);
  granted = next;
  // quem abriu direto no /admin e depois foi para o site ainda não tem as tags
  loadTags();
  const win = w();
  if (win && !isAdmin()) win.dataLayer?.push({ event: "consent_update", consent_ads: next ? "granted" : "denied" });
}

/** Identificador único de um envio (vai ao servidor e à medição, para não contar a mesma conversão duas vezes). */
export function newEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/* ------------------------------------------------------------------ */
/* Dados do contato para conversões otimizadas (só com aceite)         */
/* ------------------------------------------------------------------ */

type LeadForm = {
  name: string;
  company?: string;
  phone: string;
  email: string;
  city?: string;
  uf?: string;
};

type UserData = {
  email?: string;
  phone_number?: string;
  address: { first_name?: string; last_name?: string; city?: string; region?: string; country?: string };
};

/** Normaliza telefone brasileiro para E.164 (+55DDDNUMERO). */
export function toE164BR(raw: string): string | undefined {
  let d = raw.replace(/\D/g, "");
  if (!d) return undefined;
  d = d.replace(/^0+/, "");
  if (!d.startsWith("55") || d.length <= 11) d = `55${d}`;
  return d.length >= 12 && d.length <= 13 ? `+${d}` : undefined;
}

function buildUserData(f: LeadForm, country: string | undefined): UserData {
  const [first, ...rest] = f.name.trim().split(/\s+/);
  return {
    email: f.email.trim().toLowerCase() || undefined,
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

/** Conversão do Google Ads. Dados pessoais só vão se o visitante aceitou os cookies. */
function sendAdsConversion(label: string, eventId: string, userData?: UserData) {
  if (granted && userData) gtag("set", "user_data", userData);
  gtag("event", "conversion", { send_to: `${ADS_ID}/${label}`, transaction_id: eventId });
}

function sendEvent(name: string, params: Dict) {
  if (isAdmin()) return;
  gtag("event", name, params);
}

/* ------------------------------------------------------------------ */
/* Formulário: sucesso no POST → /obrigado → generate_lead + conversão */
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
 * Chamar ao montar a página de obrigado. Só mede se existir um envio real pendente. O GA4 recebe
 * generate_lead sem dado pessoal; o Ads recebe a conversão "Formulário Novo" (e e-mail/telefone
 * só com aceite dos cookies).
 */
export function fireLeadOnThankYou() {
  const pending = consumePending(LEAD_KEY);
  if (!pending) return;
  const { user_data: userData, ...params } = pending as Dict & { user_data?: UserData; event_id: string };
  sendEvent("generate_lead", { ...params, page_path: location.pathname });
  if (!isAdmin()) sendAdsConversion(ADS_LABEL_FORM, params.event_id, userData);
}

/** Kit do comprador industrial (source "downloads:kit"): não conta como Formulário Novo. */
export function trackKitDownload(opts: { source: string; product?: string | null; eventId: string }) {
  sendEvent("download_kit", {
    event_id: opts.eventId,
    form_source: opts.source,
    product: opts.product ?? null,
    page_path: location.pathname,
  });
}

/* ------------------------------------------------------------------ */
/* Botão flutuante de WhatsApp (Mailbiz)                               */
/* ------------------------------------------------------------------ */

const MBZ_BUTTON = "[data-mbz-popup-button]";
const MBZ_WRAPPER = "[data-mbz-button-popup-wrapper], [data-mbz-button-wrapper]";

function mbzField(form: HTMLFormElement, re: RegExp): string {
  for (const el of Array.from(form.querySelectorAll<HTMLInputElement>("input[data-mbz-input]"))) {
    if (re.test(el.placeholder || "")) return el.value.trim();
  }
  return "";
}

let mbzBound = false;
function bindMailbizListener() {
  if (mbzBound) return;
  mbzBound = true;

  // abrir o pop-up: evento secundário (só GA4). Fase de captura = estado ANTES de alternar.
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target as Element | null;
      if (!t?.closest?.(MBZ_BUTTON)) return;
      if (document.body.classList.contains("mbz-popup-opened")) return; // clique para fechar
      sendEvent("whatsapp_popup_open", { widget: "mailbiz", click_location: "floating", page_path: location.pathname });
    },
    true,
  );

  // "Iniciar conversa": o submit só ocorre com todos os campos válidos e a política aceita
  let lastSent = 0;
  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target as HTMLFormElement | null;
      if (!form?.matches?.("[data-mbz-form]") || !form.closest(MBZ_WRAPPER)) return;
      if (Date.now() - lastSent < 3000) return; // clique duplo não conta duas vezes
      lastSent = Date.now();

      const eventId = newEventId();
      const name = mbzField(form, /^nome/i).split(/\s+/);
      const city = mbzField(form, /cidade/i).split(/\s*[/\-,]\s*/);
      const userData: UserData = {
        email: (form.querySelector<HTMLInputElement>("input[type=email]")?.value ?? "").trim().toLowerCase() || undefined,
        phone_number: toE164BR(form.querySelector<HTMLInputElement>("input[type=tel]")?.value ?? ""),
        address: {
          first_name: name[0]?.toLowerCase() || undefined,
          last_name: name.slice(1).join(" ").toLowerCase() || undefined,
          city: city[0]?.toLowerCase() || undefined,
          region: city[1]?.toLowerCase() || undefined,
          country: "BR",
        },
      };
      sendEvent("whatsapp_start_chat", {
        event_id: eventId,
        widget: "mailbiz",
        click_location: "floating",
        page_path: location.pathname,
        origin_path: location.pathname,
      });
      sendAdsConversion(ADS_LABEL_WHATSAPP, eventId, userData);
    },
    true,
  );
}
