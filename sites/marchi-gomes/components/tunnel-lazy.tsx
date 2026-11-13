"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { tunnel } from "@/content/site";

// O tunel (e a biblioteca de animacao dele) so e baixado quando a secao esta perto da tela.
const Tunnel = dynamic(() => import("./ui/perspective-tunnel-hero"), { ssr: false });

const HEIGHT_SVH = 320;

/**
 * Tres estados:
 * - "static": faixa estatica (`fallback`). E o que vale sem JS, para buscadores e para
 *   quem pediu menos movimento.
 * - "reserved": com movimento permitido, logo apos montar, a faixa vira um bloco vazio com a
 *   MESMA altura do tunel. Assim a pagina nao muda de tamanho depois (links do menu e ancoras
 *   continuam caindo no lugar certo) e nada pesado e baixado ainda.
 * - "live": quando a secao esta perto da tela, o tunel substitui o bloco, sem mudar a altura.
 */
export function TunnelLazy({ fallback }: { fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"static" | "reserved" | "live">("static");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMode("reserved");
  }, []);

  useEffect(() => {
    if (mode !== "reserved") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMode("live");
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px 120% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  return (
    <div ref={ref}>
      {mode === "static" && fallback}
      {mode === "reserved" && <div className="bg-ink" style={{ height: `${HEIGHT_SVH}svh` }} aria-hidden="true" />}
      {mode === "live" && (
        <Tunnel items={tunnel.items} eyebrow={tunnel.eyebrow} title={tunnel.title} highlight={tunnel.highlight} prompt={tunnel.prompt} heightSvh={HEIGHT_SVH} />
      )}
    </div>
  );
}
