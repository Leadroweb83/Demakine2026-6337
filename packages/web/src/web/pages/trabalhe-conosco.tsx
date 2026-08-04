import { GraduationCap, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { BtnPrimary, CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { jobs } from "@/lib/site";

const perks = [
  {
    Icon: Users,
    title: "Ambiente colaborativo",
    text: "Time próximo, comunicação direta e espaço para propor melhorias no dia a dia da fábrica.",
  },
  {
    Icon: ShieldCheck,
    title: "Segurança em primeiro lugar",
    text: "Treinamentos, EPIs e processos claros para que todo mundo volte bem para casa.",
  },
  {
    Icon: GraduationCap,
    title: "Desenvolvimento contínuo",
    text: "Investimos em capacitação técnica para quem quer crescer junto com a empresa.",
  },
  {
    Icon: HeartHandshake,
    title: "Propósito de verdade",
    text: "Uma empresa movida por valores, com apoio ativo a projetos sociais no Brasil e no exterior.",
  },
];

const CURRICULO_EMAIL = "curriculo@demakine.com.br";

export default function TrabalheConosco() {
  return (
    <>
      <Seo
        title="Trabalhe Conosco — Vagas na Demakine"
        description="Vem ser Demakine. Confira as vagas abertas em produção e comercial na nossa fábrica em Limeira/SP e envie seu currículo."
        path="/trabalhe-conosco"
      />

      <PageHero
        eyebrow="Trabalhe conosco"
        title="Vem ser Demakine"
        text="Acreditamos que o crescimento de uma empresa começa pelas pessoas. Por isso valorizamos cada talento e investimos em um ambiente colaborativo, seguro e estimulante."
        image="/img/site/fabrica.jpg"
        crumbs={[{ label: "Trabalhe Conosco" }]}
      />

      <Section>
        <SectionHead
          eyebrow="Vagas"
          title="Oportunidades abertas"
          text="Não encontrou a sua vaga? Envie o currículo mesmo assim: mantemos um banco de talentos ativo."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {jobs.map((job, idx) => (
            <Reveal key={job.title} i={idx} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6">
                <p className="eyebrow text-dm-blue">{job.area}</p>
                <h3 className="mt-3 text-[18px] font-bold text-dm-ink">{job.title}</h3>
                <p className="mt-1 text-[13.5px] text-dm-gray">{job.type}</p>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-dm-gray">{job.desc}</p>
                <a
                  href={`mailto:${CURRICULO_EMAIL}?subject=${encodeURIComponent(`Vaga: ${job.title}`)}`}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-dm-blue px-5 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#0d3480]"
                >
                  Enviar meu currículo
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead eyebrow="Por que aqui" title="Como é trabalhar na Demakine" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map(({ Icon, title, text }, idx) => (
            <Reveal key={title} i={idx} className="h-full">
              <div className="h-full rounded-2xl border border-dm-line bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[16.5px] font-bold text-dm-ink">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dm-gray">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 rounded-2xl border border-dm-line bg-white p-8 text-center">
          <h2 className="h3">Envie seu currículo</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15.5px] leading-relaxed text-dm-gray">
            Mande seu currículo em PDF para o nosso RH. Coloque no assunto a vaga desejada ou a área
            de interesse.
          </p>
          <div className="mt-6">
            <BtnPrimary href={`mailto:${CURRICULO_EMAIL}`}>{CURRICULO_EMAIL}</BtnPrimary>
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="Também procuramos parceiros técnicos"
        text="Assistência técnica, instalação e representação comercial em outras regiões do Brasil. Fale com a gente."
        waMessage="Olá! Quero ser parceiro técnico/representante da Demakine."
      />
    </>
  );
}
