import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Loop infinito (horizontal ou vertical) por CSS: mede uma cópia do conteúdo,
 * duplica e roda a translação a `speed` px/s. No hover cai para `speedOnHover`.
 * Respeita prefers-reduced-motion (para o movimento).
 */
export function InfiniteSlider({
  children,
  direction = "horizontal",
  speed = 40,
  speedOnHover,
  gap = 24,
  reverse = false,
  className,
}: {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  /** pixels por segundo */
  speed?: number;
  speedOnHover?: number;
  gap?: number;
  reverse?: boolean;
  className?: string;
}) {
  const copyRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const [hover, setHover] = useState(false);
  const vertical = direction === "vertical";

  useLayoutEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize(Math.round(vertical ? rect.height + gap : rect.width + gap));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [vertical, gap]);

  const current = hover && speedOnHover ? speedOnHover : speed;
  const duration = size > 0 ? size / Math.max(1, current) : 0;

  return (
    <div
      className={cn("overflow-hidden", vertical ? "h-full" : "w-full", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={cn("inf-track flex", vertical ? "flex-col" : "flex-row")}
        style={{
          gap: `${gap}px`,
          ["--inf-size" as string]: `${size}px`,
          animationName: size > 0 ? (vertical ? "inf-loop-y" : "inf-loop-x") : "none",
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div ref={copyRef} className={cn("flex", vertical ? "flex-col" : "flex-row")} style={{ gap: `${gap}px` }}>
          {children}
        </div>
        <div className={cn("flex", vertical ? "flex-col" : "flex-row")} style={{ gap: `${gap}px` }} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
