import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { BtnGhost, BtnWhats } from "./kit";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type Step = {
  n: string;
  title: string;
  text: string;
  /** foto real da etapa; sem foto, entra o desenho de levantamento */
  image?: string;
  alt: string;
};

/**
 * Etapas reais do processo. Só fotos que mostram a etapa: sem foto de visita técnica,
 * o levantamento ganha um desenho de cotas em vez de uma foto de produto pronto.
 */
const steps: Step[] = [
  {
    n: "01",
    title: "Levantamento",
    text: "Entendemos material, volume por hora, distância, altura e o espaço disponível. Quando faz sentido, vamos até a planta medir.",
    alt: "Desenho de levantamento com comprimento, altura de descarga e material da esteira",
  },
  {
    n: "02",
    title: "Projeto e aprovação",
    text: "A engenharia define comprimento, inclinação, correia, motorização e acessórios. Você aprova o desenho antes de qualquer corte.",
    image: "/img/site/oficina.webp",
    alt: "Estrutura de esteira em montagem na oficina da Demakine",
  },
  {
    n: "03",
    title: "Fabricação",
    text: "Corte, dobra, solda, usinagem e montagem na nossa fábrica em Limeira/SP, com inspeção em cada etapa.",
    image: "/img/site/fabrica.webp",
    alt: "Soldador trabalhando em uma peça na fábrica da Demakine em Limeira/SP",
  },
  {
    n: "04",
    title: "Pintura e testes",
    text: "Tratamento da superfície, pintura PU e teste da máquina rodando antes de sair. Nada embarca sem funcionar.",
    image: "/img/site/projetos.webp",
    alt: "Esteira com moega pintada e pronta dentro da fábrica da Demakine",
  },
  {
    n: "05",
    title: "Entrega e pós-venda",
    text: "Logística acompanhada, orientação de instalação e assistência técnica própria para peças, ajustes e manutenção.",
    image: "/img/site/assistencia.webp",
    alt: "Técnicos da Demakine fazendo manutenção em uma esteira transportadora (imagem ilustrativa)",
  },
];

/**
 * "Como fabricamos": no computador a imagem fica parada à esquerda e troca conforme a etapa
 * que está no meio da tela; a linha vermelha enche junto. No celular, cada etapa traz a sua imagem.
 */
