import { useEffect, useRef, useState } from "react";
import { Counter } from "@/components/counter";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export type Milestone = {
  /** ano com 4 caracteres ("2012") ou "Hoje": cada caractere gira na própria coluna */
  when: string;
  /** legenda técnica pequena: local, feira, datas */
  kicker: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  /** "contain" para capas de feira em formato largo, com o fundo desfocado da própria imagem */
  fit?: "cover" | "contain";
  /** mostra os números da empresa (usado só no marco "Hoje") */
  stats?: boolean;
};

const ease = "ease-[cubic-bezier(.7,0,.2,1)]";

/**
 * "Nossa trajetória": no computador a imagem e o ano gigante ficam presos à esquerda e trocam
 * conforme o marco que está no meio da tela; a linha vermelha enche junto. No celular cada marco
 * traz a sua imagem. Mesma lógica de rolagem do "Como fabricamos" da home (sem biblioteca de animação).
 */
export function Trajectory({ steps }: { steps: Milestone[] }) {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

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
  const chars = steps.map((s) => [...s.when.padEnd(4, " ")].slice(0, 4));
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
      {/* palco preso (só computador) */}
      <div className="hidden lg:block">
        <div className="sticky top-24 pb-24">
          <div className="relative aspect-[16/11] overflow-hidden rounded-sm bg-black ring-1 ring-white/15">
            {steps.map((s, i) => (
              <div
                key={`${s.when}-${s.title}`}
                aria-hidden={i !== active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none",
                  i === active ? "opacity-100" : "opacity-0",
                )}
              >
                <Visual step={s} lazy={i > 0} active={i === active} />
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
              {steps[active]!.kicker}
            </p>
            <p className="absolute right-7 top-6 font-mono text-[11px] tabular-nums tracking-[0.2em] text-white/60">
              {pad(active + 1)} / {pad(steps.length)}
            </p>
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
              {/* celular: cada marco traz a própria imagem */}
              <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-sm bg-black ring-1 ring-white/15 lg:hidden">
                <Visual step={s} lazy active />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dm-blue-deep/70 via-transparent to-transparent" />
              </div>

              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/55">{s.kicker}</p>
              {/* no computador o ano gigante do palco já mostra o ano */}
              <p className="mt-3 font-display text-[44px] font-extrabold leading-none text-white md:text-[56px] lg:sr-only">{s.when}</p>
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

function Visual({ step, lazy, active }: { step: Milestone; lazy?: boolean; active: boolean }) {
  const loading = lazy ? "lazy" : undefined;
  // zoom lento na imagem do marco ativo (parado para quem pede menos movimento)
  const zoom = cn(
    "transition-transform duration-[2200ms] ease-out motion-reduce:transition-none motion-reduce:transform-none",
    active ? "scale-100" : "scale-[1.07]",
  );
  if (step.fit === "contain") {
    return (
      <>
        <img src={step.image} alt="" aria-hidden loading={loading} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
        <img src={step.image} alt={step.alt} loading={loading} className={cn("absolute inset-0 h-full w-full object-contain", zoom)} />
      </>
    );
  }
  return <img src={step.image} alt={step.alt} loading={loading} className={cn("absolute inset-0 h-full w-full object-cover", zoom)} />;
}
