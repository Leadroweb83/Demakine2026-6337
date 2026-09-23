/**
 * Casca da LOJA TÉCNICA (/loja): ticker, header, rodapé.
 * Identidade blueprint: malha técnica, códigos em mono, cotas de desenho.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Heart,
  Menu,
  MessageCircle,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { site, waLink } from "@/lib/site";
import { tickerLines } from "@/lib/shop";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ ticker */

export function ShopTicker() {
  const line = [...tickerLines, ...tickerLines];
  return (
    <div className="overflow-hidden border-b border-white/10 bg-dm-ink py-2">
      <div className="shop-ticker">
        {line.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="shop-mono flex shrink-0 items-center gap-6 px-6 text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/45"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-dm-red" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ header */

export const shopMenu = [
  { label: "Peças de reposição", code: "PC", href: "#compativel" },
  { label: "Correias e lonas", code: "CR", href: "#vitrine" },
  { label: "Costura de sacaria", code: "CS", href: "#vitrine" },
  { label: "Consumíveis", code: "CN", href: "#vitrine" },
  { label: "Movimentação leve", code: "MV", href: "#vitrine" },
  { label: "Kits de operação", code: "KT", href: "#kits" },
];

export function ShopHeader({ cart }: { cart: number }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white transition-shadow",
        solid ? "border-dm-line shadow-[0_10px_30px_rgba(10,31,61,0.07)]" : "border-transparent",
      )}
    >
      <div className="dm-container flex items-center gap-3 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir categorias"
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-dm-line text-dm-ink lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-3">
          <img src="/img/site/logo-blue.png" alt="Demakine" className="h-8 w-auto object-contain" />
          <span className="hidden h-7 w-px bg-dm-line sm:block" />
          <span className="shop-mono hidden text-[10px] font-bold uppercase leading-tight tracking-[0.2em] text-dm-gray sm:block">
            Loja
            <br />
            técnica
          </span>
        </Link>

        <div className="relative ml-6 hidden w-full max-w-[520px] lg:block">
          <input
            aria-label="Buscar na loja"
            placeholder="Código da peça, correia, máquina..."
            className="shop-mono w-full border border-dm-line bg-dm-surface py-3 pl-4 pr-24 text-[13px] tracking-tight text-dm-ink outline-none transition-colors placeholder:text-dm-gray/70 focus:border-dm-blue focus:bg-white"
          />
          <button
            type="button"
            className="absolute right-0 top-0 flex h-full items-center gap-1.5 bg-dm-blue px-4 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#0d3480]"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <a
            href={waLink("Olá! Estou na loja técnica da Demakine e preciso de ajuda.")}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 border border-dm-green/30 bg-dm-green-soft px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-wide text-[#0f6b3f] transition-colors hover:bg-dm-green hover:text-white xl:flex"
          >
            <MessageCircle className="h-4 w-4" />
            Vendedor
          </a>
          <button
            type="button"
            className="hidden items-center gap-2 px-3 py-2 text-left text-[12.5px] font-bold text-dm-ink transition-colors hover:text-dm-blue md:flex"
          >
            <User className="h-4.5 w-4.5 text-dm-gray" />
            <span className="leading-tight">
              Entrar
              <span className="shop-mono block text-[10px] font-medium uppercase tracking-wider text-dm-gray">
                cadastro CNPJ
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Favoritos"
            className="hidden h-10 w-10 items-center justify-center text-dm-ink transition-colors hover:text-dm-red md:flex"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Carrinho"
            className="relative flex h-11 items-center gap-2.5 bg-dm-ink px-4 text-[12px] font-bold uppercase tracking-wide text-white"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            <span className="hidden sm:block">Carrinho</span>
            <span
              className={cn(
                "shop-mono flex h-5 min-w-5 items-center justify-center bg-dm-red px-1 text-[11px] font-bold text-white transition-transform",
                cart > 0 ? "scale-100" : "scale-0",
              )}
            >
              {cart}
            </span>
          </button>
        </div>
      </div>

      <div className="dm-container relative pb-3.5 lg:hidden">
        <input
          aria-label="Buscar na loja"
          placeholder="Código da peça, correia, máquina..."
          className="shop-mono w-full border border-dm-line bg-dm-surface py-2.5 pl-4 pr-11 text-[12.5px] text-dm-ink outline-none focus:border-dm-blue focus:bg-white"
        />
        <Search className="pointer-events-none absolute right-9 top-[13px] h-4 w-4 text-dm-gray" />
      </div>

      <nav className="hidden border-t border-dm-line bg-dm-surface lg:block">
        <div className="dm-container flex items-stretch">
          <span className="flex items-center gap-2 border-r border-dm-line pr-5 text-[12.5px] font-bold text-dm-ink">
            <Menu className="h-4 w-4 text-dm-blue" />
            Catálogo
            <ChevronDown className="h-3.5 w-3.5 text-dm-gray" />
          </span>
          {shopMenu.map((m) => (
            <a
              key={m.label}
              href={m.href}
              className="group flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold text-dm-ink transition-colors hover:bg-white hover:text-dm-blue"
            >
              <span className="shop-mono text-[10px] font-bold tracking-widest text-dm-gray group-hover:text-dm-red">
                {m.code}
              </span>
              {m.label}
            </a>
          ))}
          <a
            href="#cotacao"
            className="ml-auto flex items-center gap-1.5 border-l border-dm-line pl-5 text-[12.5px] font-bold text-dm-red hover:underline"
          >
            Máquina sob medida
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </nav>

      {open && (
        <nav className="border-t border-dm-line bg-white lg:hidden">
          <div className="dm-container flex flex-col py-1">
            {shopMenu.map((m) => (
              <a
                key={m.label}
                href={m.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-dm-line/60 py-3 text-[14px] font-semibold text-dm-ink last:border-0"
              >
                <span className="shop-mono w-6 text-[10px] font-bold tracking-widest text-dm-red">
                  {m.code}
                </span>
                {m.label}
                <ArrowRight className="ml-auto h-4 w-4 text-dm-line" />
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ rodapé */

const footerCols = [
  {
    code: "01",
    title: "Comprar",
    links: [
      "Peças de reposição",
      "Correias e lonas",
      "Costura de sacaria",
      "Consumíveis",
      "Kits de operação",
    ],
  },
  {
    code: "02",
    title: "Pedido",
    links: [
      "Prazo de entrega",
      "Formas de pagamento",
      "Boleto para CNPJ",
      "Trocas e devoluções",
      "Rastrear pedido",
    ],
  },
];

export function ShopFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-dm-blue-deep text-white">
      <div className="absolute inset-0 shop-grid-dark opacity-60" />

      <div className="relative dm-container">
        <div className="grid gap-10 border-b border-white/10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/img/site/logo-white.png"
              alt="Demakine"
              className="h-8 w-auto object-contain"
            />
            <p className="shop-mono mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Loja oficial da fábrica
            </p>
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-white/60">
              Peça, consumível e equipamento de movimentação saindo do mesmo galpão que fabrica a
              máquina, em Limeira/SP.
            </p>
            <a
              href={waLink("Olá! Estou na loja técnica da Demakine e quero fechar um pedido.")}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-dm-green px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com um vendedor
            </a>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="shop-mono flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                <span className="text-dm-red">{col.code}</span>
                {col.title}
              </h3>
              <ul className="mt-5 space-y-2.5 text-[14px] text-white/70">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#vitrine" className="hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="shop-mono flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
              <span className="text-dm-red">03</span>
              A fábrica
            </h3>
            <ul className="mt-5 space-y-2.5 text-[14px] text-white/70">
              <li>
                <Link href="/" className="hover:text-white">
                  Site institucional
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-white">
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link href="/ferramentas" className="hover:text-white">
                  Calculadoras técnicas
                </Link>
              </li>
              <li>
                <Link href="/assistencia-tecnica" className="hover:text-white">
                  Assistência técnica
                </Link>
              </li>
            </ul>
            <p className="shop-mono mt-6 text-[11px] leading-relaxed tracking-tight text-white/40">
              {site.address}
              <br />
              {site.phone} · {site.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 py-5 text-[12px] text-white/35 md:flex-row md:items-center md:justify-between">
          <p className="shop-mono uppercase tracking-wider">
            © {new Date().getFullYear()} {site.legal}
          </p>
          <p className="shop-mono uppercase tracking-wider">
            Preços e condições válidos para o site
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <p
          className="select-none whitespace-nowrap text-center font-[Anton] leading-[0.8] text-white/[0.07]"
          style={{ fontSize: "15vw" }}
          aria-hidden="true"
        >
          DEMAKINE
        </p>
      </div>
      <div className="pb-16 lg:pb-0" />
    </footer>
  );
}
