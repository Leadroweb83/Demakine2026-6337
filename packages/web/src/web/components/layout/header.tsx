import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, Phone, Search, X } from "lucide-react";
import { nav, SHOP_OPEN, site, waLink } from "@/lib/site";
import { categories, searchProducts } from "@/lib/content";
import { ProductsMega } from "@/components/layout/mega-menu";
import { LangSwitch } from "@/components/layout/lang-switch";
import { cn } from "@/lib/utils";

function SearchBox({ onDone }: { onDone?: () => void }) {
  const [query, setQuery] = useState("");
  const results = searchProducts(query);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setQuery("");
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dm-gray" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar equipamento..."
        aria-label="Buscar equipamento"
        className="w-full rounded-full border border-dm-line bg-white py-2.5 pl-9 pr-4 text-sm text-dm-ink outline-none transition-colors placeholder:text-dm-gray/70 focus:border-dm-blue"
      />
      {query.trim().length > 1 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-dm-line bg-white shadow-xl shadow-black/10">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-dm-gray">
              Nada encontrado. Fale com um especialista para projetos sob medida.
            </p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/produtos/${p.slug}`}
                    onClick={() => {
                      setQuery("");
                      onDone?.();
                    }}
                    className="flex items-center gap-3 border-b border-dm-line/70 px-3 py-2.5 last:border-0 hover:bg-dm-surface"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-11 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-dm-ink">{p.name}</span>
                      <span className="block truncate text-xs text-dm-gray">{p.tag ?? p.category}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 150);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [location]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMega(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* barra utilitária */}
      <div className="hidden bg-dm-blue-deep text-white lg:block">
        <div className="dm-container flex h-10 items-center justify-between text-[13px]">
          <p className="min-w-0 truncate pr-6 text-white/70">
            {site.tagline} · Fábrica própria em Limeira/SP · Atendimento em todo o Brasil
          </p>
          <div className="flex shrink-0 items-center gap-6 whitespace-nowrap">
            <a href={site.phoneHref} className="flex items-center gap-2 text-white/80 hover:text-white">
              <Phone className="h-3.5 w-3.5" />
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="text-white/80 hover:text-white">
              {site.email}
            </a>
            <LangSwitch dark />
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow",
          scrolled ? "border-dm-line shadow-sm" : "border-transparent",
        )}
      >
        {/* o menu com os nomes completos pede mais largura que o conteúdo das páginas (1240 px) */}
        <div className="dm-container dm-container--header flex h-[76px] items-center gap-4 min-[1600px]:gap-6">
          <Link href="/" className="shrink-0" aria-label="Demakine, página inicial">
            <img
              src="/img/site/logo-blue.webp"
              width={293}
              height={80}
              alt="Demakine Equipamentos Agroindustriais"
              className="h-9 w-auto object-contain md:h-11"
            />
          </Link>

          {/* nomes completos no menu: ele aparece a partir de 1380 px; abaixo disso, o menu do celular */}
          <nav className="ml-auto hidden items-center gap-0.5 min-[1380px]:flex">
            {nav.slice(1).map((item) => {
              const active = location === item.to || location.startsWith(`${item.to}/`);
              if (item.to === "/produtos") {
                return (
                  <div
                    key={item.to}
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleClose}
                    className="relative"
                  >
                    <Link
                      href={item.to}
                      onFocus={openMega}
                      aria-expanded={mega}
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap rounded-full px-[7px] py-2 text-[13.5px] font-semibold min-[1600px]:px-2.5 min-[1600px]:text-[14px] transition-colors",
                        active || mega
                          ? "bg-dm-blue-soft text-dm-blue"
                          : "text-dm-ink/75 hover:text-dm-blue",
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-300",
                          mega && "rotate-180",
                        )}
                      />
                    </Link>
                  </div>
                );
              }
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "whitespace-nowrap rounded-full px-[7px] py-2 text-[13.5px] font-semibold min-[1600px]:px-2.5 min-[1600px]:text-[14px] transition-colors",
                    active ? "bg-dm-blue-soft text-dm-blue" : "text-dm-ink/75 hover:text-dm-blue",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden w-[210px] min-[1800px]:ml-4 min-[1800px]:block">
            <SearchBox />
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:ml-auto lg:flex min-[1380px]:ml-0">
            {SHOP_OPEN ? (
              <a
                href="/loja"
                className="rounded-full bg-dm-blue px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#0d3480] min-[1600px]:px-5 min-[1600px]:text-[13px]"
              >
                Loja virtual
              </a>
            ) : (
              // etiqueta por cima do botão: não aumenta a largura do topo
              <span
                aria-disabled="true"
                title="Em breve"
                className="relative cursor-default rounded-full bg-dm-blue/80 px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white min-[1600px]:px-5 min-[1600px]:text-[13px]"
              >
                Loja virtual
                <span className="absolute -top-2.5 right-2 rounded-full bg-dm-red px-1.5 py-px text-[9.5px] font-bold uppercase leading-[14px] tracking-wide text-white shadow-sm">
                  Em breve
                </span>
              </span>
            )}
            <a
              href={waLink("Olá! Vim pelo site da Demakine e quero um orçamento.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-dm-green px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark min-[1600px]:px-5 min-[1600px]:text-[13px]"
            >
              Pedir orçamento
            </a>
          </div>

          {/* no celular a barra de cima não aparece: o seletor de idioma vem para cá */}
          <LangSwitch className="ml-auto lg:hidden" />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dm-line text-dm-ink lg:ml-3 min-[1380px]:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mega && (
          <div
            onMouseEnter={openMega}
            onMouseLeave={scheduleClose}
            className="absolute left-0 right-0 top-full hidden min-[1380px]:block"
          >
            <ProductsMega onNavigate={() => setMega(false)} />
          </div>
        )}

        {open && (
          <div className="border-t border-dm-line bg-white min-[1380px]:hidden">
            <div className="dm-container max-h-[calc(100dvh-120px)] overflow-y-auto py-5">
              <SearchBox onDone={() => setOpen(false)} />
              <nav className="mt-4 flex flex-col">
                {nav.map((item) => {
                  const active = location === item.to;
                  return (
                    <div key={item.to} className="border-b border-dm-line/70">
                      <Link
                        href={item.to}
                        className={cn(
                          "block py-3.5 text-[15px] font-semibold",
                          active ? "text-dm-blue" : "text-dm-ink",
                        )}
                      >
                        {item.label}
                      </Link>
                      {item.to === "/produtos" && (
                        <div className="flex flex-wrap gap-2 pb-4">
                          {categories.map((c) => (
                            <Link
                              key={c.slug}
                              href={`/produtos?cat=${c.slug}`}
                              className="rounded-full border border-dm-line bg-dm-surface px-3 py-1.5 text-[13px] font-semibold text-dm-ink/75"
                            >
                              {c.short}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              <div className="mt-5 flex flex-col gap-3">
                {SHOP_OPEN ? (
                  <a
                    href="/loja"
                    className="rounded-full bg-dm-blue px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white"
                  >
                    Loja virtual
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex items-center justify-center gap-2 rounded-full bg-dm-blue/80 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white"
                  >
                    Loja virtual
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10.5px]">Em breve</span>
                  </span>
                )}
                <a
                  href={waLink("Olá! Vim pelo site da Demakine e quero um orçamento.")}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-dm-green px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white"
                >
                  Pedir orçamento no WhatsApp
                </a>
                <a
                  href={site.mobileHref}
                  className="rounded-full border border-dm-line px-6 py-3.5 text-center text-sm font-bold text-dm-ink"
                >
                  {site.mobile}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
