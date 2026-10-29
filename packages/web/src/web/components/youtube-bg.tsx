import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Vídeo do YouTube como fundo: sem som, sem controles, em repetição e sem clique.
 * Só entra no computador, depois que a página terminou de carregar (não pesa no primeiro carregamento)
 * e nunca para quem pediu menos animação no sistema. A imagem do fundo continua por baixo.
 */
export function YouTubeBg({ id, tint = 0.65 }: { id: string; tint?: number }) {
  const [mount, setMount] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || calm) return;
    const start = () => setMount(true);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  if (!mount) return null;

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: id, // o loop do YouTube só funciona repetindo o próprio vídeo na playlist
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    disablekb: "1",
    iv_load_policy: "3",
    fs: "0",
  });

  return (
    // o vídeo cobre a foto por inteiro e leva por cima o mesmo azul que a foto tem (foto a 35% = azul a 65%)
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 [container-type:size]",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?${params}`}
        title="Vídeo de fundo"
        tabIndex={-1}
        allow="autoplay; encrypted-media; picture-in-picture"
        onLoad={() => window.setTimeout(() => setShown(true), 1200)}
        // cobre a área toda em 16:9 e amplia um pouco para esconder o título e o logo do YouTube nas bordas
        style={{ width: "max(100cqw, 177.78cqh)", height: "max(100cqh, 56.25cqw)" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0"
      />
      <div className="absolute inset-0 bg-dm-blue-deep" style={{ opacity: tint }} />
    </div>
  );
}
