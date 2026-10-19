import { useState } from "react";
import { Play } from "lucide-react";
import { Reveal } from "./reveal";
import { videoTestimonials, type VideoTestimonial } from "@/lib/video-testimonials";
import { tr } from "@/lib/i18n";

const hasVideo = (v: VideoTestimonial) => Boolean(v.src || v.youtube);

/** Depoimentos de clientes em vídeo. O vídeo só carrega depois do clique (a página não pesa). */
export function VideoTestimonials() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videoTestimonials.map((v, i) => (
        <Reveal key={`${v.company}-${i}`} i={i % 3} className="h-full">
          {hasVideo(v) ? <VideoCard v={v} /> : <EmptySlot />}
        </Reveal>
      ))}
    </div>
  );
}

function EmptySlot() {
  return (
    <figure className="h-full">
      <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dm-line bg-white px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-dm-blue-soft text-dm-blue">
          <Play className="h-6 w-6 translate-x-0.5" />
        </span>
        <p className="text-[15px] font-semibold text-dm-ink">Depoimento em vídeo em breve</p>
      </div>
    </figure>
  );
}

function VideoCard({ v }: { v: VideoTestimonial }) {
  const [playing, setPlaying] = useState(false);
  const label = tr("Assistir ao depoimento de {nome}", { nome: v.name || v.company });

  return (
    <figure className="h-full">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-dm-line bg-dm-blue-deep">
        {playing ? (
          v.youtube ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&rel=0&modestbranding=1`}
              title={label}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video className="absolute inset-0 h-full w-full object-cover" src={v.src} poster={v.poster} controls autoPlay playsInline>
              <track kind="captions" />
            </video>
          )
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={label} className="group absolute inset-0 h-full w-full">
            {v.poster && <img src={v.poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
            <span className="absolute inset-0 bg-gradient-to-t from-dm-blue-deep/70 to-transparent" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-dm-red text-white shadow-lg transition-transform group-hover:scale-110">
              <Play className="h-7 w-7 translate-x-0.5" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3">
        <span className="block text-[15px] font-bold text-dm-ink">{v.name}</span>
        <span className="block text-[13px] text-dm-gray">{[v.company, v.city].filter(Boolean).join(" · ")}</span>
      </figcaption>
    </figure>
  );
}