export function Timeline() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // ativa é a última etapa cujo topo já passou do meio da tela (funciona mesmo rolando rápido)
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let next = 0;
      itemRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < mid) next = i;
      });
      setActive(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      {/* imagem parada (só computador) */}
      <div className="hidden lg:block">
        <div className="sticky top-28 aspect-[4/3] overflow-hidden rounded-2xl bg-dm-blue-deep">
          {steps.map((s, i) => (
            <div
              key={s.n}
              aria-hidden={i !== active}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
                i === active ? "opacity-100" : "opacity-0",
              )}
            >
              <StepVisual step={s} lazy={i > 0} />
            </div>
          ))}
          <p className="absolute bottom-4 left-4 rounded-full bg-dm-blue-deep/85 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-white backdrop-blur">
            Etapa {steps[active].n} · {steps[active].title}
          </p>
        </div>
      </div>

      {/* etapas */}
      <div>
        <ol className="relative">
          {/* trilho e progresso */}
          <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-0.5 bg-dm-line" />
          <span
            aria-hidden
            className="absolute left-[19px] top-6 w-0.5 bg-dm-red transition-[height] duration-500 motion-reduce:transition-none"
            style={{ height: `calc((100% - 48px) * ${active / (steps.length - 1)})` }}
          />
          {steps.map((s, i) => (
            <li
              key={s.n}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative pb-12 pl-16 last:pb-0 lg:flex lg:min-h-[44vh] lg:flex-col lg:justify-center lg:pb-0"
            >
              <span
                className={cn(
                  "absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors duration-300 lg:top-1/2 lg:-translate-y-1/2",
                  i <= active ? "border-dm-red bg-dm-red text-white" : "border-dm-line bg-white text-dm-gray",
                )}
              >
                {s.n}
              </span>
              <div
                className={cn(
                  "transition-opacity duration-300 motion-reduce:transition-none",
                  i === active ? "lg:opacity-100" : "lg:opacity-45",
                )}
              >
                <div className="mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-dm-blue-deep lg:hidden">
                  <StepVisual step={s} lazy />
                </div>
                <h3 className="text-[21px] font-bold text-dm-ink md:text-[24px]">{s.title}</h3>
                <p className="mt-2.5 max-w-md text-[15.5px] leading-relaxed text-dm-gray">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap gap-3 pl-16 max-sm:pl-0">
          <BtnWhats className="whitespace-nowrap" href={waLink("Olá! Vim pelo site da Demakine e quero começar pelo levantamento do meu equipamento.")}>
            <MessageCircle className="h-4 w-4" />
            Começar pelo levantamento
          </BtnWhats>
          <BtnGhost className="whitespace-nowrap" to="/contato">
            Pedir orçamento
            <ArrowRight className="h-4 w-4" />
          </BtnGhost>
        </div>
      </div>
    </div>
  );
}

function StepVisual({ step, lazy }: { step: Step; lazy?: boolean }): ReactNode {
  if (!step.image) return <SurveyDrawing label={step.alt} />;
  return (
    <img
      src={step.image}
      alt={step.alt}
      loading={lazy ? "lazy" : undefined}
      className="h-full w-full object-cover"
    />
  );
}

/** Desenho de levantamento: as medidas que a engenharia pede antes de projetar. */
function SurveyDrawing({ label }: { label: string }) {
  const ink = "rgba(255,255,255,0.85)";
  const dim = "rgba(255,255,255,0.45)";
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={label} className="h-full w-full">
      <defs>
        <pattern id="survey-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#survey-grid)" />
      {/* piso */}
      <line x1="40" y1="228" x2="360" y2="228" stroke={dim} strokeWidth="1.5" />
      {/* esteira */}
      <g stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round">
        <line x1="78" y1="210" x2="300" y2="92" />
        <line x1="84" y1="221" x2="306" y2="103" />
        <circle cx="80" cy="215" r="8" />
        <circle cx="303" cy="97" r="8" />
        <line x1="150" y1="190" x2="150" y2="228" />
        <line x1="250" y1="137" x2="250" y2="228" />
      </g>
      {/* cota: comprimento */}
      <g stroke="#e4141b" strokeWidth="1.5">
        <line x1="70" y1="248" x2="303" y2="248" strokeDasharray="5 4" />
        <line x1="70" y1="242" x2="70" y2="254" />
        <line x1="303" y1="242" x2="303" y2="254" />
      </g>
      <text x="186" y="268" textAnchor="middle" fill={ink} fontSize="12" fontWeight="700" letterSpacing="1">
        DISTÂNCIA
      </text>
      {/* cota: altura */}
      <g stroke="#e4141b" strokeWidth="1.5">
        <line x1="332" y1="97" x2="332" y2="228" strokeDasharray="5 4" />
        <line x1="326" y1="97" x2="338" y2="97" />
        <line x1="326" y1="228" x2="338" y2="228" />
      </g>
      <text x="344" y="166" fill={ink} fontSize="12" fontWeight="700" letterSpacing="1" transform="rotate(90 344 166)" textAnchor="middle">
        ALTURA
      </text>
      {/* material e volume */}
      <g fill="none" stroke={dim} strokeWidth="1.5">
        <rect x="40" y="36" width="150" height="56" rx="8" />
      </g>
      <text x="56" y="60" fill={ink} fontSize="12" fontWeight="700" letterSpacing="1">
        MATERIAL
      </text>
      <text x="56" y="80" fill={dim} fontSize="12" letterSpacing="1">
        VOLUME POR HORA
      </text>
    </svg>
  );
}
