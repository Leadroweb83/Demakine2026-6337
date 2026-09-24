/**
 * Medição: Google Tag Manager (GTM-W4686GTS) e tag do Google Ads (AW-969480580).
 *
 * LGPD: nada do Google carrega antes de o visitante aceitar no banner de cookies ("Aceitar").
 * O Modo de Consentimento v2 já nasce negado e só vira "concedido" no aceite; quem recusa não
 * manda nada. O painel (/admin) não é medido.
 *
 * A tag do Google Ads está aqui no código: não crie a mesma tag dentro do GTM (contaria em dobro).
 * Eventos para o GTM/GA4 e conversões do Ads: page_view_spa, generate_lead, job_application,
 * whatsapp_click e phone_click (dataLayer).
 */
export const GTM_ID = "GTM-W4686GTS";
export const ADS_ID = "AW-969480580";

type DataLayer = unknown[];
type TrackWindow = Window & { dataLayer?: DataLayer; gtag?: (...args: unknown[]) => void };

const w = () => (typeof window === "undefined" ? null : (window as TrackWindow));
let loaded = false;

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};
const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

// o gtag.js espera o objeto "arguments" no dataLayer, não um array: por isso function e não arrow
function gtag(..._args: unknown[]) {
  const win = w();
  if (!win) return;
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push(arguments);
}

function isAdmin() {
  return w()?.location.pathname.startsWith("/admin") ?? true;
}

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Carrega GTM e Google Ads (uma vez), já com o consentimento concedido. */
function load() {
  const win = w();
  if (!win || loaded || isAdmin()) return;
  loaded = true;
  win.gtag = gtag;
  gtag("consent", "update", GRANTED);
  win.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
  addScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  gtag("js", new Date());
  gtag("config", ADS_ID);
  addScript(`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`);
}

/** Mesma chave do banner (components/cookie-consent.tsx). */
const CONSENT_KEY = "demakine_cookie_consent";

/** Na abertura do site: consentimento negado por padrão; se o visitante já aceitou antes, carrega. */
export function initTracking() {
  const win = w();
  if (!win) return;
  win.dataLayer = win.dataLayer ?? [];
  gtag("consent", "default", { ...DENIED, wait_for_update: 500 });
  let consent: string | null = null;
  try {
    consent = win.localStorage.getItem(CONSENT_KEY);
  } catch {
    /* armazenamento bloqueado: fica sem medição */
  }
  if (consent === "all") load();
  listenContactClicks();
}

/** Escolha feita no banner de cookies. */
export function applyConsent(choice: "all" | "essential") {
  if (choice === "all") load();
  else if (loaded) gtag("consent", "update", DENIED);
}

/** Evento para o GTM (só sai se o visitante aceitou: antes disso o GTM nem existe). */
export function track(event: string, params: Record<string, unknown> = {}) {
  const win = w();
  if (!win || !loaded || isAdmin()) return;
  win.dataLayer!.push({ event, ...params });
}

let listening = false;
/** Clique em WhatsApp e telefone: muito pedido de orçamento sai por aí, não pelo formulário. */
function listenContactClicks() {
  if (listening) return;
  listening = true;
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) track("whatsapp_click", { page_path: location.pathname });
      else if (href.startsWith("tel:")) track("phone_click", { page_path: location.pathname });
    },
    { capture: true },
  );
}
