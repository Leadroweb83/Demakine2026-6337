"use client";

import { useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
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
 *   data-count            numero em contador mecanico (digitos girando)
 *   data-hscroll          linha do tempo que rola na horizontal
 *   data-route            traco de rota que se desenha no mapa
 *   data-cursor-label     texto que o cursor mostra sobre o elemento
 *   data-fill             frase que vai acendendo palavra a palavra com o scroll
 *   data-drag             elemento arrastavel que volta com mola ao soltar
 *   data-story            secao fixa com passos trocados pelo scroll
 * Nada roda com prefers-reduced-motion, e nada altera layout (sem CLS).
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const leaving = useRef(false);

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

          // Transicao entre paginas: cortina no azul da marca cobre e descobre
          const curtain = q("[data-curtain]")[0];
          if (curtain) {
            if (leaving.current) {
              leaving.current = false;
              gsap.fromTo(curtain, { yPercent: 0, display: "flex" }, { yPercent: -100, duration: 0.75, ease: "expo.inOut", delay: 0.1, onComplete: () => { gsap.set(curtain, { display: "none" }); } });
            }
            const onNav = (e: MouseEvent) => {
              if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              const a = (e.target as Element).closest("a");
              if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
              const url = new URL(a.href, location.href);
              if (url.origin !== location.origin || url.pathname === location.pathname) return;
              e.preventDefault();
              leaving.current = true;
              gsap.fromTo(curtain, { yPercent: 100, display: "flex" }, {
                yPercent: 0, duration: 0.55, ease: "expo.inOut",
                onComplete: () => router.push(url.pathname + url.search + url.hash),
              });
            };
            document.addEventListener("click", onNav, true);
            ctx.add(() => () => document.removeEventListener("click", onNav, true));
          }

          // Filete dourado de progresso de leitura
          const progress = q("[data-progress]")[0];
          if (progress) {
            gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
          }

          // Imagens que se revelam por recorte, de baixo para cima
          q("[data-clip]").forEach((el) => {
            gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
              clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out",
              scrollTrigger: { trigger: el.parentElement, start: "top 80%", once: true },
            });
          });

          // Painel que segue o cursor nas linhas de area
          const preview = q("[data-preview]")[0] as HTMLElement | undefined;
          if (hover && preview) {
            const items = gsap.utils.toArray<HTMLElement>("[data-preview-item]", preview);
            gsap.set(preview, { display: "block", autoAlpha: 0, scale: 0.9, xPercent: 35, yPercent: -108 });
            gsap.set(items, { autoAlpha: 0 });
            const px = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
            const py = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
            const rows = q("[data-preview-index]");
            const enter = (e: Event) => {
              const i = Number((e.currentTarget as HTMLElement).dataset.previewIndex);
              gsap.to(items, { autoAlpha: (n: number) => (n === i ? 1 : 0), duration: 0.35, overwrite: true });
              gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out", overwrite: "auto" });
            };
            const leave = () => gsap.to(preview, { autoAlpha: 0, scale: 0.9, duration: 0.3, overwrite: "auto" });
            const track = (e: PointerEvent) => { px(e.clientX); py(e.clientY); };
            rows.forEach((r) => { r.addEventListener("pointerenter", enter); r.addEventListener("pointerleave", leave); r.addEventListener("pointermove", track as EventListener); });
            ctx.add(() => () => rows.forEach((r) => { r.removeEventListener("pointerenter", enter); r.removeEventListener("pointerleave", leave); r.removeEventListener("pointermove", track as EventListener); }));
          }

          // Abertura: monograma e cortina, uma vez por sessao (menos de 1,5s)
          const intro = q("[data-intro]")[0];
          if (intro && hover && !html.classList.contains("intro-done")) {
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

          // Numeros: contador mecanico, cada digito gira em sua coluna
          q("[data-count]").forEach((el) => {
            const text = el.textContent ?? "";
            el.setAttribute("role", "img");
            el.setAttribute("aria-label", text);
            el.textContent = "";
            const cols: { col: HTMLElement; d: number }[] = [];
            [...text].forEach((ch) => {
              if (!/\d/.test(ch)) { el.append(ch); return; }
              const win = document.createElement("span");
              win.style.cssText = "display:inline-block;height:1.05em;line-height:1.05;overflow:hidden;vertical-align:bottom";
              const col = document.createElement("span");
              col.style.cssText = "display:block;white-space:pre-line;will-change:transform";
              col.textContent = "0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n0\n1\n2\n3\n4\n5\n6\n7\n8\n9";
              win.append(col); el.append(win);
              cols.push({ col, d: Number(ch) });
            });
            cols.forEach(({ col, d }, i) => {
              gsap.fromTo(col, { yPercent: 0 }, {
                yPercent: -((10 + d) / 20) * 100,
                duration: 2 + i * 0.35,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
            });
            ctx.add(() => () => { el.textContent = text; el.removeAttribute("role"); });
          });

          // Hero: zoom lento da foto ao longo de 20 segundos
          q("[data-kenburns]").forEach((el) => {
            gsap.fromTo(el, { scale: 1 }, { scale: 1.09, duration: 20, ease: "none" });
          });

          // Hero: brilho dourado que acompanha o cursor
          if (hover) {
            q("[data-spotlight]").forEach((el) => {
              const host = el.closest("section");
              if (!host) return;
              const sx = gsap.quickTo(el, "--sx", { duration: 0.7, ease: "power3", unit: "px" });
              const sy = gsap.quickTo(el, "--sy", { duration: 0.7, ease: "power3", unit: "px" });
              const move = (e: PointerEvent) => { const r = host.getBoundingClientRect(); sx(e.clientX - r.left); sy(e.clientY - r.top); (el as HTMLElement).style.opacity = "1"; };
              const leave = () => { (el as HTMLElement).style.opacity = "0"; };
              host.addEventListener("pointermove", move as EventListener);
              host.addEventListener("pointerleave", leave);
              ctx.add(() => () => { host.removeEventListener("pointermove", move as EventListener); host.removeEventListener("pointerleave", leave); });
            });
          }

          // Faixa de imagens: desliza de lado com a rolagem
          q("[data-strip]").forEach((el) => {
            gsap.fromTo(el, { xPercent: 3 }, { xPercent: -12, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 } });
          });

          // 404: o monograma se monta peca por peca
          q("[data-assemble]").forEach((svg) => {
            const from = [{ x: -90, y: 0 }, { x: 0, y: -90 }, { x: 60, y: -60, rotation: -25 }, { x: 90, y: 40 }];
            gsap.utils.toArray<SVGElement>(svg.children).forEach((piece, i) => {
              gsap.from(piece, { ...from[i % from.length], autoAlpha: 0, duration: 1.1, delay: 0.25 + i * 0.16, ease: "expo.out", transformOrigin: "50% 50%" });
            });
          });

          // Linha que desce ligando os passos
          q("[data-line]").forEach((el) => {
            gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 65%", end: "bottom 65%", scrub: 0.4 } });
          });

          // Rota do mapa: traco dourado que se desenha ate o endereco
          q("[data-route]").forEach((path) => {
            const pin = path.parentElement?.querySelector("[data-route-pin]");
            gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
            const tl = gsap.timeline({ scrollTrigger: { trigger: path, start: "top 80%", once: true } });
            tl.to(path, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut" });
            if (pin) tl.from(pin, { scale: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "back.out(2.5)" }, "-=0.3");
          });

          // Linha do tempo horizontal: a secao fica fixa e os capitulos passam de lado
          if (wide) {
            q("[data-hscroll]").forEach((section) => {
              const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
              if (!track) return;
              section.classList.add("is-h");
              const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 160);
              gsap.to(track, {
                x: () => -dist(),
                ease: "none",
                scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true },
              });
              ctx.add(() => () => section.classList.remove("is-h"));
            });
          }

          // No celular, a primeira dobra nao e animada (o conteudo ja esta na tela)
          const above = (el: Element) => !hover && Boolean(el.closest("main section:first-of-type"));

          // Titulos: linha a linha, depois que a fonte carregou (evita requebra)
          q("[data-split]").forEach((el) => {
            if (above(el)) return;
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                gsap.set(el, { autoAlpha: 1 });
                return gsap.from(self.lines, {
                  yPercent: 150,
                  duration: 1.1,
                  ease: "expo.out",
                  stagger: 0.09,
                  scrollTrigger: { trigger: el, start: "top 88%", once: true },
                });
              },
            });
          });

          // Frase que acende com a leitura
          q("[data-fill]").forEach((el) => {
            SplitText.create(el, {
              type: "words",
              aria: "none",
              autoSplit: true,
              onSplit(self) {
                return gsap.fromTo(self.words, { opacity: 0.16 }, {
                  opacity: 1, ease: "none", stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: true },
                });
              },
            });
          });

          // Blocos
          const reveals = q("[data-reveal]").filter((el) => !above(el));
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
      <div data-curtain className="fixed inset-0 z-[95] hidden items-center justify-center bg-navy" aria-hidden="true">
        <Monogram className="h-16 w-16 text-copper" />
      </div>
      <div data-progress className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-copper-hi" style={{ transform: "scaleX(0)" }} aria-hidden="true" />
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
