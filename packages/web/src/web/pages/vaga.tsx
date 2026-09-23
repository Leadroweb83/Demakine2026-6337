import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CalendarClock, Check, MapPin, Wallet } from "lucide-react";
import { Seo } from "@/components/seo";
import { BtnGhost, BtnPrimary, PageHero, Section } from "@/components/kit";
import { ApplicationForm } from "@/components/application-form";
import { api } from "@/lib/api";
import { site } from "@/lib/site";
import { JOB_TYPE_LABEL, JOB_TYPE_SCHEMA, brDate, lines, type PublicJob } from "@/lib/vagas";

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-10">
      <h2 className="h3">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-[15.5px] leading-relaxed text-dm-ink/80">
            <Check className="mt-1 h-4 w-4 shrink-0 text-dm-green" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Vaga no formato que o Google Vagas lê (schema.org JobPosting). */
function jobPostingLd(job: PublicJob) {
  const [city, uf] = job.location.split("/").map((s) => s.trim());
  const description = [
    job.summary,
    job.description,
    lines(job.requirements).length ? `Requisitos: ${lines(job.requirements).join("; ")}` : "",
    lines(job.benefits).length ? `Oferecemos: ${lines(job.benefits).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.createdAt.slice(0, 10),
    ...(job.deadline ? { validThrough: `${job.deadline}T23:59:59-03:00` } : {}),
    employmentType: JOB_TYPE_SCHEMA[job.type] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: site.name,
      sameAs: site.url,
      logo: `${site.url}/img/site/logo-blue.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city || "Limeira",
        addressRegion: uf || "SP",
        addressCountry: "BR",
      },
    },
    directApply: true,
  };
}

export default function Vaga() {
  const { slug } = useParams<{ slug: string }>();
  const jobQuery = useQuery({
    queryKey: ["vaga", slug],
    queryFn: async () => {
      const res = await api.vagas[":slug"].$get({ param: { slug: slug ?? "" } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("fail");
      return (await res.json()).job as PublicJob;
    },
  });

  if (jobQuery.isPending) {
    return (
      <Section>
        <div className="h-[420px] animate-pulse rounded-2xl bg-dm-surface" />
      </Section>
    );
  }

  const job = jobQuery.data;
  if (!job) {
    return (
      <Section>
        <h1 className="h2">Vaga não encontrada</h1>
        <p className="mt-3 text-[16px] text-dm-gray">
          Ela pode ter sido encerrada. Veja as vagas abertas ou cadastre seu currículo no banco de
          talentos.
        </p>
        <div className="mt-6">
          <BtnPrimary to="/vagas">Ver vagas abertas</BtnPrimary>
        </div>
      </Section>
    );
  }

  const facts = [
    { Icon: Briefcase, label: JOB_TYPE_LABEL[job.type] ?? job.type },
    { Icon: MapPin, label: job.location },
    ...(job.salary ? [{ Icon: Wallet, label: job.salary }] : []),
    ...(job.deadline && job.open ? [{ Icon: CalendarClock, label: `Inscrições até ${brDate(job.deadline)}` }] : []),
  ];

  return (
    <>
      <Seo
        title={`Vaga de ${job.title} em ${job.location} | Demakine`}
        description={job.summary}
        path={`/vagas/${job.slug}`}
        jsonLd={job.open ? jobPostingLd(job) : undefined}
      />

      <PageHero
        eyebrow={job.area}
        title={job.title}
        text={job.summary}
        image="/img/site/fabrica.jpg"
        crumbs={[{ label: "Vagas", to: "/vagas" }, { label: job.title }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <ul className="flex flex-wrap gap-2">
              {facts.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-dm-line bg-dm-surface px-4 py-2 text-[13.5px] font-semibold text-dm-ink/80"
                >
                  <Icon className="h-4 w-4 text-dm-blue" />
                  {label}
                </li>
              ))}
            </ul>

            {job.description && (
              <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-dm-ink/80">
                {job.description.split(/\n{2,}/).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            )}

            <List title="Requisitos" items={lines(job.requirements)} />
            <List title="O que oferecemos" items={lines(job.benefits)} />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {job.open ? (
              <ApplicationForm jobSlug={job.slug} jobTitle={job.title} />
            ) : (
              <div className="rounded-2xl border border-dm-line bg-dm-surface p-8">
                <h2 className="h3">Esta vaga não está recebendo candidaturas</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-dm-gray">
                  Veja as outras vagas abertas ou cadastre o currículo no banco de talentos.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <BtnPrimary to="/vagas">Ver vagas abertas</BtnPrimary>
                  <BtnGhost to="/vagas#banco-de-talentos">Banco de talentos</BtnGhost>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
