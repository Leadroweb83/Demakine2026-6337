/**
 * Idiomas do site: português na raiz, inglês em /en e espanhol em /es.
 *
 * O texto do código continua em português. Fora do português, cada texto é trocado pela tradução
 * na hora de desenhar (ver i18n-jsx/jsx-runtime.ts), usando um dicionário "texto em português ->
 * tradução" (pasta i18n/). Texto sem tradução aparece em português, então nada quebra enquanto
 * uma frase nova ainda não foi traduzida.
 *
 * O idioma vem do endereço e não muda sem recarregar a página: trocar de idioma é um link comum.
 */
export type Locale = "pt" | "en" | "es";

export const LOCALES: { code: Locale; label: string; name: string; hreflang: string; prefix: string }[] = [
  { code: "pt", label: "PT", name: "Português", hreflang: "pt-BR", prefix: "" },
  { code: "en", label: "EN", name: "English", hreflang: "en", prefix: "/en" },
  { code: "es", label: "ES", name: "Español", hreflang: "es", prefix: "/es" },
];

type State = {
  locale: Locale;
  dict: Record<string, string>;
  /** só na conferência do build: textos que passaram pela tela sem tradução */
  misses?: Set<string>;
  /** traduções já entregues (um texto traduzido passa de novo pelo desenho; não é falta) */
  done?: Set<string>;
};

const g = globalThis as { __DM_I18N__?: State };

export function setLocale(locale: Locale, dict: Record<string, string>, collect = false) {
  if (locale === "pt") {
    g.__DM_I18N__ = undefined;
    return;
  }
  g.__DM_I18N__ = { locale, dict, ...(collect ? { misses: new Set<string>(), done: new Set(Object.values(dict)) } : {}) };
}

export const i18nState = () => g.__DM_I18N__;
export const locale = (): Locale => g.__DM_I18N__?.locale ?? "pt";
export const localeInfo = (code: Locale = locale()) => LOCALES.find((l) => l.code === code)!;
export const localePrefix = (code: Locale = locale()) => localeInfo(code).prefix;
/** Formato de número e data do idioma (vírgula ou ponto decimal, nome do mês). */
export const formatLocale = () => ({ pt: "pt-BR", en: "en-US", es: "es-ES" })[locale()];

/** "/en/produtos/x" -> { locale: "en", path: "/produtos/x" } */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(/^\/(en|es)(?=\/|$)(.*)$/);
  if (!m) return { locale: "pt", path: pathname || "/" };
  return { locale: m[1] as Locale, path: m[2] || "/" };
}

/** Páginas que só existem em português (vagas, loja, painel, página de exportação). */
const PT_ONLY = /^\/(vagas|trabalhe-conosco|loja|admin|export)(\/|$|\?)/;
export const isTranslatedPath = (path: string) => !PT_ONLY.test(path);

/** Arquivos e serviços: endereço igual em qualquer idioma. */
const NOT_A_PAGE = /^\/(img|video|downloads|assets|api|fonts)\/|\.[a-z0-9]{2,5}($|\?)/i;

/** Endereço de uma página do site no idioma dado ("/produtos" -> "/en/produtos"). */
export function localePath(path: string, code: Locale = locale()) {
  const prefix = localePrefix(code);
  if (!prefix || !isTranslatedPath(path)) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

/** Link interno escrito à mão (<a href="/agro">) ganha o prefixo do idioma. */
export function localHref(href: string) {
  const st = g.__DM_I18N__;
  if (!st || !href.startsWith("/") || href.startsWith("//") || NOT_A_PAGE.test(href)) return href;
  const prefix = localePrefix(st.locale);
  if (href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}?`) || href.startsWith(`${prefix}#`)) return href;
  return localePath(href, st.locale);
}

const HAS_WORD = /[A-Za-zÀ-ÿ]{2}/;

function lookup(st: State, text: string) {
  const start = text.length - text.trimStart().length;
  const core = text.trim();
  if (!core) return text;
  const hit = st.dict[core];
  if (hit !== undefined) return start || core.length !== text.length ? text.slice(0, start) + hit + text.slice(start + core.length) : hit;
  if (st.misses && HAS_WORD.test(core) && !st.done!.has(core)) st.misses.add(core);
  return text;
}

/**
 * Traduz um texto. Com variáveis, a chave é o molde: tr("Mais de {n} equipamentos", { n: 21 }).
 * Use para texto que não vira elemento na tela (título da página, mensagem de WhatsApp, molde com número).
 */
export function tr(text: string, vars?: Record<string, string | number>) {
  const st = g.__DM_I18N__;
  const out = st ? lookup(st, text) : text;
  const filled = vars ? out.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : out;
  // o texto pronto ainda passa pelo desenho da tela: não é texto sem tradução
  st?.done?.add(filled.trim());
  return filled;
}

/** Traduz os textos de uma estrutura (dados estruturados, listas), sem mexer em endereços e chaves. */
export function trDeep<T>(value: T): T {
  const st = g.__DM_I18N__;
  if (!st) return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return /^(https?:|\/|#|mailto:|tel:)/.test(v) ? v : lookup(st, v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k.startsWith("@") ? x : walk(x)]));
    return v;
  };
  return walk(value) as T;
}

/** Propriedades de texto que o navegador mostra ou lê em voz alta. */
const TEXT_ATTRS = ["alt", "title", "placeholder", "aria-label"] as const;

function children(st: State, c: unknown): unknown {
  if (typeof c === "string") return lookup(st, c);
  if (Array.isArray(c)) {
    let changed = false;
    const out = c.map((x) => {
      const y = typeof x === "string" || Array.isArray(x) ? children(st, x) : x;
      if (y !== x) changed = true;
      return y;
    });
    return changed ? out : c;
  }
  return c;
}

/** Chamado pelo desenho de cada elemento (i18n-jsx): troca filhos de texto, atributos de texto e links. */
export function localizeProps(type: unknown, props: Record<string, unknown> | null | undefined) {
  const st = g.__DM_I18N__;
  // translate="no" (atributo padrão do HTML): o elemento fica como está, texto e link
  if (!st || !props || props.translate === "no") return props;
  let next: Record<string, unknown> | null = null;
  const set = (k: string, v: unknown) => {
    next ??= { ...props };
    next[k] = v;
  };
  if (props.children != null) {
    const c = children(st, props.children);
    if (c !== props.children) set("children", c);
  }
  for (const a of TEXT_ATTRS) {
    const v = props[a];
    if (typeof v === "string" && v) {
      const t = lookup(st, v);
      if (t !== v) set(a, t);
    }
  }
  if (type === "a" && typeof props.href === "string") {
    const h = localHref(props.href);
    if (h !== props.href) set("href", h);
  }
  return next ?? props;
}

/** Dicionário do idioma (no navegador): um arquivo por idioma, baixado só por quem abre /en ou /es. */
export async function loadDict(code: Locale): Promise<Record<string, string>> {
  if (code === "en") return (await import("../i18n/en")).default;
  if (code === "es") return (await import("../i18n/es")).default;
  return {};
}
