import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, Phone, Search, X } from "lucide-react";
import { nav, quoteHref, SHOP_OPEN, site } from "@/lib/site";
import { categories } from "@/lib/content";
import { ProductsMega } from "@/components/layout/mega-menu";
import { LangSwitch } from "@/components/layout/lang-switch";
import { SearchPanel } from "@/components/layout/search-panel";
import { cn } from "@/lib/utils";
import { categoryHref } from "@/lib/landing-links";

export function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBtn = useRef<HTMLButtonElement | null>(null);
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
    setSearchOpen(false);
  }, [location]);

  const closeSearch = useCallback((refocus?: boolean) => {
    setSearchOpen(false);
    if (refocus) searchBtn.current?.focus();
  }, []);

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
              width={1406}
              height={302}
              alt="Demakine Equipamentos Agroindustriais"
              className="h-[42px] w-auto object-contain max-[400px]:h-[36px] max-[340px]:h-[30px] md:h-[54px]"
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

          <button
            ref={searchBtn}
            type="button"
            onClick={() => {
              setMega(false);
              setOpen(false);
              setSearchOpen((v) => !v);
            }}
            aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
            aria-expanded={searchOpen}
            aria-controls="busca-painel"
            className={cn(
              "ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue min-[1380px]:ml-0",
              searchOpen ? "border-dm-blue text-dm-blue" : "border-dm-line",
            )}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
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
            {/* orçamento vai para o formulário de contato; verde fica reservado ao WhatsApp */}
            <Link
              href={quoteHref()}
              className="rounded-full bg-dm-red px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017] min-[1600px]:px-5 min-[1600px]:text-[13px]"
            >
              Pedir orçamento
            </Link>
          </div>

          {/* no celular a barra de cima não aparece: o seletor de idioma vem para cá */}
          {/* abaixo de 640 px não cabe ao lado da lupa e do hambúrguer: as bandeiras vão para dentro do menu */}
          <LangSwitch className="max-sm:hidden lg:hidden" />

          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setOpen((v) => !v);
            }}
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

        <SearchPanel open={searchOpen} onClose={closeSearch} />

        {open && (
          <div className="border-t border-dm-line bg-white min-[1380px]:hidden">
            <div className="dm-container max-h-[calc(100dvh-120px)] overflow-y-auto py-5">
              <nav className="flex flex-col">
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
                              href={categoryHref(c.slug)}
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
              <LangSwitch className="mt-4 sm:hidden" />
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
                <Link
                  href={quoteHref()}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-dm-red px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white"
                >
                  Pedir orçamento
                </Link>
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
