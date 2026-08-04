import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import {
  emptyQuiz,
  materials,
  solveQuiz,
  type MaterialKey,
  type QuizAnswers,
} from "@/lib/engine";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type Step = {
  key: keyof QuizAnswers;
  question: string;
  hint: string;
  options: { value: string; label: string; sub?: string }[];
};

const steps: Step[] = [
  {
    key: "material",
    question: "O que você movimenta?",
    hint: "É o que define a família de equipamento.",
    options: materials.map((m) => ({ value: m.key, label: m.label, sub: m.hint })),
  },
  {
    key: "volume",
    question: "Qual o volume por dia?",
    hint: "Define motorização e largura de correia.",
    options: [
      { value: "baixo", label: "Até 500 volumes", sub: "ou até 10 ton/dia" },
      { value: "medio", label: "500 a 2.000 volumes", sub: "ou 10 a 50 ton/dia" },
      { value: "alto", label: "Mais de 2.000 volumes", sub: "ou acima de 50 ton/dia" },
    ],
  },
  {
    key: "move",
    question: "A máquina fica parada ou muda de lugar?",
    hint: "Rodas e pneus automotivos são opcionais de fábrica.",
    options: [
      { value: "fixo", label: "Fica fixa em um ponto", sub: "linha definida, ancorada ao piso" },
      { value: "movel", label: "Preciso deslocar", sub: "carga e descarga de caminhão, pátio" },
    ],
  },
  {
    key: "height",
    question: "Qual altura precisa alcançar?",
    hint: "Acima de 6 m o elevador costuma ser melhor que a esteira inclinada.",
    options: [
      { value: "chao", label: "No nível do piso", sub: "até 1,5 m" },
      { value: "media", label: "Altura média", sub: "1,5 a 6 m" },
      { value: "alta", label: "Altura alta", sub: "acima de 6 m" },
    ],
  },
  {
    key: "ambient",
    question: "Como é o ambiente?",
    hint: "Define acabamento: pintura, galvanização ou inox.",
    options: [
      { value: "comum", label: "Galpão comum", sub: "pintura industrial" },
      { value: "sanitario", label: "Alimentício / sanitário", sub: "aço inox, correia atóxica" },
      { value: "externo", label: "Exposto ao tempo", sub: "galvanizado a fogo" },
    ],
  },
];

/** Quiz de 5 perguntas que termina numa recomendação real de equipamento. */
export function Quiz({ dark = false }: { dark?: boolean }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(emptyQuiz);
  const result = solveQuiz(answers);
  const done = i >= steps.length;

  const box = cn(
    "rounded-2xl border p-6 md:p-8",
    dark ? "border-white/12 bg-white/[0.05] backdrop-blur" : "border-dm-line bg-white shadow-sm",
  );

  if (done && result) {
    return (
      <div className={box}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-dm-red" />
          <p
            className={cn(
              "text-[13px] font-bold uppercase tracking-wide",
              dark ? "text-white/55" : "text-dm-gray",
            )}
          >
            Recomendação para a sua operação
          </p>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="overflow-hidden rounded-2xl bg-dm-surface">
            <img
              src={result.main.images[0]}
              alt={result.main.name}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <h3 className={cn("cine-kicker text-[26px] leading-tight", dark ? "text-white" : "text-dm-ink")}>
              {result.main.name}
            </h3>
            <ul className={cn("mt-4 space-y-2 text-[14.5px]", dark ? "text-white/70" : "text-dm-gray")}>
              {result.reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-dm-red" />
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={waLink(
                  `Olá! Fiz o teste no site e o resultado foi: ${result.main.name}. Quero um orçamento.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="cine-shine inline-flex items-center justify-center rounded-full bg-dm-red px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017]"
              >
                Pedir orçamento
              </a>
              <Link
                href={`/produtos/${result.main.slug}`}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors",
                  dark
                    ? "border-white/25 text-white hover:border-white/60"
                    : "border-dm-line text-dm-ink hover:border-dm-blue hover:text-dm-blue",
                )}
              >
                Ver ficha técnica <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {result.others.length > 0 && (
          <div className={cn("mt-7 border-t pt-5", dark ? "border-white/10" : "border-dm-line")}>
            <p className={cn("text-[13px] font-bold uppercase tracking-wide", dark ? "text-white/45" : "text-dm-gray")}>
              Também vale considerar
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/produtos/${p.slug}`}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors",
                    dark
                      ? "border-white/15 text-white/80 hover:border-white/45"
                      : "border-dm-line text-dm-ink/80 hover:border-dm-blue hover:text-dm-blue",
                  )}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setAnswers(emptyQuiz);
            setI(0);
          }}
          className={cn(
            "mt-6 inline-flex items-center gap-2 text-[13.5px] font-bold uppercase tracking-wide",
            dark ? "text-white/60 hover:text-white" : "text-dm-gray hover:text-dm-blue",
          )}
        >
          <RotateCcw className="h-4 w-4" /> Refazer o teste
        </button>
      </div>
    );
  }

  const step = steps[Math.min(i, steps.length - 1)];
  const progress = ((i + (done ? 1 : 0)) / steps.length) * 100;

  return (
    <div className={box}>
      <div className="flex items-center justify-between">
        <p className={cn("text-[13px] font-bold uppercase tracking-wide", dark ? "text-white/55" : "text-dm-gray")}>
          Pergunta {i + 1} de {steps.length}
        </p>
        {i > 0 && (
          <button
            type="button"
            onClick={() => setI((v) => v - 1)}
            className={cn(
              "inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide",
              dark ? "text-white/55 hover:text-white" : "text-dm-gray hover:text-dm-blue",
            )}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        )}
      </div>

      <div
        className={cn(
          "step-bar mt-3 h-1.5 w-full overflow-hidden rounded-full",
          dark ? "bg-white/12" : "bg-dm-line",
        )}
      >
        <span className="block h-full rounded-full bg-dm-red" style={{ width: `${progress}%` }} />
      </div>

      <h3 className={cn("cine-kicker mt-6 text-[26px] leading-tight", dark ? "text-white" : "text-dm-ink")}>
        {step.question}
      </h3>
      <p className={cn("mt-2 text-[14.5px]", dark ? "text-white/55" : "text-dm-gray")}>{step.hint}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {step.options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              setAnswers((a) => ({
                ...a,
                [step.key]: step.key === "material" ? (o.value as MaterialKey) : o.value,
              }) as QuizAnswers);
              setI((v) => v + 1);
            }}
            className={cn(
              "group rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5",
              dark
                ? "border-white/12 bg-white/[0.04] hover:border-dm-red/70"
                : "border-dm-line bg-white hover:border-dm-red/50 hover:shadow-md",
            )}
          >
            <span className={cn("block text-[15.5px] font-bold", dark ? "text-white" : "text-dm-ink")}>
              {o.label}
            </span>
            {o.sub && (
              <span className={cn("mt-1 block text-[13px]", dark ? "text-white/50" : "text-dm-gray")}>
                {o.sub}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
