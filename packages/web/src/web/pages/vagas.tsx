import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase, GraduationCap, HeartHandshake, MapPin, ShieldCheck, Users } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { ApplicationForm } from "@/components/application-form";
import { api } from "@/lib/api";
import { JOB_TYPE_LABEL, type PublicJob } from "@/lib/vagas";
import { cn } from "@/lib/utils";

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

export default function Vagas() {
  const [area, setArea] = useState("todas");
  const jobsQuery = useQuery({
    queryKey: ["vagas"],
    queryFn: async () => {
      const res = await api.vagas.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).jobs as PublicJob[];
    },
  });
  const jobs = jobsQuery.data ?? [];
  const areas = [...new Set(jobs.map((j) => j.area))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const shown = area === "todas" ? jobs : jobs.filter((j) => j.area === area);

  return (
    <>
      <Seo
        title="Vagas | Trabalhe na Demakine"
        description="Vagas abertas na fábrica da Demakine em Limeira/SP: produção, solda, montagem e comercial. Candidate-se online ou cadastre seu currículo no banco de talentos."
        path="/vagas"
      />

      <PageHero
        eyebrow="Trabalhe conosco"
        title="Vem ser Demakine"
        text="Acreditamos que o crescimento de uma empresa começa pelas pessoas. Por isso valorizamos cada talento e investimos em um ambiente colaborativo, seguro e estimulante."
        image="/img/site/fabrica.jpg"
        crumbs={[{ label: "Vagas" }]}
      />

      <Section>
        <SectionHead
          eyebrow="Vagas abertas"
          title={jobs.length ? `${jobs.length} ${jobs.length === 1 ? "oportunidade aberta" : "oportunidades abertas"}` : "Oportunidades abertas"}
          text="Escolha a vaga, veja os detalhes e candidate-se aqui mesmo. Não encontrou a sua? Cadastre o currículo no banco de talentos logo abaixo."
        />

        {areas.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por área">
            {["todas", ...areas].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setArea(a)}
                aria-pressed={area === a}
                className={cn(
                  "rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
                  area === a
                    ? "border-dm-blue bg-dm-blue text-white"
                    : "border-dm-line bg-white text-dm-ink/70 hover:border-dm-blue/40 hover:text-dm-blue",
                )}
              >
                {a === "todas" ? "Todas as áreas" : a}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobsQuery.isPending &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[230px] animate-pulse rounded-2xl border border-dm-line bg-dm-surface" />
            ))}
          {shown.map((job, idx) => (
            <Reveal key={job.slug} i={idx % 3} className="h-full">
              <Link
                href={`/vagas/${job.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6 transition-colors hover:border-dm-blue/40"
              >
                <p className="eyebrow text-dm-blue">{job.area}</p>
                <h3 className="mt-3 text-[18px] font-bold text-dm-ink">{job.title}</h3>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-dm-gray">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {JOB_TYPE_LABEL[job.type] ?? job.type}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                </p>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-dm-gray">{job.summary}</p>
                {job.salary && <p className="mt-3 text-[14px] font-bold text-dm-green-dark">{job.salary}</p>}
                <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-dm-blue">
                  Ver vaga e candidatar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {jobsQuery.isSuccess && !jobs.length && (
          <div className="mt-8 rounded-2xl border border-dm-line bg-dm-surface p-8 text-center">
            <h3 className="h3">Nenhuma vaga aberta agora</h3>
            <p className="mx-auto mt-2 max-w-lg text-[15px] text-dm-gray">
              Cadastre seu currículo no banco de talentos. Quando abrir uma vaga no seu perfil, o RH
              entra em contato.
            </p>
          </div>
        )}
        {jobsQuery.isError && (
          <p className="mt-8 text-[15px] text-dm-gray">
            Não foi possível carregar as vagas agora. Você ainda pode cadastrar o currículo abaixo.
          </p>
        )}
      </Section>

      <Section tone="surface" id="banco-de-talentos">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <SectionHead
              eyebrow="Banco de talentos"
              title="Não achou a sua vaga?"
              text="Deixe o currículo com a gente. Sempre que abre uma vaga, o RH olha primeiro o banco de talentos."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {perks.map(({ Icon, title, text }, idx) => (
                <Reveal key={title} i={idx} className="h-full">
                  <div className="h-full rounded-2xl border border-dm-line bg-white p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 text-[15.5px] font-bold text-dm-ink">{title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-dm-gray">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal>
            <ApplicationForm />
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Também procuramos parceiros técnicos"
        text="Assistência técnica, instalação e representação comercial em outras regiões do Brasil. Fale com a gente."
        waMessage="Olá! Quero ser parceiro técnico/representante da Demakine."
      />
    </>
  );
}
