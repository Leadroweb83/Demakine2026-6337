import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { BtnPrimary, BtnWhats } from "@/components/kit";
import { CineBullets, CineRule, CineSection, CineShot, CineStat, CineTag, CineTitle } from "@/components/cine";
import { artigo, getProduct } from "@/lib/content";
import { waLink } from "@/lib/site";
import { home } from "@/lib/home";
import { cn } from "@/lib/utils";

const INTERVAL = 10; // segundos por produto

/** As campeãs da vitrine vêm de lib/home.ts (editáveis no painel, Home). */
const SLIDES = home.bestSellers.filter((s) => getProduct(s.slug)); // produto oculto no catálogo sai da vitrine

type Product = NonNullable<ReturnType<typeof getProduct>>;

const num = (v: string) => Number.parseFloat(v.replace(",", "."));
const br = (n: number) => String(n).replace(".", ",");

/** "3 a 12 m" a partir da coluna da tabela de modelos; vazio se a coluna não existe. */
function range(p: Product, key: string, unit: string) {
  const vals = p.models.map((m) => num(m.specs[key] ?? "")).filter((n) => !Number.isNaN(n));
  if (!vals.length) return "";
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return lo === hi ? `${br(lo)} ${unit}` : `${br(lo)} a ${br(hi)} ${unit}`;
}

function statsFor(p: Product) {
  const motor = range(p, "Motor de tração", "cv");
  return [
    { value: `${p.models.length}`, label: "modelos de tabela" },
    { value: range(p, "Comprimento", "m"), label: "comprimento" },
    motor
      ? { value: motor, label: "motorização" }
      : { value: p.models[0]?.specs["Diâmetro Helicóide"] ?? "", label: "helicoide" },
  ].filter((s) => s.value);
}

/**
 * Vitrine das campeãs de vendas: troca de produto a cada 10 s, com abas que
 * mostram o tempo correndo. Pausa com o mouse em cima, com foco de teclado,
 * fora da tela e pelo botão de pausa; com movimento reduzido não gira sozinha.
 * Todos os slides ficam empilhados na mesma célula do grid, então a seção
 * tem sempre a altura do maior e a página não pula na troca.
 */
export function BestSellers() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [runs, setRuns] = useState<number[]>(() => SLIDES.map(() => 0));
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(false);

  const slides = SLIDES.map((s) => ({ ...s, product: getProduct(s.slug) })).filter(
    (s): s is typeof s & { product: Product } => Boolean(s.product),
  );
  const running = !reduce && !paused && !hover && inView;

  const go = (i: number) => {
    const next = (i + slides.length) % slides.length;
    setActive(next);
    setCycle((c) => c + 1);
    setRuns((r) => r.map((n, j) => (j === next ? n + 1 : n)));
  };

  return (
    <CineSection>
      <div
        ref={ref}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Campeãs de vendas"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
        onFocus={(e) => e.target.matches(":focus-visible") && setHover(true)}
        onBlur={() => setHover(false)}
        className="flex flex-col"
      >
        <div className="grid">
          {slides.map((s, i) => {
            const on = i === active;
            const p = s.product;
            const art = artigo(p.name);
            return (
              <motion.div
                key={s.slug}
                className={cn("[grid-area:1/1]", !on && "pointer-events-none")}
                aria-hidden={!on}
                inert={!on}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.5 }}
              >
                <div
                  key={`${s.slug}-${runs[i]}`}
                  className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
                >
                  <div>
                    <CineTag>Campeãs de vendas</CineTag>
                    <CineTitle className="mt-5" lines={s.lines} as={on ? "h2" : "h3"} />
                    <CineRule className="mt-5" />
                    <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-white/70">{p.summary}</p>
                    <CineBullets className="mt-7" items={p.features.slice(0, 5)} />

                    <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                      {statsFor(p).map((st) => (
                        <CineStat key={st.label} boxed value={st.value} label={st.label} />
                      ))}
                    </div>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                      <BtnPrimary to={`/produtos/${p.slug}`} className="cine-shine">
                        Ver ficha técnica
                      </BtnPrimary>
                      <BtnWhats href={waLink(`Olá! Quero um orçamento ${art.da} ${p.name}.`)} className="cine-shine">
                        Pedir orçamento
                      </BtnWhats>
                    </div>
                  </div>

                  <motion.div
                    initial={reduce || !on ? false : { opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <CineShot src={p.images[0]} alt={p.name} />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* abas com o tempo de cada produto */}
        <div className="order-first mb-8 flex items-stretch gap-2 sm:gap-3 lg:order-none lg:mb-0 lg:mt-10">
          {slides.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => go(i)}
              aria-current={i === active}
              className={cn(
                "group relative flex-1 overflow-hidden rounded-xl border px-3 pb-3 pt-4 text-left transition-colors",
                i === active ? "border-white/30 bg-white/[0.08]" : "border-white/10 hover:border-white/25",
              )}
            >
              <span className="absolute inset-x-0 top-0 h-[3px] bg-white/10">
                {i === active && (
                  <span
                    key={cycle}
                    className="block h-full bg-dm-red"
                    style={{
                      width: reduce ? "100%" : undefined,
                      animation: reduce ? undefined : `bs-progress ${INTERVAL}s linear forwards`,
                      animationPlayState: running ? "running" : "paused",
                    }}
                    onAnimationEnd={() => go(active + 1)}
                  />
                )}
              </span>
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/60">
                0{i + 1}
              </span>
              <span
                className={cn(
                  "mt-1 block truncate text-[13px] font-bold sm:text-[14px]",
                  i === active ? "text-white" : "text-white/60 group-hover:text-white/80",
                )}
              >
                {s.tab}
                {/* nome completo para leitor de tela: o texto visível vem primeiro, como exige a regra de rótulo */}
                <span className="sr-only">: {s.product.name}</span>
              </span>
            </button>
          ))}
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? "Retomar troca automática" : "Pausar troca automática"}
              className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:border-white/25 hover:text-white"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </CineSection>
  );
}
