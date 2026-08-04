import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Hotspot = {
  /** posição em % da imagem */
  x: number;
  y: number;
  title: string;
  text: string;
};

/** Pontos padrão para as esteiras da linha (foto de catálogo em 3/4). */
export const beltHotspots: Hotspot[] = [
  {
    x: 84,
    y: 12,
    title: "Motoredutor blindado",
    text: "Redutor fechado e motor dimensionado por modelo, de 0,75 a 7,5 cv. Sem corrente exposta, com reversão para carga e descarga.",
  },
  {
    x: 64,
    y: 37,
    title: "Correia taliscada",
    text: "Taliscas soldadas na correia impedem o retorno do material na subida. Também fabricamos lisa, em V, PVC atóxica e emborrachada.",
  },
  {
    x: 50,
    y: 60,
    title: "Estrutura em aço 1020",
    text: "Perfil dobrado e soldado na nossa fábrica, com pintura industrial. É a mesma estrutura que aguenta turno cheio há mais de 15 anos.",
  },
  {
    x: 72,
    y: 57,
    title: "Ajuste de altura",
    text: "Regulagem elétrica ou manual da altura de descarga, para atender caminhão, silo, empilhadeira ou bancada.",
  },
  {
    x: 83,
    y: 58,
    title: "Rodas e pneus automotivos",
    text: "Deslocamento fácil dentro do pátio por uma pessoa só. Opcional em praticamente toda a linha.",
  },
  {
    x: 29,
    y: 88,
    title: "Rodízios dianteiros",
    text: "Rodízios reforçados na ponta de carga, com travamento, para posicionar a máquina no ponto exato.",
  },
];

/**
 * Foto com pontos clicáveis explicando cada componente.
 * Funciona no toque (clique alterna) e no teclado.
 */
export function Hotspots({
  image,
  alt,
  points = beltHotspots,
  dark = true,
}: {
  image: string;
  alt: string;
  points?: Hotspot[];
  dark?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-10">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white">
        <img src={image} alt={alt} loading="lazy" className="w-full object-cover" />

        {points.map((p, i) => (
          <button
            key={p.title}
            type="button"
            onClick={() => setOpen(i === open ? null : i)}
            onMouseEnter={() => setOpen(i)}
            aria-label={p.title}
            aria-pressed={open === i}
            className={cn(
              "hotspot-ring absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all",
              open === i
                ? "scale-110 border-white bg-dm-red text-white"
                : "border-white bg-dm-blue-deep/85 text-white hover:bg-dm-red",
            )}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <Plus className="h-4 w-4" />
            <span className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-dm-blue-deep px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white md:block">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <div>
        <ul className="space-y-2">
          {points.map((p, i) => (
            <li key={p.title}>
              <button
                type="button"
                onClick={() => setOpen(i === open ? null : i)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-all",
                  open === i
                    ? dark
                      ? "border-dm-red/70 bg-dm-red/10"
                      : "border-dm-red/50 bg-dm-red/5"
                    : dark
                      ? "border-white/10 bg-white/[0.04] hover:border-white/30"
                      : "border-dm-line bg-white hover:border-dm-blue/40",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                      open === i ? "bg-dm-red text-white" : dark ? "bg-white/12 text-white/80" : "bg-dm-blue-soft text-dm-blue",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className={cn("text-[15.5px] font-bold", dark ? "text-white" : "text-dm-ink")}>
                    {p.title}
                  </span>
                </span>
                {open === i && (
                  <span
                    className={cn(
                      "mt-2 block pl-9 text-[14.5px] leading-relaxed",
                      dark ? "text-white/70" : "text-dm-gray",
                    )}
                  >
                    {p.text}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
