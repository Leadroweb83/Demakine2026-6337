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

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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

/** Letreiro de aeroporto: grade fixa de células; cada uma gira letras até parar na letra certa. */
function FlapBoard({ text, columns, rows }: { text: string; columns: number; rows: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const first = React.useRef(true);
  const lines = React.useMemo(() => {
    const l = wrap(text, columns);
    while (l.length < rows) l.push("");
    return l.map((s) => s.padEnd(columns, " "));
  }, [text, columns, rows]);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-c]"));
    const target = lines.join("");
    const put = (c: HTMLElement, ch: string) => {
      c.textContent = ch === " " ? "\u00a0" : ch;
      c.dataset.e = ch === " " ? "1" : "0";
    };
    if (first.current || reduced()) {
      first.current = false;
      cells.forEach((c, k) => put(c, target[k]));
      return;
    }
    const timers: number[] = [];
    cells.forEach((cell, i) => {
      const goal = target[i] === " " ? " " : target[i];
      if (cell.textContent === goal) return;
      const col = i % columns;
      const row = Math.floor(i / columns);
      const spins = 5 + col + row * 3;
      let n = 0;
      const id = window.setInterval(() => {
        n++;
        if (n >= spins) {
          put(cell, target[i]);
          window.clearInterval(id);
        } else {
          cell.textContent = CHARS[(Math.random() * CHARS.length) | 0];
          cell.dataset.e = "0";
        }
        cell.classList.remove("rc-tick");
        void cell.offsetWidth;
        cell.classList.add("rc-tick");
      }, 45);
      timers.push(id);
    });
    return () => timers.forEach((t) => window.clearInterval(t));
  }, [lines, columns]);

  return (
    <span ref={ref} className="rc-board" aria-hidden="true" style={{ ["--cols" as string]: columns }}>
      {lines.map((line, r) => (
        <span key={r} className="rc-row">
          {Array.from(line).map((ch, c) => (
            <span key={c} data-c data-e={ch === " " ? "1" : "0"} className="rc-cell">
              {ch === " " ? " " : ch}
            </span>
          ))}
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
.rc-cell{display:grid;place-items:center;width:.86em;height:1.34em;border-radius:.1em;background:linear-gradient(#141c22 49%,#05080b 50%,#0f161b 51%);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);color:#fff;font-family:var(--font-display);line-height:1;backface-visibility:hidden}
.rc-cell{transition:opacity .4s}
.rc-cell[data-e="1"]{opacity:.26}
.rc-tick{animation:rc-flip .09s linear}
@keyframes rc-flip{from{transform:rotateX(-62deg);filter:brightness(1.7)}}
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
@media (prefers-reduced-motion:reduce){.rc-swap,.rc-body,.rc-tick,.rc-caret{animation:none!important}}
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
