import { Play } from "lucide-react";
import { Reveal } from "./reveal";
import { VideoFacade } from "./video-facade";
import { videoTestimonials, type VideoTestimonial } from "@/lib/video-testimonials";
import { cn } from "@/lib/utils";
import { tr } from "@/lib/i18n";

const hasVideo = (v: VideoTestimonial) => Boolean(v.src || v.youtube);

/** Depoimentos de clientes em vídeo. O vídeo só carrega depois do clique (a página não pesa). */
export function VideoTestimonials() {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", videoTestimonials.length > 2 ? "lg:grid-cols-3" : "lg:max-w-4xl")}>
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
      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dm-line bg-white px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-dm-blue-soft text-dm-blue">
          <Play className="h-6 w-6 translate-x-0.5" />
        </span>
        <p className="text-[15px] font-semibold text-dm-ink">Depoimento em vídeo em breve</p>
      </div>
    </figure>
  );
}

function VideoCard({ v }: { v: VideoTestimonial }) {
  const label = tr("Assistir ao depoimento de {nome}", { nome: v.name || v.company });

  return (
    <figure className="h-full">
      <VideoFacade youtube={v.youtube} src={v.src} poster={v.poster} label={label} trackId={`depoimento-${v.company || v.name}`} className="rounded-2xl" />
      <figcaption className="mt-3">
        <span className="block text-[15px] font-bold text-dm-ink">{v.name}</span>
        <span className="block text-[13px] text-dm-gray">{[v.company, v.city].filter(Boolean).join(" · ")}</span>
      </figcaption>
    </figure>
  );
}
