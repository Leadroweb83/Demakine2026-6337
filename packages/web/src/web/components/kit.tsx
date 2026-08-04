import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { CompareToggle } from "./compare";
import { clients, testimonials, type Product } from "@/lib/content";
import { site, waLink } from "@/lib/site";

/* ------------------------------------------------------------------ section */

export function Section({
  children,
  className,
  tone = "white",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "surface" | "deep" | "blue";
  id?: string;
}) {
  const tones = {
    white: "bg-white text-dm-ink",
    surface: "bg-dm-surface text-dm-ink",
    deep: "bg-dm-blue-deep text-white",
    blue: "bg-dm-blue text-white",
  };
  return (
    <section id={id} className={cn("py-16 md:py-24", tones[tone], className)}>
      <div className="dm-container">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  text,
  align = "left",
  dark = false,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  dark?: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center",
      )}
    >
      <Reveal className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow && (
          <p className={cn("eyebrow", dark ? "text-white/45" : "text-dm-blue")}>{eyebrow}</p>
        )}
        <h2 className={cn("h2 mt-3", dark ? "text-white" : "text-dm-ink")}>{title}</h2>
        {text && (
          <p className={cn("mt-4 text-[17px] leading-relaxed", dark ? "text-white/65" : "text-dm-gray")}>
            {text}
          </p>
        )}
      </Reveal>
      {action && <Reveal i={1} className="shrink-0">{action}</Reveal>}
    </div>
  );
}

/* ------------------------------------------------------------------ buttons */

export function BtnPrimary({
  href,
  to,
  children,
  className,
  external,
}: {
  href?: string;
  to?: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full bg-dm-red px-7 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017]",
    className,
  );
  if (to) return <Link href={to} className={cls}>{children}</Link>;
  return (
    <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

export function BtnGhost({
  href,
  to,
  children,
  className,
  dark = false,
  external,
}: {
  href?: string;
  to?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  external?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors",
    dark
      ? "border-white/25 text-white hover:border-white/60"
      : "border-dm-line text-dm-ink hover:border-dm-blue hover:text-dm-blue",
    className,
  );
  if (to) return <Link href={to} className={cls}>{children}</Link>;
  return (
    <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ breadcrumb */

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Você está aqui" className="flex flex-wrap items-center gap-1.5 text-[13px]">
      <Link href="/" className="text-dm-gray hover:text-dm-blue">
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-dm-gray/50" />
          {item.to ? (
            <Link href={item.to} className="text-dm-gray hover:text-dm-blue">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-dm-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ page hero */

export function PageHero({
  eyebrow,
  title,
  text,
  image,
  crumbs,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  image?: string;
  crumbs: { label: string; to?: string }[];
}) {
  return (
    <>
      <div className="border-b border-dm-line bg-white">
        <div className="dm-container py-3.5">
          <Breadcrumb items={crumbs} />
        </div>
      </div>
      <section className="relative overflow-hidden bg-dm-blue-deep">
        {image && (
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0 grid-lines" />
        <div className="dm-container relative py-14 md:py-20">
          <p className="eyebrow text-white/45 hero-in">{eyebrow}</p>
          <h1 className="h1 mt-3 max-w-4xl text-white hero-in" style={{ ["--i" as string]: 1 }}>
            {title}
          </h1>
          {text && (
            <p
              className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70 hero-in"
              style={{ ["--i" as string]: 2 }}
            >
              {text}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ product card */

export function ProductCard({
  product,
  i = 0,
  compare = false,
}: {
  product: Product;
  i?: number;
  compare?: boolean;
}) {
  return (
    <Reveal i={i} className="h-full">
      <Link
        href={`/produtos/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white transition-all hover:-translate-y-1 hover:border-dm-blue/35 hover:shadow-xl hover:shadow-dm-blue/10"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-dm-surface">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.tag && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-dm-blue">
              {product.tag}
            </span>
          )}
          {compare && (
            <span className="absolute right-3 top-3">
              <CompareToggle slug={product.slug} />
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-[17px] font-bold leading-snug text-dm-ink group-hover:text-dm-blue">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-dm-gray">
            {product.summary}
          </p>
          <span className="mt-auto flex items-center gap-1.5 pt-4 text-[13px] font-bold uppercase tracking-wide text-dm-blue">
            Ver detalhes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ clients marquee */

export function ClientsMarquee({ tone = "white" }: { tone?: "white" | "surface" }) {
  const row = [...clients, ...clients];
  return (
    <div className={cn("marquee-wrap overflow-hidden py-10", tone === "surface" ? "bg-dm-surface" : "bg-white")}>
      <div className="marquee-track items-center gap-12 px-6">
        {row.map((c, idx) => (
          <img
            key={`${c.id}-${idx}`}
            src={c.logo}
            alt={c.name}
            loading="lazy"
            title={c.name}
            className="h-12 w-auto shrink-0 opacity-55 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:h-14"
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ testimonials */

export function TestimonialGrid({ limit = 6, start = 0 }: { limit?: number; start?: number }) {
  const list = testimonials.slice(start, start + limit);
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {list.map((t, idx) => (
        <Reveal key={`${t.name}-${idx}`} i={idx % 3} className="h-full">
          <figure className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6">
            <div className="flex gap-0.5 text-dm-red" aria-label="5 de 5">
              {Array.from({ length: 5 }).map((_, s) => (
                <svg key={s} viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                  <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
                </svg>
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-[15.5px] leading-relaxed text-dm-ink/85">
              “{t.text}”
            </blockquote>
            <figcaption className="mt-5 border-t border-dm-line pt-4">
              <span className="block text-[15px] font-bold text-dm-ink">{t.name}</span>
              <span className="block text-[13.5px] text-dm-gray">
                {[t.company, t.city].filter(Boolean).join(" · ")}
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ CTA band */

export function CtaBand({
  title = "Precisa de um equipamento sob medida?",
  text = "Envie as informações da sua operação — material, comprimento, altura e capacidade. Nossa engenharia monta a solução ideal e você recebe o orçamento em até 1 dia útil.",
  waMessage = "Olá! Quero um orçamento de equipamento Demakine.",
}: {
  title?: string;
  text?: string;
  waMessage?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-dm-blue-deep py-16 md:py-20">
      <div className="absolute inset-0 grid-lines" />
      <div className="dm-container relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="h2 text-white">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-white/65">{text}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <BtnPrimary href={waLink(waMessage)} external>
              Falar no WhatsApp
            </BtnPrimary>
            <BtnGhost dark to="/contato">
              Enviar especificação
            </BtnGhost>
          </div>
          <p className="mt-6 text-[13.5px] text-white/45">
            {site.phone} · {site.mobile} · {site.email}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
