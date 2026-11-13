"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { tunnel } from "@/content/site";

// O tunel (e a biblioteca de animacao dele) so e baixado quando a secao esta perto da tela.
const Tunnel = dynamic(() => import("./ui/perspective-tunnel-hero"), { ssr: false });

/**
 * Mostra a faixa estatica (`fallback`) por padrao: serve para quem nao tem JS, para
 * buscadores e para quem pediu menos movimento. Com movimento permitido, troca pelo
 * tunel um pouco antes de a secao aparecer, e so se ela ainda estiver ABAIXO da tela,
 * para a troca de altura nao empurrar o conteudo que o visitante esta lendo.
 */
export function TunnelLazy({ fallback }: { fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (e.isIntersecting && e.boundingClientRect.top > window.innerHeight * 0.1) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px 100% 0px", threshold: [0, 0.1, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {live ? <Tunnel items={tunnel.items} eyebrow={tunnel.eyebrow} title={tunnel.title} highlight={tunnel.highlight} prompt={tunnel.prompt} /> : fallback}
    </div>
  );
}
