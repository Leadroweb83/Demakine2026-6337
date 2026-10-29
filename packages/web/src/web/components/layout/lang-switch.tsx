import { useLocation, useSearch } from "wouter";
import { LOCALES, isTranslatedPath, locale, localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Seletor de idioma por bandeira (Brasil, EUA, Espanha). Cada opção é um link comum para a mesma página no outro idioma:
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
            aria-label={l.name}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex items-center justify-center rounded-md px-1.5 py-1 transition-[background-color,opacity] max-lg:min-h-10 max-lg:min-w-10",
              active
                ? dark
                  ? "bg-white/15"
                  : "bg-dm-blue-soft"
                : "opacity-55 hover:opacity-100",
            )}
          >
            <Flag code={l.code} />
          </a>
        );
      })}
    </nav>
  );
}

/**
 * Bandeiras desenhadas em SVG: emoji de bandeira não aparece no Windows (vira "BR", "US").
 * Simplificadas para o tamanho de ícone; a da Espanha vai sem o brasão, como a bandeira civil.
 */
function Flag({ code }: { code: Locale }) {
  const svg = "block h-[14px] w-[20px] overflow-hidden rounded-[2px] ring-1 ring-black/10";
  if (code === "pt")
    return (
      <svg viewBox="0 0 20 14" className={svg} aria-hidden="true">
        <rect width="20" height="14" fill="#009c3b" />
        <path d="M10 1.6 18.2 7 10 12.4 1.8 7z" fill="#ffdf00" />
        <circle cx="10" cy="7" r="3.3" fill="#002776" />
        <path d="M6.8 6.3c2.2-.5 4.5-.2 6.4.9" stroke="#fff" strokeWidth=".7" fill="none" />
      </svg>
    );
  if (code === "en")
    return (
      <svg viewBox="0 0 20 14" className={svg} aria-hidden="true">
        <rect width="20" height="14" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect key={i} y={(i * 14) / 13} width="20" height={14 / 13} fill="#b22234" />
        ))}
        <rect width="8.6" height={(7 * 14) / 13} fill="#3c3b6e" />
        {[1.4, 3.6, 5.8].flatMap((y) =>
          [1.4, 3.4, 5.4, 7.4].map((x) => <circle key={`${x}-${y}`} cx={x - 0.2} cy={y} r=".42" fill="#fff" />),
        )}
      </svg>
    );
  return (
    <svg viewBox="0 0 20 14" className={svg} aria-hidden="true">
      <rect width="20" height="14" fill="#aa151b" />
      <rect y="3.5" width="20" height="7" fill="#f1bf00" />
    </svg>
  );
}
