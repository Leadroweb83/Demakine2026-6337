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
  return <p className="mt-5 text-[16.5px] leading-relaxed text-dm-ink/80">{text}</p>;
}
