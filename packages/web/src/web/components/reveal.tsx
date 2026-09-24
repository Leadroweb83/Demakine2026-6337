import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** índice para stagger (70ms por passo) */
  i?: number;
  as?: ElementType;
};

/**
 * Página pré-renderizada: no primeiro desenho as seções nascem visíveis, então o HTML aparece sem
 * esperar o JavaScript (é o que conta para a primeira pintura e para o LCP). As que estão abaixo da
 * tela voltam a esconder logo depois e animam ao rolar. Depois disso (navegação dentro do site),
 * nascem escondidas como sempre.
 */
let firstPaint = typeof window === "undefined" || Boolean(window.__DM_SSR__);

/** Chamado pelo App ao terminar o primeiro desenho. */
export function endFirstPaint() {
  firstPaint = false;
}

export function Reveal({ children, className, i = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [startVisible] = useState(firstPaint);
  const [visible, setVisible] = useState(startVisible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (startVisible) {
      // já na tela no carregamento: fica como está, sem animação
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      setVisible(false);
    }
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startVisible]);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", visible && "is-in", className)}
      style={{ ["--i" as string]: i }}
    >
      {children}
    </Tag>
  );
}
