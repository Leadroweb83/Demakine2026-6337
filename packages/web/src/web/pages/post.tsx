import { Link, useParams } from "wouter";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { Breadcrumb, BtnPrimary, BtnWhats, CtaBand, Section } from "@/components/kit";
import { ShareBar } from "@/components/share";
import { CalcEsteira } from "@/components/tools/calc-esteira";
import { CalcRoi } from "@/components/tools/calc-roi";
import { formatDate, getPost, posts } from "@/lib/content";
import { site, waLink } from "@/lib/site";

function Block({ text }: { text: string }) {
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

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug ?? "");

  if (!post) {
    return (
      <Section>
        <h1 className="h2">Artigo não encontrado</h1>
        <p className="mt-3 text-[16px] text-dm-gray">Veja os artigos publicados no nosso blog.</p>
        <div className="mt-6">
          <BtnPrimary to="/blog">Ir para o blog</BtnPrimary>
        </div>
      </Section>
    );
  }

  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const intro = post.blocks.find((b) => !b.startsWith("#")) ?? "";
  const body = post.blocks.filter((b, idx) => !(idx === 0 && b.startsWith("# ")));
  const gallery = post.images.filter((img) => img !== post.cover).slice(0, 6);
  const tool =
    post.slug === "como-dimensionar-sua-esteira-transportadora"
      ? "esteira"
      : post.slug === "quanto-custa-movimentar-carga-na-mao"
        ? "roi"
        : null;

  return (
    <>
      <Seo
        title={`${post.title} | Blog Demakine`}
        description={intro.slice(0, 180)}
        path={`/blog/${post.slug}`}
        image={post.cover}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: intro.slice(0, 200),
          image: `${site.url}${post.cover}`,
          datePublished: post.date,
          author: { "@type": "Organization", name: site.legal },
          publisher: {
            "@type": "Organization",
            name: site.legal,
            logo: { "@type": "ImageObject", url: `${site.url}/img/site/logo-demakine.png` },
          },
        }}
      />

      <div className="border-b border-dm-line bg-white">
        <div className="dm-container py-3.5">
          <Breadcrumb items={[{ label: "Blog", to: "/blog" }, { label: post.title }]} />
        </div>
      </div>

      <article className="bg-white py-12 md:py-16">
        <div className="dm-container">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow text-dm-blue">{post.category}</p>
            <h1 className="h1 mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">{post.title}</h1>
            <p className="mt-4 text-[14px] text-dm-gray">
              Publicado em {formatDate(post.date)} · Equipe Demakine
            </p>
            <ShareBar
              className="mt-6"
              compact
              title={post.title}
              path={`/blog/${post.slug}`}
            />
          </div>

          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl">
            <img src={post.cover} alt={post.title} className="w-full object-cover" />
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            {body.map((b, idx) => (
              <Block key={idx} text={b} />
            ))}
          </div>

          {gallery.length > 0 && (
            <div className="mx-auto mt-12 max-w-4xl">
              <p className="eyebrow text-dm-blue">Galeria</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt={post.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {tool && (
            <div className="mx-auto mt-14 max-w-4xl">
              <p className="eyebrow text-dm-blue">
                {tool === "esteira" ? "Calculadora" : "Calculadora de retorno"}
              </p>
              <h2 className="h3 mt-3">
                {tool === "esteira"
                  ? "Faça o dimensionamento agora"
                  : "Veja quanto a sua operação gasta hoje"}
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-dm-gray">
                {tool === "esteira"
                  ? "Preencha os dados da sua operação e veja largura de correia, capacidade e inclinação de referência. É o mesmo cálculo que usamos no primeiro contato."
                  : "Coloque o número de pessoas, as horas na movimentação manual e o custo hora. O resultado mostra o gasto anual e em quanto tempo o equipamento se paga."}
              </p>
              <div className="mt-6">{tool === "esteira" ? <CalcEsteira /> : <CalcRoi />}</div>
              <p className="mt-4 text-[14px] text-dm-gray">
                Resultado de referência. O dimensionamento final é confirmado pela nossa engenharia
                com os dados reais da sua operação.
              </p>
            </div>
          )}

          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-dm-line bg-dm-surface p-7">
            <h2 className="h3">Precisa aplicar isso na sua operação?</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-dm-gray">
              Nossa engenharia avalia seu processo e indica o equipamento correto, inclusive projetos
              sob medida.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <BtnWhats href={waLink(`Olá! Li o artigo "${post.title}" e quero falar com um especialista.`)}>
                Falar com especialista
              </BtnWhats>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl border-t border-dm-line pt-7">
            <ShareBar title={post.title} path={`/blog/${post.slug}`} />
          </div>
        </div>
      </article>

      <Section tone="surface">
        <h2 className="h2">Leia também</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {others.map((p, idx) => (
            <Reveal key={p.slug} i={idx} className="h-full">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-dm-blue/10"
              >
                <div className="aspect-[16/9] overflow-hidden">
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
                  <h3 className="mt-2 text-[16.5px] font-bold leading-snug text-dm-ink group-hover:text-dm-blue">
                    {p.title}
                  </h3>
                  <span className="mt-auto pt-4 text-[13px] text-dm-gray">{formatDate(p.date)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
