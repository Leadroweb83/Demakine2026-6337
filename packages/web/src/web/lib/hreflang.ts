import { site } from "./site";

/** Endereços da página de exportação: um por idioma, cada um com a sua URL (e não mais ?lang=). */
export const EXPORT_PATH = { en: "/en/export", es: "/es/exportacion" } as const;

/**
 * Página de exportação: existe só em espanhol e inglês, uma apontando para a outra.
 * As demais páginas declaram os três idiomas sozinhas (components/seo.tsx).
 */
export const EXPORT_ALTERNATES = [
  { hreflang: "es", href: `${site.url}${EXPORT_PATH.es}` },
  { hreflang: "en", href: `${site.url}${EXPORT_PATH.en}` },
  { hreflang: "x-default", href: `${site.url}${EXPORT_PATH.en}` },
];
