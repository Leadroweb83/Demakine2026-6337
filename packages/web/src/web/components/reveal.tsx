import { useEffect, useRef, useState, useSyncExternalStore, type ElementType, type ReactNode } from "react";
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
 *
 * Duas fontes dizem "este é o primeiro desenho":
 * - `hydrating`: o React está hidratando o HTML do servidor. Vem de useSyncExternalStore, que usa o
 *   snapshot do servidor durante a hidratação, a qualquer hora que ela aconteça. A hidratação do
 *   <Suspense> das páginas acontece depois do commit do App, então um flag global já teria virado
 *   "false" e o cliente desenharia sem `is-in`, diferente do servidor (aviso de hidratação).
 * - `firstPaint`: desenho só no cliente (createRoot) logo no carregamento, quando o painel mudou
 *   depois do build e o HTML do servidor é trocado. Não há hidratação para casar, só evita piscar.
 */
let firstPaint = typeof window === "undefined" || Boolean(window.__DM_SSR__);

/** Chamado pelo App ao terminar o primeiro desenho. */
export function endFirstPaint() {
  firstPaint = false;
}

const subscribeNever = () => () => {};
const clientSnapshot = () => false;
const serverSnapshot = () => true;

/** true no servidor e durante a hidratação; false em qualquer desenho só no cliente. */
function useHydrating() {
  return useSyncExternalStore(subscribeNever, clientSnapshot, serverSnapshot);
}

export function Reveal({ children, className, i = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const hydrating = useHydrating();
  // decidido uma vez, no primeiro render: na hidratação é sempre igual ao HTML do servidor (`is-in`)
  const [startVisible] = useState(hydrating || firstPaint);
  const [visible, setVisible] = useState(startVisible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // quem prefere menos movimento vê tudo de uma vez (o CSS já tira a transição)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
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
