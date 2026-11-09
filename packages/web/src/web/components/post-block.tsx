import { Link } from "wouter";
import { locale, tr } from "@/lib/i18n";

/**
 * Texto com links no formato [texto](/caminho). Os links apontam para páginas que existem só em português; nos outros
 * idiomas o texto aparece sem o link.
 */
function Inline({ text }: { text: string }) {
  const out = tr(text);
  const parts = out.split(/(\[[^\]]+\]\([^)]+\))/g);
  if (parts.length === 1) return <>{out}</>;
  const pt = locale() === "pt";
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!m) return part;
        return pt ? (
          <Link key={i} href={m[2]!} className="font-semibold text-dm-blue underline-offset-2 hover:underline">
            {m[1]}
          </Link>
        ) : (
          m[1]
        );
      })}
    </>
  );
}

/** Um bloco do corpo do post: "# " título, "- " item de lista, "1. " lista numerada, senão parágrafo. */
export function Block({ text }: { text: string }) {
  if (text.startsWith("#### ")) {
    return <h4 className="mt-8 text-[16.5px] font-bold text-dm-ink">{text.slice(5)}</h4>;
  }
  if (text.startsWith("### ")) {
    return <h3 className="mt-9 text-[18px] font-bold text-dm-ink">{text.slice(4)}</h3>;
  }
  if (text.startsWith("## ")) {
    return <h2 className="h3 mt-11">{text.slice(3)}</h2>;
  }
  if (text.startsWith("# ")) {
    return <h2 className="h3 mt-11">{text.slice(2)}</h2>;
  }
  if (/^(- |\* )/.test(text)) {
    return (
      <p className="mt-3 flex gap-3 text-[16.5px] leading-relaxed text-dm-ink/80">
        <span className="text-dm-blue">•</span>
        <span>{text.slice(2)}</span>
      </p>
    );
  }
  const ordered = text.match(/^(\d+)\.\s+(.*)$/);
  if (ordered) {
    return (
      <p className="mt-3 flex gap-3 text-[16.5px] leading-relaxed text-dm-ink/80">
        <span className="font-bold text-dm-blue">{ordered[1]}.</span>
        <span>{ordered[2]}</span>
      </p>
    );
  }
  return (
    <p className="mt-5 text-[16.5px] leading-relaxed text-dm-ink/80">
      <Inline text={text} />
    </p>
  );
}
