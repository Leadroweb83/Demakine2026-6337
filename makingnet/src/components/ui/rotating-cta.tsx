"use client";

/*
 * Rotating CTA: uma chamada por vez, trocando sozinha, com cinco efeitos de troca:
 *   flap  letreiro de aeroporto (cada letra gira até parar na certa)
 *   roll  a frase antiga rola para cima e a nova sobe de baixo
 *   fade  dissolve com leve deslocamento
 *   blur  desfoca, troca e volta ao foco
 *   type  apaga e redigita, com cursor
 * Pausa com o mouse em cima ou com foco no botão. Com "reduzir movimento", troca sem animação.
 */

import * as React from "react";

export type CtaEffect = "flap" | "roll" | "fade" | "blur" | "type";

export interface CtaItem {
  title: string;
  text?: string;
  label: string;
  href: string;
}

export interface RotatingCtaProps {
  items: CtaItem[];
  effect?: CtaEffect;
  /** Tempo de cada chamada na tela, em milissegundos. */
  interval?: number;
  /** Elemento do título. Use "p" quando a página já tem o título principal em outro lugar. */
  as?: "h2" | "h3" | "p";
  /** Letras por linha no letreiro (efeito flap). */
  columns?: number;
  className?: string;
}

const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZÇÁÃÉÍÓÚ0123456789,.!?-";
const STEP = 125; // ms de cada virada de plaquinha
const STAGGER = 42; // ms entre uma letra e a seguinte
const esc = (c: string) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c);
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function wrap(text: string, cols: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.toUpperCase().split(/\s+/)) {
    if (line && (line + " " + word).length > cols) {
      lines.push(line);
      line = word;
    } else line = line ? line + " " + word : word;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Letreiro de aeroporto de verdade: cada letra é uma plaquinha de duas metades.
 * A metade de cima cai, mostrando a letra seguinte, e a de baixo sobe para fechar a virada.
 * As plaquinhas viram uma a uma, da esquerda para a direita, passando pelas letras do
 * alfabeto em ordem até parar na certa.
 */
function FlapBoard({ text, columns, rows }: { text: string; columns: number; rows: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const first = React.useRef(true);
  const lines = React.useMemo(() => {
    const l = wrap(text, columns);
    while (l.length < rows) l.push("");
    return l.map((s) => s.padEnd(columns, " "));
  }, [text, columns, rows]);
  // O React desenha as plaquinhas uma única vez; depois só o letreiro mexe nelas.
  const initial = React.useRef(lines);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-c]"));
    const target = lines.join("");
    const timers: number[] = [];
    let alive = true;

    const paint = (cell: HTMLElement, ch: string) => {
      cell.querySelectorAll<HTMLElement>(".rc-g").forEach((g) => (g.textContent = ch === " " ? "\u00a0" : ch));
      cell.dataset.v = ch;
      cell.dataset.e = ch === " " ? "1" : "0";
    };
    const flip = (cell: HTMLElement, next: string, done: () => void) => {
      const cur = cell.dataset.v ?? " ";
      const g = (sel: string) => cell.querySelector<HTMLElement>(sel + " .rc-g")!;
      const show = (c: string) => (c === " " ? "\u00a0" : c);
      g(".rc-top").textContent = show(next); // por baixo da aba que cai
      g(".rc-ft").textContent = show(cur); // a aba que cai ainda mostra a letra antiga
      g(".rc-fb").textContent = show(next); // a aba que sobe já mostra a nova
      cell.classList.add("rc-go");
      timers.push(
        window.setTimeout(() => {
          if (!alive) return;
          paint(cell, next);
          cell.classList.remove("rc-go");
          done();
        }, STEP),
      );
    };
    const settle = (cell: HTMLElement, goal: string, delay: number) => {
      const from = CHARS.indexOf(cell.dataset.v ?? " ");
      const to = CHARS.indexOf(goal);
      if (to < 0) return paint(cell, goal);
      if (from === to) return;
      const L = CHARS.length;
      const count = Math.min(7, (to - from + L) % L || L);
      const seq = Array.from({ length: count }, (_, j) => CHARS[(to - (count - 1 - j) + L) % L]);
      let k = 0;
      const next = () => {
        if (!alive || k >= seq.length) return;
        flip(cell, seq[k++], next);
      };
      timers.push(window.setTimeout(next, delay));
    };

    const run = (fromBlank: boolean) => {
      if (!alive) return;
      if (fromBlank) cells.forEach((c) => paint(c, " "));
      let n = 0;
      cells.forEach((c, i) => {
        const goal = target[i] ?? " ";
        if ((c.dataset.v ?? " ") !== goal) settle(c, goal, n++ * STAGGER);
      });
    };

    if (reduced()) {
      first.current = false;
      cells.forEach((c, i) => paint(c, target[i] ?? " "));
    } else if (first.current) {
      first.current = false;
      cells.forEach((c) => paint(c, " "));
      // Na abertura da home o letreiro só começa quando a introdução em vídeo termina.
      if (document.documentElement.classList.contains("intro-on")) {
        const go = () => window.setTimeout(() => run(false), 350);
        window.addEventListener("mk:intro-end", go, { once: true });
        return () => {
          alive = false;
          window.removeEventListener("mk:intro-end", go);
          timers.forEach((t) => window.clearTimeout(t));
        };
      }
      timers.push(window.setTimeout(() => run(false), 250));
    } else run(false);

    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [lines]);

  return (
    <span ref={ref} className="rc-board" aria-hidden="true" style={{ ["--cols" as string]: columns }}>
      {initial.current.map((line, r) => (
        <span key={r} className="rc-row">
          {Array.from(line).map((ch, c) => {
            const t = ch === " " ? "\u00a0" : esc(ch);
            const half = (cls: string) => (
              <span className={"rc-h " + cls}>
                <span className="rc-g" dangerouslySetInnerHTML={{ __html: t }} />
              </span>
            );
            return (
              <span key={c} data-c data-v={ch} data-e={ch === " " ? "1" : "0"} className="rc-cell">
                {half("rc-top rc-s")}
                {half("rc-bot rc-s")}
                {half("rc-top rc-ft")}
                {half("rc-bot rc-fb")}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

function Typed({ text }: { text: string }) {
  const [shown, setShown] = React.useState(text);
  const prev = React.useRef(text);
  React.useEffect(() => {
    if (prev.current === text) return;
    if (reduced()) {
      prev.current = text;
      setShown(text);
      return;
    }
    let cur = prev.current;
    prev.current = text;
    let deleting = true;
    const id = window.setInterval(() => {
      if (deleting) {
        cur = cur.slice(0, -2);
        if (!cur.length) deleting = false;
      } else {
        cur = text.slice(0, cur.length + 1);
        if (cur.length >= text.length) window.clearInterval(id);
      }
      setShown(cur);
    }, 28);
    return () => window.clearInterval(id);
  }, [text]);
  return (
    <span aria-hidden="true">
      {shown}
      <span className="rc-caret" />
    </span>
  );
}

export default function RotatingCta({
  items,
  effect = "flap",
  interval = 5200,
  as: Tag = "h2",
  columns = 16,
  className,
}: RotatingCtaProps) {
  const [index, setIndex] = React.useState(0);
  const [leaving, setLeaving] = React.useState(false);
  const paused = React.useRef(false);
  const rows = React.useMemo(() => Math.max(...items.map((i) => wrap(i.title, columns).length)), [items, columns]);

  const go = React.useCallback(
    (next: number) => {
      const swap = effect === "roll" || effect === "fade" || effect === "blur";
      if (swap && !reduced()) {
        setLeaving(true);
        window.setTimeout(() => {
          setIndex(next);
          setLeaving(false);
        }, 420);
      } else setIndex(next);
    },
    [effect],
  );

  React.useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      go((index + 1) % items.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [index, interval, items.length, go]);

  const item = items[index];
  const hold = (v: boolean) => () => (paused.current = v);

  return (
    <div
      className={"rc-root" + (className ? " " + className : "")}
      data-effect={effect}
      onPointerEnter={hold(true)}
      onPointerLeave={hold(false)}
      onFocusCapture={hold(true)}
      onBlurCapture={hold(false)}
    >
      <style>{`
.rc-root{--rc-ease:cubic-bezier(.22,.61,.36,1)}
.rc-title{margin:0;font-family:var(--font-display);font-weight:400;text-transform:uppercase;line-height:1.02;
  font-size:clamp(2.3rem,5.4vw,4.8rem);color:#fff;perspective:900px}
.rc-swap{display:block;transform-origin:50% 50% -.4em;animation:rc-in .6s var(--rc-ease) both}
.rc-swap[data-leaving="true"]{animation:rc-out .42s var(--rc-ease) both}
[data-effect="fade"]{--rc-y:18px;--rc-rx:0deg;--rc-blur:0px}
[data-effect="roll"]{--rc-y:.5em;--rc-rx:-78deg;--rc-blur:0px}
[data-effect="blur"]{--rc-y:0px;--rc-rx:0deg;--rc-blur:18px}
@keyframes rc-in{from{opacity:0;transform:translateY(var(--rc-y)) rotateX(var(--rc-rx));filter:blur(var(--rc-blur))}}
@keyframes rc-out{to{opacity:0;transform:translateY(calc(var(--rc-y) * -1)) rotateX(calc(var(--rc-rx) * -1));filter:blur(var(--rc-blur))}}
.rc-board{display:grid;gap:.12em;font-size:min(clamp(1.5rem,3.4vw,3.1rem),calc((100vw - 48px) / (var(--cols) * .98)))}
.rc-row{display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:.1em;width:fit-content}
.rc-cell{position:relative;display:block;width:.86em;height:1.34em;perspective:1.1em;font-family:var(--font-display);line-height:1;transition:opacity .4s}
.rc-cell[data-e="1"]{opacity:.3}
.rc-cell::after{content:"";position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:#000;z-index:5}
.rc-h{position:absolute;left:0;right:0;height:50%;overflow:hidden;color:#fff;backface-visibility:hidden}
.rc-top{top:0;border-radius:.1em .1em 0 0;background:linear-gradient(#1b252d,#0e1419);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),inset 1px 0 0 rgba(255,255,255,.05),inset -1px 0 0 rgba(255,255,255,.05)}
.rc-bot{bottom:0;border-radius:0 0 .1em .1em;background:linear-gradient(#090d11,#141c22);box-shadow:inset 0 -1px 0 rgba(255,255,255,.06),inset 1px 0 0 rgba(255,255,255,.05),inset -1px 0 0 rgba(255,255,255,.05)}
.rc-g{position:absolute;left:0;right:0;height:200%;display:grid;place-items:center;font-size:inherit}
.rc-top .rc-g{top:0}
.rc-bot .rc-g{top:-100%}
.rc-ft{z-index:3;transform-origin:50% 100%}
.rc-fb{z-index:2;transform-origin:50% 0;transform:rotateX(90deg)}
.rc-go .rc-ft{animation:rc-ft calc(var(--rc-step,125ms) / 2) ease-in forwards}
.rc-go .rc-fb{animation:rc-fb calc(var(--rc-step,125ms) / 2) ease-out calc(var(--rc-step,125ms) / 2) forwards}
@keyframes rc-ft{to{transform:rotateX(-90deg);filter:brightness(.55)}}
@keyframes rc-fb{from{transform:rotateX(90deg);filter:brightness(.55)}to{transform:rotateX(0);filter:brightness(1)}}
.rc-caret{display:inline-block;width:.06em;height:.82em;margin-left:.06em;background:var(--color-brand);vertical-align:-.04em;animation:rc-blink 1s steps(2) infinite}
@keyframes rc-blink{50%{opacity:0}}
.rc-body{margin-top:22px;animation:rc-body .7s var(--rc-ease) both}
@keyframes rc-body{from{opacity:0;transform:translateY(12px)}}
.rc-text{margin:0 0 22px;max-width:42ch;font-size:clamp(1rem,1.3vw,1.15rem);line-height:1.6;color:#d5dfe4}
.rc-dots{display:flex;gap:8px;margin-top:28px}
.rc-dot{width:28px;height:28px;padding:0;border:0;background:none;cursor:pointer;display:grid;place-items:center}
.rc-dot::after{content:"";width:100%;height:3px;border-radius:2px;background:rgba(255,255,255,.28);transition:background .3s}
.rc-dot[aria-current="true"]::after{background:var(--color-brand)}
.rc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.rc-swap,.rc-body,.rc-go .rc-ft,.rc-go .rc-fb,.rc-caret{animation:none!important}}
`}</style>

      <Tag className="rc-title">
        <span className="rc-sr">{item.title}</span>
        {effect === "flap" && <FlapBoard text={item.title} columns={columns} rows={rows} />}
        {effect === "type" && <Typed text={item.title} />}
        {(effect === "roll" || effect === "fade" || effect === "blur") && (
          <span key={index} className="rc-swap" data-leaving={leaving} aria-hidden="true">
            {item.title}
          </span>
        )}
      </Tag>

      <div key={index} className="rc-body">
        {item.text && <p className="rc-text">{item.text}</p>}
        <a className="btn btn--primary" href={item.href} style={{ pointerEvents: "auto" }}>
          {item.label}
        </a>
      </div>

      {items.length > 1 && (
        <div className="rc-dots" role="group" aria-label="Escolher chamada" style={{ pointerEvents: "auto" }}>
          {items.map((it, i) => (
            <button
              key={it.title}
              type="button"
              className="rc-dot"
              aria-current={i === index}
              aria-label={`Chamada ${i + 1} de ${items.length}: ${it.title}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
