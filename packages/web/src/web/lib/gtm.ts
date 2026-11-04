/**
 * Google Tag Manager (GTM-W4686GTS) e Google Analytics 4 (G-4E4C8CCSVE).
 *
 * O GTM carrega a tag da Mailbiz (botão flutuante de WhatsApp) e, quando publicadas lá, as tags do
 * Google Ads. O GA4 é carregado direto daqui (gtag.js) para não depender da publicação do contêiner.
 * ATENÇÃO: se a tag "GA4 - Google tag" (G-4E4C8CCSVE) for publicada no GTM, apague o GA4 daqui
 * (GA4_ID e o bloco em loadTags), senão cada visita conta duas vezes.
 *
 * Consentimento (Consent Mode v2): tudo nasce negado e vira concedido quando o visitante aceita o
 * banner de cookies. O /admin não carrega o GTM.
 */
const GTM_ID = "GTM-W4686GTS";
const GA4_ID = "G-4E4C8CCSVE";

/** Mesma chave do banner (components/cookie-consent.tsx). */
const CONSENT_KEY = "demakine_cookie_consent";

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
  addScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  // GTM
  win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  addScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
}

/** Na abertura do site: consentimento negado (ou concedido, se já aceitou antes) e GTM carregado. */
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
  // quem abriu direto no /admin e depois foi para o site ainda não tem o GTM
  loadTags();
  // o GTM usa este evento para liberar tags que dependem de consentimento
  const win = w();
  if (win && !isAdmin()) win.dataLayer?.push({ event: "consent_update", consent_ads: next ? "granted" : "denied" });
}
