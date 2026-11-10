import type { ReactNode } from "react";
import { Link } from "wouter";
import { Square } from "lucide-react";
import { parseInline, type Inline } from "@/lib/markdown-inline";
import type { Block } from "@/lib/landing-md";
import { cn } from "@/lib/utils";

const LINK = "font-semibold text-dm-blue underline-offset-2 hover:underline";

const LINK_ON_DARK = "font-semibold text-white underline decoration-white/50 underline-offset-2 hover:decoration-white";

function nodes(list: Inline[], dark = false): ReactNode[] {
  return list.map((n, i) => {
    if (n.t === "text") return n.text;
    if (n.t === "b") return <strong key={i} className={dark ? "font-bold text-white" : "font-bold text-dm-ink"}>{nodes(n.kids, dark)}</strong>;
    if (n.t === "i") return <em key={i}>{nodes(n.kids, dark)}</em>;
    const cls = dark ? LINK_ON_DARK : LINK;
    return n.href.startsWith("/") ? (
      <Link key={i} href={n.href} className={cls}>
        {nodes(n.kids, dark)}
      </Link>
    ) : (
      <a key={i} href={n.href} className={cls} rel="noopener">
        {nodes(n.kids, dark)}
      </a>
    );
  });
}

/** Texto em markdown de uma linha (negrito, itálico e links) como elementos do React; `dark` para fundo escuro. */
export function Md({ text, dark = false }: { text: string; dark?: boolean }) {
  return <>{nodes(parseInline(text), dark)}</>;
}

const P = "text-[16.5px] leading-relaxed text-dm-ink/80";

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "p":
      return (
        <p className={cn(P, "mt-5 first:mt-0")}>
          <Md text={b.md} />
        </p>
      );
    case "h3":
      return <h3 className="mt-9 text-[20px] font-bold leading-snug text-dm-ink first:mt-0">{b.text}</h3>;
    case "ul":
    case "ol": {
      const Tag = b.t;
      return (
        <Tag
          className={cn(
            "mt-5 space-y-2.5 pl-6 first:mt-0",
            P,
            b.t === "ul" ? "list-disc marker:text-dm-blue" : "list-decimal marker:font-bold marker:text-dm-blue",
          )}
        >
          {b.items.map((it) => (
            <li key={it.md} className="pl-1">
              <Md text={it.md} />
              {it.sub.length > 0 && (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-dm-gray">
                  {it.sub.map((s) => (
                    <li key={s}>
                      <Md text={s} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Tag>
      );
    }
    case "check":
      return (
        <ul className={cn("mt-5 space-y-3 first:mt-0", P)}>
          {b.items.map((it) => (
            <li key={it} className="flex gap-3">
              <Square className="mt-1 h-4.5 w-4.5 shrink-0 text-dm-blue" aria-hidden />
              <span>
                <Md text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="mt-6 overflow-x-auto first:mt-0">
          <table
            className="w-full border-collapse text-left text-[15px]"
            // 2 colunas cabem em qualquer tela; a partir de 3, cada coluna pede espaço e a tabela rola de lado no celular
            style={{ minWidth: b.head.length > 2 ? `${b.head.length * 7}rem` : undefined }}
          >
            <thead>
              <tr className="border-b-2 border-dm-ink/20 text-[13px] uppercase tracking-wide text-dm-gray">
                {b.head.map((h, i) => (
                  <th key={i} scope="col" className="py-2.5 pr-6 font-bold">
                    {h ? <Md text={h} /> : <span className="sr-only">Item</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r[0]} className="border-b border-dm-line align-top">
                  {r.map((cell, ci) =>
                    ci === 0 ? (
                      <th key={ci} scope="row" className="py-3 pr-6 font-semibold text-dm-ink">
                        <Md text={cell} />
                      </th>
                    ) : (
                      <td key={ci} className="py-3 pr-6 text-dm-ink/80">
                        <Md text={cell} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "quote":
      return (
        <blockquote className="mt-6 rounded-xl bg-dm-surface px-6 py-5 text-[17px] italic leading-relaxed text-dm-ink/80 first:mt-0">
          <Md text={b.md} />
        </blockquote>
      );
    case "code":
      return (
        <pre className="mt-6 overflow-x-auto rounded-xl bg-dm-surface p-5 font-mono text-[14px] leading-relaxed text-dm-ink first:mt-0">
          {b.text}
        </pre>
      );
  }
}

/** Os blocos de uma seção, na ordem do arquivo do Marketing. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </>
  );
}
