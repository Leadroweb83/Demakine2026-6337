"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Video de fundo do hero. A imagem de capa (primeiro quadro do video) ja esta na
 * pagina e e o LCP; o video so e baixado depois do carregamento, em uma versao
 * vertical menor no celular, e entra com fade quando comeca a rodar.
 * Nao carrega com "reduzir movimento" nem com economia de dados.
 */
export function HeroVideo({ src, mobileSrc, poster }: { src: string; mobileSrc: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (reduce || conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return;
    const pick = () => setSource(window.matchMedia("(max-width: 767px)").matches ? mobileSrc : src);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const t = idle ? idle(pick) : window.setTimeout(pick, 600);
    return () => { if (!idle) clearTimeout(t); };
  }, [src, mobileSrc]);

  // Pausa fora da tela e com a aba em segundo plano
  useEffect(() => {
    const v = ref.current;
    if (!v || !source) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.1 });
    io.observe(v);
    return () => io.disconnect();
  }, [source]);

  if (!source) return null;
  return (
    <video
      ref={ref}
      src={source}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 h-full w-full object-cover object-[68%_center] transition-opacity duration-1000 max-md:object-center ${playing ? "opacity-100" : "opacity-0"}`}
    />
  );
}
