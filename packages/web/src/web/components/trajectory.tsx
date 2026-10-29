import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Counter } from "@/components/counter";
import { site } from "@/lib/site";
import { tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type Shot = {
  src: string;
  alt: string;
  /** "contain" para fotos em pé ou muito largas, com o fundo desfocado da própria imagem */
  fit?: "cover" | "contain";
};

export type Milestone = {
  /** ano ou período mostrado no texto ("2012", "2020–2025") */
  when: string;
  /** 4 caracteres que giram no ano gigante do palco; sem ele, usa `when` */
  roll?: string;
  /** legenda técnica pequena: local, feira, datas */
  kicker: string;
  title: string;
  text: string;
  /** uma foto, ou várias: com mais de uma o marco vira um slide */
  images: Shot[];
  /** mostra os números da empresa (usado só no marco final) */
  stats?: boolean;
};

const ease = "ease-[cubic-bezier(.7,0,.2,1)]";
const SLIDE_MS = 4500;

/**
 * Estado de um slide: índice da foto, avanço automático e pausa (mouse em cima ou foco nos botões).
 * `resetKey` volta para a primeira foto quando o marco muda; `autoplay` só roda no marco em foco e
 * nunca para quem pede menos movimento.
 */
function useSlides(count: number, resetKey: unknown, autoplay: boolean) {
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [resetKey]);

  useEffect(() => {
    if (count < 2 || !autoplay || hold) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((v) => (v + 1) % count), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [count, autoplay, hold]);

  const go = (dir: 1 | -1) => setIndex((v) => (v + dir + count) % count);
  return { index: Math.min(index, count - 1), setHold, go };
}

/**
 * "Nossa trajetória": no computador a imagem e o ano gigante ficam presos à esquerda e trocam
 * conforme o marco que está no meio da tela; a linha vermelha enche junto. No celular cada marco
 * traz a sua imagem. Mesma lógica de rolagem do "Como fabricamos" da home (sem biblioteca de animação).
 */
export function Trajectory({ steps }: { steps: Milestone[] }) {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const stage = useSlides(steps[active]!.images.length, active, true);

  useEffect(() => {
    // ativo é o último marco cujo topo já passou do meio da tela (funciona mesmo rolando rápido)
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

  // colunas do ano: a coluna c guarda o caractere c de todos os marcos, e a faixa sobe até o marco ativo
  const chars = steps.map((s) => [...(s.roll ?? s.when).padEnd(4, " ")].slice(0, 4));
  const pad = (n: number) => String(n).padStart(2, "0");
  const current = steps[active]!;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
      {/* palco preso (só computador) */}
      <div className="hidden lg:block">
        <div className="sticky top-24 pb-24">
          <div
            className="relative aspect-[16/11] overflow-hidden rounded-sm bg-black ring-1 ring-white/15"
            onMouseEnter={() => stage.setHold(true)}
            onMouseLeave={() => stage.setHold(false)}
          >
            {steps.map((s, i) => (
              <div
                key={`${s.when}-${s.title}`}
                aria-hidden={i !== active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none",
                  i === active ? "opacity-100" : "opacity-0",
                )}
              >
                <SlideStack shots={s.images} index={i === active ? stage.index : 0} lazy={i !== active} active={i === active} />
              </div>
            ))}

            {/* acabamento de filme: vinheta, grão e marcas de corte */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,10,28,0.65)_100%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dm-blue-deep/80 via-transparent to-dm-blue-deep/40" />
            <div aria-hidden className="film-grain pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay" />
            {[
              "left-3 top-3 border-l border-t",
              "right-3 top-3 border-r border-t",
              "bottom-3 left-3 border-b border-l",
              "bottom-3 right-3 border-b border-r",
            ].map((c) => (
              <span key={c} aria-hidden className={cn("pointer-events-none absolute h-4 w-4 border-white/55", c)} />
            ))}

            <p className="absolute left-7 top-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
              {current.kicker}
            </p>
            <p className="absolute right-7 top-6 font-mono text-[11px] tabular-nums tracking-[0.2em] text-white/60">
              {pad(active + 1)} / {pad(steps.length)}
            </p>

            <SlideControls
              count={current.images.length}
              index={stage.index}
              onGo={stage.go}
              onHold={stage.setHold}
              className="absolute bottom-6 right-7"
            />
          </div>

          {/* ano gigante em branco translúcido, sobreposto à borda do palco */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-2 -left-2 flex select-none font-display text-[clamp(110px,12vw,188px)] font-extrabold leading-none"
          >
            {chars[0]!.map((_, c) => (
              <span key={c} className="block h-[1em] overflow-hidden">
                <span
                  className={cn("flex flex-col transition-transform duration-700 motion-reduce:transition-none", ease)}
                  style={{ transform: `translateY(${-active}em)` }}
                >
                  {chars.map((row, r) => (
                    <span key={r} className="block h-[1em] min-w-[0.5em] text-center text-white/20">
                      {row[c] === " " ? " " : row[c]}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* marcos */}
      <ol className="relative">
        <span aria-hidden className="absolute bottom-6 left-[11px] top-6 w-px bg-white/15" />
        <span
          aria-hidden
          className="absolute left-[11px] top-6 w-px bg-dm-red transition-[height] duration-700 motion-reduce:transition-none"
          style={{ height: `calc((100% - 48px) * ${steps.length > 1 ? active / (steps.length - 1) : 0})` }}
        />
        {steps.map((s, i) => (
          <li
            key={`${s.when}-${s.title}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="relative pb-14 pl-12 last:pb-0 lg:flex lg:min-h-[68vh] lg:flex-col lg:justify-center lg:pb-0"
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-dm-blue-deep transition-colors duration-500 lg:top-1/2 lg:-translate-y-1/2",
                i <= active ? "border-dm-red" : "border-white/25",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full transition-colors duration-500", i <= active ? "bg-dm-red" : "bg-white/25")} />
            </span>

            <div
              className={cn(
                "transition-opacity duration-500 motion-reduce:transition-none",
                i === active ? "lg:opacity-100" : "lg:opacity-35",
              )}
            >
              {/* celular: cada marco traz a própria imagem (ou o próprio slide) */}
              <MobileShots step={s} focused={i === active} />

              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/55">{s.kicker}</p>
              {/* no computador o ano gigante do palco já mostra o ano; um período ("2020–2025") continua visível aqui */}
              <p className={cn("mt-3 font-display text-[44px] font-extrabold leading-none text-white md:text-[56px]", !s.roll && "lg:sr-only")}>{s.when}</p>
              <h3 className="mt-4 text-[22px] font-bold leading-snug text-white md:text-[26px]">{s.title}</h3>
              <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-white/70">{s.text}</p>

              {s.stats && (
                <dl className="mt-8 grid max-w-lg grid-cols-3 gap-5 border-t border-white/15 pt-6">
                  {[
                    { value: site.stats.years, label: "anos" },
                    { value: site.stats.machines, label: "máquinas entregues" },
                    { value: site.stats.clients, label: "clientes atendidos" },
                  ].map((n) => (
                    <div key={n.label} className="flex flex-col">
                      <dt className="order-2 mt-1 text-[11.5px] uppercase leading-tight tracking-wide text-white/55">{n.label}</dt>
                      <dd className="font-display text-[24px] font-extrabold leading-none text-white md:text-[28px]">
                        <Counter to={n.value} suffix="+" />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Foto (ou slide) do marco no celular, onde o palco fixo não existe. */
function MobileShots({ step, focused }: { step: Milestone; focused: boolean }) {
  const slides = useSlides(step.images.length, focused, focused);
  return (
    <div
      className="relative mb-6 aspect-[16/10] overflow-hidden rounded-sm bg-black ring-1 ring-white/15 lg:hidden"
      onMouseEnter={() => slides.setHold(true)}
      onMouseLeave={() => slides.setHold(false)}
    >
      <SlideStack shots={step.images} index={slides.index} lazy active />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dm-blue-deep/70 via-transparent to-transparent" />
      <SlideControls
        count={step.images.length}
        index={slides.index}
        onGo={slides.go}
        onHold={slides.setHold}
        className="absolute bottom-2 right-2"
      />
    </div>
  );
}

/** Todas as fotos do marco empilhadas; só a do índice atual aparece (troca por fade). */
function SlideStack({ shots, index, lazy, active }: { shots: Shot[]; index: number; lazy?: boolean; active: boolean }) {
  return (
    <>
      {shots.map((s, k) => (
        <div
          key={s.src}
          aria-hidden={k !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none",
            k === index ? "opacity-100" : "opacity-0",
          )}
        >
          <ShotImage shot={s} lazy={lazy} active={active && k === index} />
        </div>
      ))}
    </>
  );
}

/** Setas e contador do slide; só aparece quando o marco tem mais de uma foto. */
function SlideControls({
  count,
  index,
  onGo,
  onHold,
  className,
}: {
  count: number;
  index: number;
  onGo: (dir: 1 | -1) => void;
  onHold: (v: boolean) => void;
  className?: string;
}) {
  if (count < 2) return null;
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-dm-blue-deep/70 text-white backdrop-blur transition-colors hover:border-white hover:bg-dm-blue-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  return (
    <div
      role="group"
      aria-label={tr("Fotos do marco")}
      className={cn("z-10 flex items-center gap-2", className)}
      onFocus={() => onHold(true)}
      onBlur={() => onHold(false)}
    >
      <button type="button" aria-label={tr("Foto anterior")} onClick={() => onGo(-1)} className={btn}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="min-w-[3.5rem] text-center font-mono text-[11px] tabular-nums tracking-[0.2em] text-white/80">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <button type="button" aria-label={tr("Próxima foto")} onClick={() => onGo(1)} className={btn}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ShotImage({ shot, lazy, active }: { shot: Shot; lazy?: boolean; active: boolean }) {
  const loading = lazy ? "lazy" : undefined;
  // zoom lento na imagem em foco (parado para quem pede menos movimento)
  const zoom = cn(
    "transition-transform duration-[2200ms] ease-out motion-reduce:transition-none motion-reduce:transform-none",
    active ? "scale-100" : "scale-[1.07]",
  );
  if (shot.fit === "contain") {
    return (
      <>
        <img src={shot.src} alt="" aria-hidden loading={loading} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
        <img src={shot.src} alt={shot.alt} loading={loading} className={cn("absolute inset-0 h-full w-full object-contain", zoom)} />
      </>
    );
  }
  return <img src={shot.src} alt={shot.alt} loading={loading} className={cn("absolute inset-0 h-full w-full object-cover", zoom)} />;
}
