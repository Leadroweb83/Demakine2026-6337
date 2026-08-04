import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./reveal";

type Step = {
  n: string;
  title: string;
  text: string;
  image: string;
};

/** Etapas reais do nosso processo, ilustradas com fotos de projetos executados. */
const steps: Step[] = [
  {
    n: "01",
    title: "Levantamento",
    text: "Entendemos material, volume por hora, distância, altura e o espaço disponível. Quando faz sentido, vamos até a planta medir.",
    image: "/img/projetos/granel-moega-especial/1.jpg",
  },
  {
    n: "02",
    title: "Projeto e aprovação",
    text: "A engenharia define comprimento, inclinação, correia, motorização e acessórios. Você aprova o desenho antes de qualquer corte.",
    image: "/img/site/oficina.jpg",
  },
  {
    n: "03",
    title: "Fabricação",
    text: "Corte, dobra, solda, usinagem e montagem na nossa fábrica em Limeira/SP, com inspeção em cada etapa.",
    image: "/img/site/fabrica.jpg",
  },
  {
    n: "04",
    title: "Pintura e testes",
    text: "Tratamento da superfície, pintura industrial e teste da máquina rodando antes de sair. Nada embarca sem funcionar.",
    image: "/img/projetos/esteira-em-z/1.jpg",
  },
  {
    n: "05",
    title: "Entrega e pós-venda",
    text: "Logística acompanhada, orientação de instalação e assistência técnica própria para peças, ajustes e manutenção.",
    image: "/img/projetos/esteira-galvanizada-elevacao-correia-taliscada/1.jpg",
  },
];

export function Timeline() {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(520, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Etapa anterior"
          className="rounded-full border border-dm-line p-2.5 text-dm-gray transition-colors hover:border-dm-blue hover:text-dm-blue"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Próxima etapa"
          className="rounded-full border border-dm-line p-2.5 text-dm-gray transition-colors hover:border-dm-blue hover:text-dm-blue"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={railRef}
        className="rail no-scrollbar -mx-4 mt-5 flex snap-x gap-5 overflow-x-auto px-4 pb-2"
      >
        {steps.map((s, i) => (
          <Reveal key={s.n} i={i % 3} className="w-[78vw] shrink-0 sm:w-[340px]">
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white">
              <div className="relative aspect-[16/10] overflow-hidden bg-dm-surface">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-dm-blue-deep/90 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-white">
                  Etapa {s.n}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[17px] font-bold text-dm-ink">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dm-gray">{s.text}</p>
              </div>
              <div className="h-1 w-full bg-dm-line">
                <div
                  className="h-full bg-dm-red"
                  style={{ width: `${((i + 1) / steps.length) * 100}%` }}
                />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
