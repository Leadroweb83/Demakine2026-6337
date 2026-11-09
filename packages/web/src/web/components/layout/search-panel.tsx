import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { categories, categoryName, searchProducts } from "@/lib/content";
import { quoteHref } from "@/lib/site";
import { cn } from "@/lib/utils";
import { categoryHref } from "@/lib/landing-links";

const EXIT_MS = 220;
const MIN_CHARS = 2;

type Props = {
  open: boolean;
  /** `refocus`: devolve o foco à lupa (Esc e botão fechar); clique fora e navegação não precisam. */
  onClose: (refocus?: boolean) => void;
};

/**
 * Painel de busca que desce por baixo do cabeçalho, sem mexer no menu. Fica montado só enquanto
 * aberto (ou saindo), para não pôr um campo de texto extra no HTML pré-renderizado.
 */
export function SearchPanel({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // dois quadros: o painel entra fechado, e só então a transição roda
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    setShown(false);
    const t = window.setTimeout(() => {
      setMounted(false);
      setQuery("");
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open && mounted) inputRef.current?.focus({ preventScroll: true });
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const term = query.trim();
  const searching = term.length >= MIN_CHARS;
  const results = searching ? searchProducts(term) : [];

  return (
    <>
      <div
        onClick={() => onClose()}
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-full h-[100dvh] bg-dm-ink/40 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        id="busca-painel"
        role="dialog"
        aria-label="Buscar equipamento"
        className={cn(
          "absolute inset-x-0 top-full grid border-b border-dm-line bg-white shadow-xl shadow-black/10 transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="dm-container dm-container--header py-5 md:py-7">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const first = results[0];
                if (!first) return;
                onClose();
                navigate(`/produtos/${first.slug}`);
              }}
              className="relative"
            >
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dm-gray"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar equipamento..."
                aria-label="Buscar equipamento"
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 w-full rounded-full border border-dm-line bg-dm-surface pl-12 pr-14 text-base text-dm-ink outline-none transition-colors placeholder:text-dm-gray/70 focus:border-dm-blue focus:bg-white [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="button"
                onClick={() => onClose(true)}
                aria-label="Fechar busca"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-dm-gray transition-colors hover:bg-dm-line/60 hover:text-dm-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </form>

            <div aria-live="polite" className="mt-5 max-h-[min(58dvh,520px)] overflow-y-auto">
              {!searching ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={categoryHref(c.slug)}
                      onClick={() => onClose()}
                      className="rounded-full border border-dm-line bg-dm-surface px-3.5 py-2 text-[13px] font-semibold text-dm-ink/75 transition-colors hover:border-dm-blue hover:text-dm-blue"
                    >
                      {c.short}
                    </Link>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <p className="text-sm text-dm-gray">
                  Nada encontrado. Fale com um especialista para projetos sob medida.{" "}
                  <Link
                    href={quoteHref()}
                    onClick={() => onClose()}
                    className="font-semibold text-dm-blue underline-offset-2 hover:underline"
                  >
                    Pedir orçamento
                  </Link>
                </p>
              ) : (
                <ul className="grid gap-x-6 md:grid-cols-2">
                  {results.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/produtos/${p.slug}`}
                        onClick={() => onClose()}
                        className="flex items-center gap-4 rounded-xl px-2 py-2.5 transition-colors hover:bg-dm-surface focus-visible:bg-dm-surface"
                      >
                        <img
                          src={p.images[0]}
                          alt=""
                          loading="lazy"
                          className="h-14 w-[72px] shrink-0 rounded-lg object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-semibold text-dm-ink">{p.name}</span>
                          <span className="block truncate text-xs text-dm-gray">
                            {p.tag ?? categoryName(p.category)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
