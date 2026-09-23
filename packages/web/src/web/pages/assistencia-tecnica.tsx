import { Cog, MapPin, PhoneCall, Timer, Wrench } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { BtnGhost, BtnWhats, CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { departments, site, waLink } from "@/lib/site";

const services = [
  {
    Icon: Wrench,
    title: "Manutenção e reparo",
    text: "Diagnóstico e correção de falhas em esteiras, roscas, elevadores e máquinas de costura, com equipe que conhece o equipamento por dentro.",
  },
  {
    Icon: Cog,
    title: "Peças de reposição",
    text: "Correias, roletes, mancais, motoredutores, agulhas e fio para costura de sacaria. Peças originais, com especificação correta para o seu modelo.",
  },
  {
    Icon: Timer,
    title: "Manutenção preventiva",
    text: "Planos de inspeção para evitar parada de linha: alinhamento de correia, lubrificação, tensionamento e conferência elétrica.",
  },
  {
    Icon: MapPin,
    title: "Parcerias técnicas no Brasil",
    text: "Rede de parceiros técnicos em todo o território nacional para atendimento ágil, onde a sua planta estiver.",
  },
];

const checklist = [
  "Identifique o modelo e o número de série do equipamento",
  "Descreva o sintoma: ruído, desalinhamento, superaquecimento, parada",
  "Informe há quanto tempo o problema acontece e se houve alteração de carga",
  "Se possível, envie fotos ou um vídeo curto do equipamento em operação",
];

export default function AssistenciaTecnica() {
  const support = departments.find((d) => d.name === "Assistência Técnica")!;

  return (
    <>
      <Seo
        title="Assistência Técnica e SAC | Demakine"
        description="Assistência técnica especializada, peças de reposição e parcerias técnicas em todo o Brasil para equipamentos Demakine. Suporte do projeto ao pós-venda."
        path="/assistencia-tecnica"
      />

      <PageHero
        eyebrow="Assistência Técnica · SAC"
        title="Suporte que não termina na entrega do equipamento"
        text="Da concepção ao pós-venda, acompanhamos o desempenho de cada máquina. Equipe especializada e parcerias técnicas em todo o território nacional."
        image="/img/site/projetos.jpg"
        crumbs={[{ label: "Assistência Técnica" }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <p className="eyebrow text-dm-blue">Compromisso contínuo</p>
            <h2 className="h2 mt-3">Qualidade de verdade não termina na produção</h2>
            <div className="prose-dm mt-6 text-[16.5px] leading-relaxed text-dm-ink/80">
              <p>
                A Demakine destaca-se pela Assistência Técnica especializada e por parcerias técnicas
                em todo o Brasil. Nossos produtos são desenvolvidos para atender às exigências do
                mercado contemporâneo, e nossa presença nacional permite um suporte ágil e eficiente.
              </p>
              <p>
                Desde a concepção até a fase pós-venda, dedicamos atenção integral para assegurar o
                desempenho de cada equipamento. Esse comprometimento vai além da entrega do produto:
                proporciona tranquilidade para a sua operação.
              </p>
              <p>
                Na Demakine, a assistência técnica é mais do que um serviço. É um compromisso
                contínuo com a excelência e a satisfação de quem confia na nossa marca.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-dm-line bg-dm-surface p-6">
              <p className="eyebrow text-dm-blue">Canal direto do SAC</p>
              <p className="mt-3 text-[17px] font-bold text-dm-ink">{support.phone}</p>
              <a
                href={`mailto:${support.email}`}
                className="text-[15px] text-dm-gray hover:text-dm-blue"
              >
                {support.email}
              </a>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <BtnWhats
                  href={waLink("Olá! Preciso de assistência técnica para um equipamento Demakine.")}
                  className="gap-2"
                >
                  <PhoneCall className="h-4 w-4" />
                  Abrir atendimento
                </BtnWhats>
                <BtnGhost to="/downloads">Manuais e downloads</BtnGhost>
              </div>
            </div>
          </Reveal>

          <Reveal i={1} className="grid gap-4">
            {services.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-dm-line bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-dm-ink">{title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-dm-gray">{text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Abrir chamado</p>
            <h2 className="h2 mt-3">Precisa de assistência? Comece por aqui</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Com essas informações em mãos, nosso time resolve muito mais rápido:
            </p>
            <ol className="mt-6 space-y-3">
              {checklist.map((item, idx) => (
                <li key={item} className="flex gap-3 text-[15.5px] leading-relaxed text-dm-ink/80">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dm-blue text-[12px] font-bold text-white">
                    {idx + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[14.5px] text-dm-gray">
              Horário de atendimento: seg a qui 07h30–17h30 · sex 07h30–16h30 ·{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-dm-blue hover:underline">
                {site.email}
              </a>
            </p>
          </Reveal>
          <Reveal i={1}>
            <LeadForm
              source="assistencia-tecnica"
              product="Assistência técnica / SAC"
              buttonLabel="Abrir chamado"
              title="Solicitar assistência técnica"
              subtitle="Descreva o equipamento e o problema. Nosso SAC responde em até 1 dia útil."
              photos
              photoLabel="Foto da peça, da máquina ou da placa de identificação"
              photoHint="A foto acelera o atendimento: com ela o técnico já identifica o modelo. Até 3 fotos, 10MB cada."
            />
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Fale com o setor certo"
          title="Contatos por departamento"
          text="Cada área tem canal próprio para agilizar o seu atendimento."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d, idx) => (
            <Reveal key={d.name} i={idx % 4} className="h-full">
              <div className="h-full rounded-2xl border border-dm-line bg-white p-5">
                <p className="eyebrow text-dm-blue">{d.name}</p>
                <p className="mt-3 text-[15.5px] font-bold text-dm-ink">{d.phone}</p>
                <a
                  href={`mailto:${d.email}`}
                  className="mt-1 block break-all text-[14px] text-dm-gray hover:text-dm-blue"
                >
                  {d.email}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Equipamento parado é dinheiro parado"
        text="Fale agora com o nosso SAC e receba orientação técnica de quem fabricou a sua máquina."
        waMessage="Olá! Preciso de assistência técnica Demakine com urgência."
      />
    </>
  );
}
