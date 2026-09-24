/**
 * De onde veio a visita. Usado no navegador (atribuição do lead) e na API (medição de visitas),
 * então precisa dar o mesmo resultado nos dois lados.
 */
export type TrafficInput = {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  /** gclid / gbraid / wbraid: clique em anúncio do Google */
  gclid?: boolean;
  /** fbclid: clique vindo do Facebook/Instagram */
  fbclid?: boolean;
  /** domínio do próprio site: navegação interna não é origem */
  ownHost?: string;
};

export const SOURCE_LABELS: Record<string, string> = {
  "anuncio-google": "Anúncio Google",
  "anuncio-meta": "Anúncio Meta",
  google: "Google (busca)",
  bing: "Bing",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  email: "E-mail",
  direto: "Direto",
  "outros-sites": "Outros sites",
};

const HOSTS: [RegExp, string][] = [
  // gemini antes de google: gemini.google.com também casa com "google."
  [/(^|\.)gemini\.google\.com$/, "gemini"],
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|m\.facebook\.com|l\.facebook\.com)$/, "facebook"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(mail\.|outlook\.|webmail)/, "email"],
];

const PAID = /^(cpc|ppc|paid|pago|ads?|display|paidsocial|paid_social|cpm)$/i;

export function hostOf(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/** Nome curto da origem (chave de SOURCE_LABELS ou o utm_source cru, em minúsculas). */
export function classifySource(input: TrafficInput): string {
  const utm = (input.utmSource ?? "").trim().toLowerCase();
  const medium = (input.utmMedium ?? "").trim().toLowerCase();
  if (input.gclid || (/google/.test(utm) && PAID.test(medium))) return "anuncio-google";
  if ((/facebook|instagram|meta|fb|ig/.test(utm) && PAID.test(medium)) || (input.fbclid && PAID.test(medium))) return "anuncio-meta";
  if (utm) {
    for (const [re, key] of HOSTS) if (re.test(`${utm}.com`) || utm === key) return key;
    return utm.slice(0, 40);
  }
  const host = hostOf(input.referrer);
  if (!host || (input.ownHost && host === input.ownHost.replace(/^www\./, ""))) return input.fbclid ? "facebook" : "direto";
  for (const [re, key] of HOSTS) if (re.test(host)) return key;
  return input.fbclid ? "facebook" : "outros-sites";
}

export function sourceLabel(key: string) {
  return SOURCE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}
