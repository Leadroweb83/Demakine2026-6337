"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { Monogram } from "./logo";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Draggable);

/**
 * Sistema unico de motion do site. As paginas sao Server Components e so
 * declaram a intencao por atributo:
 *   data-split            titulo revelado linha a linha (mascara)
 *   data-reveal           bloco que sobe e aparece ao entrar na tela
 *   data-draw             filete que se desenha da esquerda
 *   data-parallax="0.15"  deslocamento leve atrelado ao scroll (so transform)
 *   data-magnetic         botao que acompanha o cursor
 *   data-marquee          faixa continua que acelera com a velocidade do scroll
 *   data-count="20"       numero que conta ate o valor ao entrar na tela
 *   data-cursor-label     texto que o cursor mostra sobre o elemento
 *   data-drag             elemento arrastavel que volta com mola ao soltar
 *   data-story            secao fixa com passos trocados pelo scroll
 * Nada roda com prefers-reduced-motion, e nada altera layout (sem CLS).
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      document.documentElement.classList.add("motion-ready");
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          wide: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
          hover: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { motion, wide, hover } = ctx.conditions as Record<string, boolean>;
          if (!motion) return;

          const html = document.documentElement;

          // Abertura: monograma e cortina, uma vez por sessao (menos de 1,5s)
          const intro = q("[data-intro]")[0];
          if (intro && !html.classList.contains("intro-done")) {
            gsap
              .timeline({
                onComplete: () => {
                  html.classList.add("intro-done");
                  try { sessionStorage.setItem("mg-intro", "1"); } catch {}
                },
              })
              .from(intro.querySelector("svg"), { autoAlpha: 0, scale: 0.86, duration: 0.55, ease: "power3.out" })
              .to(intro.querySelector("svg"), { autoAlpha: 0, y: -24, duration: 0.3, ease: "power2.in" }, "+=0.15")
              .to(intro, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "<0.05");
          }

          // Rolagem suave em desktop com mouse; toque e teclado seguem nativos
          if (hover) {
            const lenis = new Lenis({ lerp: 0.12, anchors: true });
            lenis.on("scroll", ScrollTrigger.update);
            const raf = (t: number) => lenis.raf(t * 1000);
            gsap.ticker.add(raf);
            ctx.add(() => () => { gsap.ticker.remove(raf); lenis.destroy(); });
          }

          // Cursor que acompanha e cresce sobre o que e clicavel
          const cursor = q("[data-cursor]")[0] as HTMLElement | undefined;
          if (hover && cursor) {
            html.classList.add("has-cursor");
            const label = cursor.querySelector("span")!;
            gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0.18, autoAlpha: 0 });
            const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
            const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
            let shown = false;
            const move = (e: PointerEvent) => {
              cx(e.clientX); cy(e.clientY);
              if (!shown) { shown = true; gsap.set(cursor, { x: e.clientX, y: e.clientY }); gsap.to(cursor, { autoAlpha: 1, duration: 0.3 }); }
            };
            const over = (e: PointerEvent) => {
              const t = (e.target as Element).closest?.("[data-cursor-label], a, button, summary, [data-drag]");
              const text = t?.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? "";
              label.textContent = text;
              gsap.to(cursor, { scale: text ? 1 : t ? 0.55 : 0.18, opacity: text || !t ? 1 : 0.28, duration: 0.4, ease: "power3.out", overwrite: "auto" });
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerover", over);
            ctx.add(() => () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerover", over);
              html.classList.remove("has-cursor");
            });
          }

          // Faixa continua: anda sozinha e acelera com o scroll
          q("[data-marquee]").forEach((el) => {
            const track = el.querySelector(".marquee-track");
            const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
            ScrollTrigger.create({
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              onUpdate: (self) => {
                const boost = gsap.utils.clamp(0, 7, Math.abs(self.getVelocity()) / 260);
                gsap.to(loop, { timeScale: 1 + boost, duration: 0.25, overwrite: true });
                gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.25 });
              },
            });
          });

          // Numeros
          q("[data-count]").forEach((el) => {
            const end = Number((el as HTMLElement).dataset.count);
            const o = { v: 0 };
            gsap.to(o, {
              v: end,
              duration: 1.8,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
              onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("pt-BR"); },
            });
          });

          // Titulos: linha a linha, depois que a fonte carregou (evita requebra)
          q("[data-split]").forEach((el) => {
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                gsap.set(el, { autoAlpha: 1 });
                return gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 1.1,
                  ease: "expo.out",
                  stagger: 0.09,
                  scrollTrigger: { trigger: el, start: "top 88%", once: true },
                });
              },
            });
          });

          // Blocos
          const reveals = q("[data-reveal]");
          gsap.set(reveals, { y: 28 });
          ScrollTrigger.batch(reveals, {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }),
          });

          // Filetes
          q("[data-draw]").forEach((el) => {
            gsap.from(el, {
              scaleX: 0,
              duration: 1.2,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            });
          });

          // Parallax leve
          q("[data-parallax]").forEach((el) => {
            const amount = Number((el as HTMLElement).dataset.parallax) || 0.1;
            gsap.fromTo(
              el,
              { yPercent: -amount * 50 },
              {
                yPercent: amount * 50,
                ease: "none",
                scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          });

          // Cabecalho ganha fundo depois da primeira dobra
          const header = q("[data-header]")[0];
          if (header) {
            ScrollTrigger.create({
              start: 80,
              onUpdate: (self) => header.classList.toggle("is-stuck", self.scroll() > 80),
            });
          }

          // Botoes magneticos
          if (hover) {
            q("[data-magnetic]").forEach((el) => {
              const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
              const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
              const move = (e: PointerEvent) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * 0.22);
                yTo((e.clientY - r.top - r.height / 2) * 0.3);
              };
              const leave = () => { xTo(0); yTo(0); };
              el.addEventListener("pointermove", move as EventListener);
              el.addEventListener("pointerleave", leave);
              ctx.add(() => () => {
                el.removeEventListener("pointermove", move as EventListener);
                el.removeEventListener("pointerleave", leave);
              });
            });
          }

          // Arrastar e soltar com mola (equivalente ao createDraggable + createSpring)
          if (hover) {
            q("[data-drag]").forEach((el) => {
              const spin = gsap.to(el.querySelector("[data-drag-spin]"), { rotate: 360, duration: 28, ease: "none", repeat: -1 });
              const [drag] = Draggable.create(el, {
                type: "x,y",
                bounds: el.closest("section"),
                cursor: "grab",
                activeCursor: "grabbing",
                onPress: () => { spin.timeScale(4); gsap.to(el, { scale: 0.94, duration: 0.2 }); },
                onRelease: () => {
                  spin.timeScale(1);
                  gsap.to(el, { x: 0, y: 0, scale: 1, duration: 1.4, ease: "elastic.out(1, 0.32)" });
                },
              });
              ctx.add(() => () => { drag.kill(); spin.kill(); });
            });
          }

          // Storytelling: a rolagem continua nativa (sticky), so o conteudo troca
          if (wide) {
            q("[data-story]").forEach((section) => {
              section.classList.add("is-pinned");
              const steps = gsap.utils.toArray<HTMLElement>("[data-story-step]", section);
              const nums = gsap.utils.toArray<HTMLElement>("[data-story-num]", section);
              const bar = section.querySelector("[data-story-bar]");
              gsap.set(steps.slice(1), { autoAlpha: 0, y: 48 });
              gsap.set(nums.slice(1), { opacity: 0.35 });
              const tl = gsap.timeline({
                defaults: { ease: "power2.inOut", duration: 0.5 },
                scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6 },
              });
              if (bar) tl.fromTo(bar, { scaleX: 1 / steps.length }, { scaleX: 1, ease: "none", duration: steps.length - 1 }, 0);
              steps.forEach((step, i) => {
                if (i === 0) return;
                const at = i - 0.75;
                tl.to(steps[i - 1], { autoAlpha: 0, y: -48 }, at)
                  .to(nums[i - 1], { opacity: 0.35 }, at)
                  .to(step, { autoAlpha: 1, y: 0 }, at + 0.25)
                  .to(nums[i], { opacity: 1 }, at + 0.25);
              });
              ctx.add(() => () => {
                section.classList.remove("is-pinned");
                gsap.set([...steps, ...nums], { clearProps: "all" });
              });
            });
          }
        },
      );

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={root}>
      <div data-intro className="fixed inset-0 z-[100] items-center justify-center bg-ink" aria-hidden="true">
        <Monogram className="h-20 w-20 text-copper" />
      </div>
      <div
        data-cursor
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] h-24 w-24 items-center justify-center rounded-full bg-copper-hi text-center text-[0.6rem] font-semibold uppercase leading-tight tracking-[0.14em] text-ink"
      >
        <span />
      </div>
      {children}
    </div>
  );
}
