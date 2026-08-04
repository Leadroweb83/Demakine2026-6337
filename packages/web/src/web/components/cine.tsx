import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ hook: in-view */

export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView } as const;
}

/* ------------------------------------------------------------------ section */

/**
 * Seção com a identidade do Catálogo V2: fundo azul profundo, feixe de luz,
 * grade técnica e grão. Usada apenas nas seções de impacto (~25% do site).
 */
export function CineSection({
  children,
  className,
  id,
  bleed = false,
  media,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  bleed?: boolean;
  /** Vídeo/imagem de fundo, renderizado fora do container (cobre a seção inteira). */
  media?: ReactNode;
}) {
  return (
    <section id={id} className={cn("cine", bleed ? "" : "py-16 md:py-24", className)}>
      <div className="cine-bg" />
      {media}
      <div className="cine-beam" />
      <div className="cine-glow" />
      <div className="cine-grid" />
      <div className="cine-noise" />
      <div className="dm-container relative">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ tag */

export function CineTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("cine-tag", className)}>
      <span>{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ title */

/**
 * Título condensado com revelação por linha. Cada string é uma linha,
 * animada quando entra na viewport.
 */
export function CineTitle({
  lines,
  className,
  small = false,
  as: Tag = "h2",
}: {
  lines: string[];
  className?: string;
  small?: boolean;
  as?: "h1" | "h2" | "h3";
}) {
  const { ref, inView } = useInView<HTMLHeadingElement>(0.2);

  return (
    <Tag
      ref={ref}
      className={cn("cine-title text-white", small && "cine-title-sm", className)}
    >
      {lines.map((line, i) => (
        <span key={line + i} className="cine-line">
          <span
            style={{
              ["--i" as string]: i,
              animationPlayState: inView ? "running" : "paused",
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ bullets */

export function CineBullets({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLUListElement>(0.15);
  return (
    <ul ref={ref} className={cn("cine-bullets", className)}>
      {items.map((t, i) => (
        <li
          key={t}
          className={cn("reveal", inView && "is-in")}
          style={{ ["--i" as string]: i }}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ rule */

export function CineRule({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <div
      ref={ref}
      className={cn("cine-rule w-24", className)}
      style={{ animationPlayState: inView ? "running" : "paused" }}
    />
  );
}

/* ------------------------------------------------------------------ shot */

/** Foto de produto com entrada lateral + flutuação sutil. */
export function CineShot({
  src,
  alt,
  className,
  float = true,
}: {
  src: string;
  alt: string;
  className?: string;
  float?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <div ref={ref} className={cn(float && "cine-float", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="cine-shot w-full object-contain"
        style={{ animationPlayState: inView ? "running" : "paused" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ stat */

export function CineStat({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="cine-kicker text-3xl text-white md:text-4xl">{value}</p>
      <p className="mt-1 text-[12.5px] uppercase tracking-[0.14em] text-white/50">{label}</p>
    </div>
  );
}
