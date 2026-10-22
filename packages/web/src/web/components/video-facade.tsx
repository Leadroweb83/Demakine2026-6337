import { useState } from "react";
import { Play } from "lucide-react";
import { track } from "@/lib/tracking";
import { cn } from "@/lib/utils";

/**
 * Vídeo em "fachada": mostra a capa (guardada no próprio site) com o botão de play e só carrega o
 * player depois do clique. Assim a página não chama o YouTube antes da pessoa querer assistir, e o
 * clique vira o evento video_play no GA4 (trackId identifica qual vídeo foi).
 */
export function VideoFacade({
  youtube,
  src,
  poster,
  label,
  trackId,
  className,
}: {
  /** id de vídeo do YouTube */
  youtube?: string;
  /** ou arquivo mp4 em public/ */
  src?: string;
  poster?: string;
  /** nome do vídeo, lido por leitor de tela */
  label: string;
  trackId?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(true);
    track("video_play", { video_id: trackId ?? youtube ?? src ?? null });
  };

  return (
    <div className={cn("relative aspect-video overflow-hidden border border-dm-line bg-dm-blue-deep", className)}>
      {playing ? (
        youtube ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0&modestbranding=1`}
            title={label}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video className="absolute inset-0 h-full w-full object-cover" src={src} poster={poster} controls autoPlay playsInline>
            <track kind="captions" />
          </video>
        )
      ) : (
        <button type="button" onClick={play} aria-label={label} className="group absolute inset-0 h-full w-full">
          {poster && <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
          <span className="absolute inset-0 bg-gradient-to-t from-dm-blue-deep/70 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-dm-red text-white shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-0.5" />
          </span>
        </button>
      )}
    </div>
  );
}
