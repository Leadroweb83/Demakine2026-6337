import { site } from "./site";

/**
 * Grupo de idiomas do site: home em português e a página de exportação em espanhol e inglês.
 * As três páginas declaram o mesmo grupo (o Google ignora o par quando um lado não aponta de volta).
 */
export const LANGUAGE_ALTERNATES = [
  { hreflang: "pt-BR", href: `${site.url}/` },
  { hreflang: "es", href: `${site.url}/export?lang=es` },
  { hreflang: "en", href: `${site.url}/export?lang=en` },
  { hreflang: "x-default", href: `${site.url}/export?lang=en` },
];
