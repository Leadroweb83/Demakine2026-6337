import { site } from "./site";

/**
 * Página de exportação (/export): existe só em espanhol e inglês, uma apontando para a outra.
 * As demais páginas declaram os três idiomas sozinhas (components/seo.tsx).
 */
export const EXPORT_ALTERNATES = [
  { hreflang: "es", href: `${site.url}/export?lang=es` },
  { hreflang: "en", href: `${site.url}/export?lang=en` },
  { hreflang: "x-default", href: `${site.url}/export?lang=en` },
];
