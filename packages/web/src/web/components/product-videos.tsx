import { useState } from "react";
import { MessageCircle, Play, Youtube } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { BtnGhost, BtnWhats, Section } from "@/components/kit";
import type { ProductVideo } from "@/lib/product-videos";
import { site, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Vídeos do produto em facade: a capa é local e o iframe do YouTube (modo sem cookies)
 * só carrega depois do clique, então nada de terceiro roda antes do visitante escolher.
 */
export function ProductVideos({ productName, videos }: { productName: string; videos: ProductVideo[] }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = videos[current];
  if (!video) return null;

  const choose = (idx: number) => {
    setCurrent(idx);
    setPlaying(true);
  };

  return (
    <Section>
      <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-dm-line bg-black shadow-[0_24px_60px_rgba(10,31,61,0.18)]">
            <div className="aspect-video w-full">
              {playing ? (
                <iframe
                  key={video.id}
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={`Assistir ao vídeo: ${video.title}`}
                  className="group relative block h-full w-full"
                >
                  <img
                    src={`/img/videos/${video.id}.webp`}
                    alt={video.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                  <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/0" />
                  <span className="absolute left-1/2 top-1/2 flex h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-dm-red text-white shadow-[0_18px_44px_rgba(228,20,27,0.45)] transition-transform duration-300 group-hover:scale-110 md:h-[78px] md:w-[78px]">
                    <span className="pulse-ring absolute inset-0 rounded-full border border-white/45" />
                    <Play className="ml-1 h-7 w-7 fill-current" />
                  </span>
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 flex items-baseline gap-2 text-[14px] text-dm-ink/75">
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.16em] text-dm-blue">
              Vídeo real
            </span>
            <span className="font-semibold">{video.title}</span>
          </p>
        </Reveal>

        <Reveal i={1}>
          <p className="eyebrow text-dm-blue">Veja funcionando</p>
          <h2 className="h3 mt-3">A {productName} em operação</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-dm-gray">
            Imagens reais de equipamentos Demakine rodando, do jeito que saem da fábrica em
            Limeira/SP. Ajuda a entender o funcionamento antes de falar com a engenharia.
          </p>

          {videos.length > 1 && (
            <ul className="mt-6 space-y-2.5">
              {videos.map((v, idx) => {
                const active = idx === current;
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => choose(idx)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-xl border p-2.5 text-left transition-colors",
                        active
                          ? "border-dm-blue bg-dm-blue-soft/60"
                          : "border-dm-line bg-white hover:border-dm-blue/40 hover:bg-dm-surface",
                      )}
                    >
                      <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                        <img
                          src={`/img/videos/${v.id}.webp`}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover opacity-90"
                        />
                        <Play className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 fill-white text-white" />
                      </span>
                      <span
                        className={cn(
                          "text-[14px] font-semibold leading-snug",
                          active ? "text-dm-blue" : "text-dm-ink/80",
                        )}
                      >
                        {v.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <BtnWhats
              href={waLink(`Olá! Vi o vídeo da ${productName} no site e quero um orçamento.`)}
              className="gap-2 whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" />
              Pedir orçamento
            </BtnWhats>
            <BtnGhost href={site.social.youtube} external className="gap-2 whitespace-nowrap">
              <Youtube className="h-4 w-4" />
              Mais vídeos
            </BtnGhost>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
