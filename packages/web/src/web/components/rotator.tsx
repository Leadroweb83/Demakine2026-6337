import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Troca palavras no mesmo lugar (usado no headline do hero).
 * Reserva a largura da maior palavra para o texto não "pular".
 */
export function Rotator({
  words,
  interval = 2600,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className={cn("rotator", className)} aria-live="polite">
      {words.map((w, idx) => (
        <span key={w} data-on={idx === i ? "true" : "false"} aria-hidden={idx !== i}>
          {w}
        </span>
      ))}
    </span>
  );
}
