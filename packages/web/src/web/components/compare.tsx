import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link } from "wouter";
import { GitCompareArrows, X } from "lucide-react";
import { categoryName, products, type Product } from "@/lib/content";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const MAX = 3;

type Ctx = {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  full: boolean;
  open: () => void;
};

const CompareCtx = createContext<Ctx | null>(null);

export function useCompare() {
  const ctx = useContext(CompareCtx);
  if (!ctx) throw new Error("useCompare precisa do <CompareProvider>");
  return ctx;
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [modal, setModal] = useState(false);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX) return prev;
      return [...prev, slug];
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      slugs,
      toggle,
      remove: (slug) => setSlugs((p) => p.filter((s) => s !== slug)),
      clear: () => {
        setSlugs([]);
        setModal(false);
      },
      has: (slug) => slugs.includes(slug),
      full: slugs.length >= MAX,
      open: () => setModal(true),
    }),
    [slugs, toggle],
  );

  return (
    <CompareCtx.Provider value={value}>
      {children}
      <CompareBar onOpen={() => setModal(true)} />
      {modal && <CompareModal onClose={() => setModal(false)} />}
    </CompareCtx.Provider>
  );
}

/* ------------------------------------------------------------------ checkbox */

export function CompareToggle({
  slug,
  className,
  label = "Comparar",
}: {
  slug: string;
  className?: string;
  label?: string;
}) {
  const { has, toggle, full } = useCompare();
  const on = has(slug);
  const blocked = !on && full;

  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={blocked}
      title={blocked ? `Você já selecionou ${MAX} equipamentos` : "Adicionar ao comparador"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-bold uppercase tracking-wide transition-colors",
        on
          ? "border-dm-blue bg-dm-blue text-white"
          : "border-dm-line bg-white/95 text-dm-gray hover:border-dm-blue hover:text-dm-blue",
        blocked && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border",
          on ? "border-white bg-white" : "border-current",
        )}
      >
        {on && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-dm-blue stroke-[2.4]">
            <path d="M2 6.4 4.6 9 10 3.2" />
          </svg>
        )}
      </span>
      {on ? "Selecionado" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ bar */

function CompareBar({ onOpen }: { onOpen: () => void }) {
  const { slugs, remove, clear } = useCompare();
  if (slugs.length === 0) return null;

  const list = slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean) as Product[];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-dm-blue-deep/95 backdrop-blur">
      <div className="dm-container flex flex-wrap items-center gap-3 pb-12 pt-3 pr-4 md:py-3 md:pr-44">
        <span className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wide text-white/60">
          <GitCompareArrows className="h-4 w-4" />
          Comparar
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {list.map((p) => (
            <span
              key={p.slug}
              className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-2.5 text-[13px] text-white"
            >
              <img
                src={p.images[0]}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
                loading="lazy"
              />
              <span className="max-w-[46vw] truncate sm:max-w-[220px]">{p.name}</span>
              <button
                type="button"
                onClick={() => remove(p.slug)}
                aria-label={`Remover ${p.name}`}
                className="text-white/50 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="rounded-full px-3 py-2 text-[12.5px] font-bold uppercase tracking-wide text-white/50 hover:text-white"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={onOpen}
            disabled={list.length < 2}
            className={cn(
              "rounded-full bg-dm-red px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017]",
              list.length < 2 && "cursor-not-allowed opacity-45",
            )}
          >
            {list.length < 2 ? "Escolha 2+" : `Comparar (${list.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ modal */

function CompareModal({ onClose }: { onClose: () => void }) {
  const { slugs } = useCompare();
  const list = slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean) as Product[];

  /** linhas: atributos gerais + specs do primeiro modelo de cada produto */
  const rows = useMemo(() => {
    const base: { label: string; values: string[] }[] = [
      { label: "Categoria", values: list.map((p) => categoryName(p.category)) },
      {
        label: "Modelos de tabela",
        values: list.map((p) => (p.models?.length ? String(p.models.length) : "sob medida")),
      },
      {
        label: "Aplicações",
        values: list.map((p) => p.applications?.slice(0, 3).join(", ") || "—"),
      },
      {
        label: "Destaques",
        values: list.map((p) => p.features?.slice(0, 2).join(" · ") || "—"),
      },
    ];

    const specKeys: string[] = [];
    for (const p of list) {
      const first = p.models?.[0];
      if (!first) continue;
      for (const k of Object.keys(first.specs)) if (!specKeys.includes(k)) specKeys.push(k);
    }
    for (const k of specKeys) {
      base.push({
        label: `${k} (1º modelo)`,
        values: list.map((p) => p.models?.[0]?.specs?.[k] ?? "—"),
      });
    }
    return base;
  }, [list]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-6">
      <button type="button" aria-label="Fechar" className="absolute inset-0" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-dm-line px-5 py-4">
          <div>
            <p className="eyebrow text-dm-blue">Comparador</p>
            <h3 className="mt-1.5 text-[19px] font-bold text-dm-ink">
              {list.length} equipamentos lado a lado
            </h3>
            <p className="mt-1 text-[13px] text-dm-gray">
              As diferenças aparecem destacadas. Dados do nosso catálogo técnico.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar comparador"
            className="rounded-full border border-dm-line p-2 text-dm-gray hover:text-dm-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="w-40 border-b border-dm-line px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-dm-gray">
                  Item
                </th>
                {list.map((p) => (
                  <th key={p.slug} className="border-b border-dm-line px-4 py-3 align-bottom">
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      className="mb-2 h-20 w-full rounded-lg object-cover"
                    />
                    <Link
                      href={`/produtos/${p.slug}`}
                      className="text-[14.5px] font-bold leading-snug text-dm-ink hover:text-dm-blue"
                    >
                      {p.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const differs = new Set(row.values).size > 1;
                return (
                  <tr key={row.label} className="align-top">
                    <th
                      scope="row"
                      className="border-b border-dm-line bg-dm-surface px-5 py-3 text-[13px] font-semibold text-dm-ink"
                    >
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td
                        key={`${row.label}-${i}`}
                        className={cn(
                          "border-b border-dm-line px-4 py-3 text-dm-gray",
                          differs && "bg-dm-blue-soft/60 font-semibold text-dm-ink",
                        )}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-dm-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-dm-gray">
            Precisa de uma medida que não está na tabela? Fabricamos sob medida.
          </p>
          <a
            href={waLink(
              `Olá! Quero comparar estes equipamentos: ${list.map((p) => p.name).join(" / ")}.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-dm-red px-6 py-3 text-[12.5px] font-bold uppercase tracking-wide text-white hover:bg-[#c31017]"
          >
            Tirar dúvida no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
