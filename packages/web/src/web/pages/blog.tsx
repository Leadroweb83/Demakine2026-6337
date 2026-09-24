import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { CtaBand, PageHero, Section } from "@/components/kit";
import { formatDate, posts } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function Blog() {
  const cats = useMemo(() => {
    const set = new Map<string, number>();
    for (const p of posts) set.set(p.category, (set.get(p.category) ?? 0) + 1);
    return [...set.entries()];
  }, []);

  const [filter, setFilter] = useState("all");
  const list = filter === "all" ? posts : posts.filter((p) => p.category === filter);
  const [featured, ...rest] = list;

  return (
    <>
      <Seo
        title="Blog Demakine | Guias técnicos sobre transporte industrial"
        description="Guias completos sobre esteiras e roscas transportadoras, manutenção preventiva, escolha de equipamento e presença da Demakine nas maiores feiras do agronegócio."
        path="/blog"
      />

      <PageHero
        eyebrow="Blog"
        title="Conteúdo técnico de quem fabrica os equipamentos"
        text="Guias práticos, checklists de manutenção e novidades da Demakine nas principais feiras do agronegócio brasileiro."
        image="/img/site/hero.webp"
        crumbs={[{ label: "Blog" }]}
      />

      <Section>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors",
              filter === "all"
                ? "border-dm-blue bg-dm-blue text-white"
                : "border-dm-line bg-white text-dm-ink/75 hover:border-dm-blue/50 hover:text-dm-blue",
            )}
          >
            Todos <span className="ml-1 text-[12px] opacity-70">{posts.length}</span>
          </button>
          {cats.map(([c, n]) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors",
                filter === c
                  ? "border-dm-blue bg-dm-blue text-white"
                  : "border-dm-line bg-white text-dm-ink/75 hover:border-dm-blue/50 hover:text-dm-blue",
              )}
            >
              {c} <span className="ml-1 text-[12px] opacity-70">{n}</span>
            </button>
          ))}
        </div>

        {featured && (
          <Reveal className="mt-10">
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-dm-line bg-white transition-shadow hover:shadow-xl hover:shadow-dm-blue/10 lg:grid-cols-2"
            >
              <div className="aspect-[16/10] overflow-hidden bg-dm-surface lg:aspect-auto lg:h-full">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-7 md:p-10">
                <span className="eyebrow text-dm-blue">{featured.category}</span>
                <h2 className="h3 mt-3 group-hover:text-dm-blue">{featured.title}</h2>
                <p className="mt-4 line-clamp-4 text-[15.5px] leading-relaxed text-dm-gray">
                  {featured.blocks.find((b) => !b.startsWith("#")) ?? ""}
                </p>
                <span className="mt-6 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-dm-blue">
                  Ler artigo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-3 text-[13px] text-dm-gray">{formatDate(featured.date)}</span>
              </div>
            </Link>
          </Reveal>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, idx) => (
            <Reveal key={p.slug} i={idx % 3} className="h-full">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-dm-blue/10"
              >
                <div className="aspect-[16/9] overflow-hidden bg-dm-surface">
                  <img
                    src={p.cover}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[12px] font-bold uppercase tracking-wide text-dm-blue">
                    {p.category}
                  </span>
                  <h3 className="mt-2 text-[17px] font-bold leading-snug text-dm-ink group-hover:text-dm-blue">
                    {p.title}
                  </h3>
                  <span className="mt-auto pt-4 text-[13px] text-dm-gray">{formatDate(p.date)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Dúvida técnica sobre o seu processo?"
        text="Nossos engenheiros respondem. Descreva o que você precisa mover e receba uma recomendação técnica sem compromisso."
      />
    </>
  );
}
