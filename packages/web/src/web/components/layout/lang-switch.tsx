import { useLocation, useSearch } from "wouter";
import { LOCALES, isTranslatedPath, locale, localePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Seletor de idioma (PT · EN · ES). Cada opção é um link comum para a mesma página no outro idioma:
 * a troca recarrega a página, o Google segue o link e nada depende de cookie.
 * Página que só existe em português (vagas) leva para a página inicial do idioma escolhido.
 */
export function LangSwitch({ dark = false, className }: { dark?: boolean; className?: string }) {
  const [location] = useLocation();
  const search = useSearch();
  const here = locale();
  const path = isTranslatedPath(location) ? location : "/";
  const query = path === location && search ? `?${search}` : "";

  return (
    <nav aria-label="Idioma / Language / Idioma" translate="no" className={cn("flex items-center gap-0.5", className)}>
      {LOCALES.map((l) => {
        const active = l.code === here;
        return (
          <a
            key={l.code}
            href={`${localePath(path, l.code)}${query}`}
            hrefLang={l.hreflang}
            lang={l.hreflang}
            translate="no"
            title={l.name}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-md px-2 py-1 text-[12px] font-bold tracking-wide transition-colors",
              dark
                ? active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white"
                : active
                  ? "bg-dm-blue-soft text-dm-blue"
                  : "text-dm-ink/55 hover:text-dm-blue",
            )}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
