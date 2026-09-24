import { Link } from "wouter";
import { ArrowRight, Info } from "lucide-react";
import { Seo } from "@/components/seo";
import { CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { Reveal } from "@/components/reveal";
import { caseStudies } from "@/lib/cases";

export default function Cases() {
  return (
    <>
      <Seo
        title="Aplicações e cases | Demakine"
        description="Equipamentos Demakine por tipo de operação: recebimento de grãos, triagem de resíduos, ensaque de ração e descarga de caminhão em centro de distribuição."
        path="/cases"
      />

      <PageHero
        eyebrow="Aplicações"
        title="Como a Demakine resolve por tipo de operação"
        text="Cada aplicação abaixo é a configuração de equipamento que a fábrica entrega para aquele cenário, com os produtos envolvidos e um cenário simulado de ganho para você comparar com a sua operação."
        image={caseStudies[0]?.image}
        crumbs={[{ label: "Aplicações e cases" }]}
      />

      <Section tone="white">
        <Reveal>
          <div className="flex gap-3 rounded-2xl border border-dm-line bg-dm-surface p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-dm-blue" />
            <p className="text-[14.5px] leading-relaxed text-dm-gray">
              Transparência: nenhum número desta seção é resultado medido de cliente. O que está
              publicado é a configuração técnica de cada aplicação e um cenário simulado, com as
              premissas à vista. Cases com nome, foto e números do cliente entram aqui depois da
              medição e da autorização por escrito.
            </p>
          </div>
        </Reveal>

        <div className="mt-10">
          <SectionHead
            eyebrow="Por operação"
            title="Escolha o cenário parecido com o seu"
          />
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {caseStudies.map((c, i) => (
            <Reveal key={c.slug} i={i % 2} className="h-full">
              <Link
                href={`/cases/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dm-line bg-white transition-all hover:-translate-y-1 hover:border-dm-blue/35 hover:shadow-xl hover:shadow-dm-blue/10"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-dm-surface">
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-dm-blue">
                    {c.segment}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-[18px] font-bold leading-snug text-dm-ink group-hover:text-dm-blue">
                    {c.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-dm-gray">{c.intro}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-[13px] font-bold uppercase tracking-wide text-dm-blue">
                    Ver a configuração
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand waMessage="Olá! Vi as aplicações no site e quero avaliar a minha operação." />
    </>
  );
}
