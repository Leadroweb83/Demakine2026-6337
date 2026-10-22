import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Play, Volume2, VolumeX } from "lucide-react";
import { track } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { tr } from "@/lib/i18n";
import { VideoFacade } from "./video-facade";

const pill =
  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur transition-colors max-md:min-h-11";

/**
 * Vídeo do YouTube que começa sozinho, mudo, quando a seção aparece na tela, e pausa quando sai.
 * Dois botões à vista: ligar/desligar o som e ampliar (o mesmo player cresce sobre a página, sem
 * recarregar). O controle do player é feito por mensagem (enablejsapi), sem baixar o script do YouTube.
 * Quem pede menos movimento no sistema recebe o vídeo só com play (VideoFacade). Se o aparelho
 * bloquear o autoplay (economia de bateria no iPhone, economia de dados), aparece um botão de
 * play: o toque libera o vídeo.
 */
export function VideoAutoplay({
  youtube,
  poster,
  label,
  trackId,
  className,
}: {
  youtube: string;
  poster?: string;
  label: string;
  trackId?: string;
  className?: string;
}) {
  const holder = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const [reduce, setReduce] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [stalled, setStalled] = useState(false);
  const playingRef = useRef(false);
  const expandedRef = useRef(false);
  expandedRef.current = expanded;
  const id = trackId ?? youtube;

  const send = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }, []);

  // o player avisa quando começa a tocar (estado 1); sem isso, depois de 5 s mostramos o botão de play
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      let d: { event?: string; info?: unknown } | null = null;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      const info = d?.info as { playerState?: number } | number | undefined;
      const state = d?.event === "onStateChange" ? info : typeof info === "object" ? info?.playerState : undefined;
      if (state === 1) {
        playingRef.current = true;
        setPlaying(true);
        setStalled(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      if (!playingRef.current) setStalled(true);
    }, 5000);
    return () => clearTimeout(t);
  }, [mounted]);

  useEffect(() => {
    setOrigin(window.location.origin);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setReduce(true);
  }, []);

  // começa quando metade do vídeo aparece; pausa quando sai (menos dado e bateria)
  useEffect(() => {
    const el = holder.current;
    if (!el || reduce || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          setMounted(true);
          send("playVideo");
        } else if (!expandedRef.current) {
          send("pauseVideo");
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, send]);

  // ampliado: Esc fecha e a página atrás não rola
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  const onFrameLoad = () => {
    // pede ao player que avise as mudanças de estado e mostra o vídeo (a capa fica por baixo até lá)
    const listen = () =>
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
    listen();
    setTimeout(listen, 800);
    setTimeout(() => setReady(true), 700);
  };

  const startByTap = () => {
    send("mute");
    send("playVideo");
    setStalled(false);
  };

  const toggleSound = () => {
    if (muted) {
      send("unMute");
      send("setVolume", [100]);
      track("video_unmute", { video_id: id });
    } else {
      send("mute");
    }
    setMuted(!muted);
  };

  const toggleExpand = () => {
    if (!expanded) track("video_expand", { video_id: id });
    setExpanded(!expanded);
  };

  if (reduce) return <VideoFacade youtube={youtube} poster={poster} label={label} trackId={id} className={cn("rounded-2xl", className)} />;

  const src = `https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtube}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;

  return (
    // o espaço da página continua reservado; o player (mesmo elemento) é que cresce quando ampliado
    <div ref={holder} className={cn("relative aspect-video", className)}>
      <div className={expanded ? "fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4" : "absolute inset-0"}>
        {expanded && (
          <button type="button" tabIndex={-1} aria-label={tr("Reduzir")} onClick={() => setExpanded(false)} className="absolute inset-0 h-full w-full cursor-default" />
        )}
        <div
          className={cn(
            "relative overflow-hidden bg-dm-blue-deep",
            expanded ? "aspect-video w-full max-w-6xl rounded-xl" : "h-full w-full rounded-2xl border border-dm-line",
          )}
        >
          {/* a capa fica sempre por baixo: aparece enquanto o player carrega */}
          {poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          {mounted && origin && (
            <iframe
              ref={frame}
              className={cn("absolute inset-0 h-full w-full transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
              src={src}
              title={label}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={onFrameLoad}
            />
          )}

          {stalled && !playing && (
            <button type="button" onClick={startByTap} aria-label={tr("Reproduzir")} className="group absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-dm-red text-white shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-7 w-7 translate-x-0.5" />
              </span>
            </button>
          )}

          <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              className={cn(pill, muted ? "bg-dm-red hover:bg-[#c31017]" : "bg-black/65 hover:bg-black/80")}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? tr("Ativar som") : tr("Silenciar")}
            </button>
            <button type="button" onClick={toggleExpand} className={cn(pill, "bg-black/65 hover:bg-black/80")}>
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {expanded ? tr("Reduzir") : tr("Ampliar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
