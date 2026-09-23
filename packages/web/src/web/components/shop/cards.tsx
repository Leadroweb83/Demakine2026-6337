/**
 * Cards e prateleiras da LOJA TÉCNICA (/loja).
 * Cada card é uma "folha de especificação": SKU em mono, LED de estoque,
 * cotas de desenho e canto chanfrado. Sem cor fora da paleta da marca.
 */
import { useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle, Plus } from "lucide-react";
import { brl, type ShopItem } from "@/lib/shop";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------- LED estoque */

const stockMap = {
  "pronta-entrega": { label: "Em estoque", color: "text-dm-green", on: true },
  "sob-encomenda": { label: "Sob encomenda", color: "text-dm-blue", on: false },
  cotacao: { label: "Por cotação", color: "text-dm-red", on: false },
} as const;

export function StockLed({ stock, className }: { stock: ShopItem["stock"]; className?: string }) {
  const s = stockMap[stock];
  return (
    <span
      className={cn(
        "shop-mono inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em]",
        s.color,
        className,
      )}
    >
      <span className={cn("shop-led bg-current", s.on && "shop-led-on")} />
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ spec card */

export function SpecCard({
  item,
  index,
  onAdd,
}: {
  item: ShopItem;
  index: number;
  onAdd: () => void;
}) {
  const pix = item.price ? item.price * 0.95 : undefined;
  const off =
    item.listPrice && item.price
      ? Math.round(((item.listPrice - item.price) / item.listPrice) * 100)
      : 0;

  return (
    <article className="group flex h-full flex-col border border-dm-line bg-white transition-colors hover:border-dm-blue/50">
      {/* cabeçalho técnico */}
      <div className="flex items-center justify-between gap-2 border-b border-dm-line px-3.5 py-2">
        <span className="shop-mono text-[10.5px] font-bold tracking-[0.14em] text-dm-ink">
          {item.sku ?? `IT-${String(index + 1).padStart(3, "0")}`}
        </span>
        <span className="shop-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-dm-gray">
          {item.brandLine}
        </span>
      </div>

      {/* foto com malha e cotas */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dm-surface">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 shop-grid opacity-70 mix-blend-multiply" />
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="shop-dim shop-dim-h relative h-px w-16 bg-current text-white/80" />
          <span className="shop-mono bg-dm-ink/85 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-white">
            FOTO REAL
          </span>
        </div>
        {item.badge && (
          <span className="shop-mono absolute left-0 top-3 bg-dm-red px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white">
            {item.badge}
          </span>
        )}
        {off > 0 && (
          <span className="shop-mono absolute right-0 top-3 bg-dm-ink px-2.5 py-1 text-[9.5px] font-bold tracking-[0.14em] text-white">
            -{off}%
          </span>
        )}
      </div>

      {/* corpo */}
      <div className="flex flex-1 flex-col p-3.5">
        <StockLed stock={item.stock} />
        <h3 className="mt-2.5 text-[14.5px] font-bold leading-snug text-dm-ink">{item.name}</h3>

        <div className="mt-auto pt-4">
          {item.price ? (
            <>
              {item.listPrice && (
                <p className="shop-mono text-[11px] text-dm-gray line-through">
                  {brl(item.listPrice)}
                </p>
              )}
              <p className="font-display text-[23px] font-extrabold leading-none text-dm-ink">
                {brl(item.price)}
              </p>
              <p className="shop-mono mt-1.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-dm-gray">
                {pix && <span className="text-dm-green">{brl(pix)} no pix</span>}
                {item.installments ? ` · ${item.installments}x sem juros` : ""}
              </p>
              {item.freeShipping && (
                <p className="shop-mono mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-dm-blue">
                  Frete grátis acima de R$ 900
                </p>
              )}
              <button
                type="button"
                onClick={onAdd}
                className="mt-3.5 flex w-full items-center justify-center gap-2 bg-dm-red py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#c21016]"
              >
                <Plus className="h-4 w-4" />
                Comprar
              </button>
            </>
          ) : (
            <>
              <p className="shop-mono text-[11px] font-bold uppercase tracking-[0.14em] text-dm-gray">
                Projeto sob medida
              </p>
              <p className="font-display text-[19px] font-extrabold leading-tight text-dm-ink">
                Preço por cotação
              </p>
              <a
                href={waLink(`Olá! Quero cotar: ${item.name} (${item.sku ?? "sem código"}).`)}
                target="_blank"
                rel="noreferrer"
                className="mt-3.5 flex w-full items-center justify-center gap-2 bg-dm-green py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-dm-green-dark"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir cotação
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ trilho */

export function Rail({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.75), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-end gap-2">
        <span className="shop-mono mr-auto text-[10px] font-bold uppercase tracking-[0.18em] text-dm-gray">
          {label}
        </span>
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Anterior"
          className="flex h-9 w-9 items-center justify-center border border-dm-line text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Próximo"
          className="flex h-9 w-9 items-center justify-center border border-dm-line text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>
      <div ref={ref} className="shop-rail -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- linha de dado */

export function DataLine({
  code,
  label,
  value,
  tone = "ink",
}: {
  code: string;
  label: string;
  value: string;
  tone?: "ink" | "light";
}) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-3 border-b py-3",
        tone === "light" ? "border-white/10" : "border-dm-line",
      )}
    >
      <span className="shop-mono text-[10px] font-bold tracking-[0.18em] text-dm-red">{code}</span>
      <span
        className={cn(
          "shop-mono text-[10.5px] font-medium uppercase tracking-[0.14em]",
          tone === "light" ? "text-white/45" : "text-dm-gray",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "ml-auto text-right text-[13.5px] font-bold",
          tone === "light" ? "text-white" : "text-dm-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- link técnico */

export function TechLink({
  href,
  code,
  children,
}: {
  href: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 border-b border-dm-line py-3.5 text-[14px] font-bold text-dm-ink transition-colors hover:text-dm-blue"
    >
      <span className="shop-mono text-[10px] font-bold tracking-[0.18em] text-dm-gray group-hover:text-dm-red">
        {code}
      </span>
      {children}
      <ArrowUpRight className="ml-auto h-4 w-4 text-dm-line transition-colors group-hover:text-dm-blue" />
    </a>
  );
}
