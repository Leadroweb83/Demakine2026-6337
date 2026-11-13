/**
 * Regra de consentimento de cookies de medição e anúncios (Consent Mode v2 do Google).
 *
 * Sem escolha salva: liberado no Brasil e nos demais países, negado na Europa (EEE, Reino Unido e Suíça), onde o
 * aceite continua obrigatório. "Só os essenciais" nega em qualquer país; "Aceitar todos" libera em qualquer país.
 * Fechar o banner no X NÃO é escolha: vale a regra do país. A região é resolvida pelo próprio Google (os dois comandos
 * `default` abaixo), antes de qualquer tag carregar. Este arquivo não toca no navegador, para poder ser testado.
 */

/** Chave da escolha salva. A "_v2" zera as recusas antigas: quem só fechou o banner no X estava gravado como recusa. */
export const CONSENT_KEY = "demakine_cookie_consent_v2";
const LEGACY_KEY = "demakine_cookie_consent";
const DISMISS_KEY = "demakine_cookie_banner_dismissed";

export type Choice = "all" | "essential";

/** EEE + Reino Unido + Suíça (códigos de país ISO 3166-1, como o Google pede no campo region). */
export const EU_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
] as const;

const FOUR = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"] as const;
type State = Record<(typeof FOUR)[number], "granted" | "denied">;
const all = (v: "granted" | "denied") => Object.fromEntries(FOUR.map((k) => [k, v])) as State;

export const GRANTED: State = all("granted");
export const DENIED: State = all("denied");

export type ConsentCommand = State & { region?: string[]; wait_for_update?: number };

export function parseChoice(value: string | null | undefined): Choice | null {
  return value === "all" || value === "essential" ? value : null;
}

/**
 * Os comandos `consent default` a enviar antes de carregar as tags. O primeiro, com region, vale só para a Europa e
 * tem prioridade; o segundo, sem region, vale para o resto do mundo.
 */
export function consentDefaults(choice: Choice | null): ConsentCommand[] {
  if (choice === "essential") return [{ ...DENIED, wait_for_update: 500 }];
  if (choice === "all") return [{ ...GRANTED }];
  return [{ ...DENIED, region: [...EU_REGIONS], wait_for_update: 500 }, { ...GRANTED }];
}

/**
 * Podem ir dados de contato (e-mail e telefone com hash) para as conversões otimizadas do Google Ads?
 * Sim quando o consentimento está liberado: aceitou, ou não escolheu e não está na Europa. Na Europa o Google já
 * descarta o dado enquanto o consentimento estiver negado; aqui só se evita nem tentar.
 */
export function adsDataAllowed(choice: Choice | null, inEurope: boolean): boolean {
  if (choice === "essential") return false;
  if (choice === "all") return true;
  return !inEurope;
}

/** Palpite de que a pessoa está na Europa, pelo fuso do aparelho. Só serve para não tentar enviar dado pessoal. */
export function looksLikeEurope(timeZone?: string): boolean {
  try {
    const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return tz.startsWith("Europe/") || tz === "Atlantic/Reykjavik";
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ armazenamento (só no navegador) */

function store(kind: "local" | "session"): Storage | null {
  try {
    return typeof window === "undefined" ? null : kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null; // armazenamento bloqueado
  }
}

/** Escolha salva, ou null se a pessoa ainda não escolheu. Apaga de passagem a chave antiga (sem a "_v2"). */
export function readChoice(): Choice | null {
  const s = store("local");
  if (!s) return null;
  try {
    s.removeItem(LEGACY_KEY);
    return parseChoice(s.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
}

export function saveChoice(choice: Choice) {
  try {
    store("local")?.setItem(CONSENT_KEY, choice);
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
}

/** O X do banner: esconde o banner nesta visita, sem registrar escolha nenhuma. */
export function dismissBanner() {
  try {
    store("session")?.setItem(DISMISS_KEY, "1");
  } catch {
    /* sem armazenamento: o banner volta na próxima página, e tudo bem */
  }
}

export function bannerDismissed(): boolean {
  try {
    return store("session")?.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}
