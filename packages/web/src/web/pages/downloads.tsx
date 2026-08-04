import { useState } from "react";
import { Download, FileText, Images, Lock, Wrench } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { products } from "@/lib/content";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const files = [
  {
    Icon: FileText,
    title: "Catálogo Demakine",
    desc: "Catálogo completo de equipamentos com fotos, aplicações e especificações principais.",
    meta: "PDF · 3,5 MB",
    href: "/downloads/catalogo-demakine.pdf",
  },
];

const onRequest = [
  {
    Icon: Wrench,
    title: "Ficha técnica por modelo",
    desc: "Tabela de comprimento, largura de correia, motorização, altura e capacidade do modelo que você precisa.",
  },
  {
    Icon: Images,
    title: "Desenho dimensional",
    desc: "Vista lateral com cotas para conferir encaixe no seu layout antes da compra.",
  },
  {
    Icon: FileText,
    title: "Manual de operação e manutenção",
    desc: "Instruções de instalação, lubrificação, tensionamento de correia e plano preventivo.",
  },
];

/** Materiais liberados depois do cadastro (gate leve de lead). */
const gated = [
  {
    title: "Catálogo técnico completo (PDF)",
    desc: "Todas as linhas, modelos e tabelas de especificação em um arquivo.",
    href: "/downloads/catalogo-demakine.pdf",
  },
  {
    title: "Checklist de dimensionamento",
    desc: "As 12 informações que a engenharia precisa para fechar seu projeto sem retrabalho.",
    href: "/ferramentas#dimensionar",
    internal: true,
  },
];

export default function Downloads() {
  const withTable = products.filter((p) => p.models.length > 0);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      <Seo
        title="Downloads — Catálogo e fichas técnicas | Demakine"
        description="Baixe o catálogo de equipamentos Demakine e solicite fichas técnicas, desenhos dimensionais e manuais de operação dos nossos modelos."
        path="/downloads"
      />

      <PageHero
        eyebrow="Downloads"
        title="Catálogo, fichas técnicas e documentação"
        text="Material técnico para você comparar modelos, conferir dimensões e apresentar a solução internamente."
        image="/img/site/hero.jpg"
        crumbs={[{ label: "Downloads" }]}
      />

      <Section>
        <SectionHead eyebrow="Download direto" title="Disponível agora" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {files.map((f, idx) => (
            <Reveal key={f.title} i={idx}>
              <a
                href={f.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-5 rounded-2xl border border-dm-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-dm-blue/35 hover:shadow-lg hover:shadow-dm-blue/10"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <f.Icon className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="block text-[17px] font-bold text-dm-ink group-hover:text-dm-blue">
                    {f.title}
                  </span>
                  <span className="mt-1.5 block text-[14.5px] leading-relaxed text-dm-gray">
                    {f.desc}
                  </span>
                  <span className="mt-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-dm-blue">
                    <Download className="h-4 w-4" />
                    Baixar · {f.meta}
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ kit gated */}
      <Section tone="surface">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Kit técnico</p>
            <h2 className="h2 mt-3">Kit do comprador industrial</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              Catálogo completo mais o checklist de dimensionamento que usamos internamente. Deixe
              seu contato uma vez e libere o acesso aos dois materiais.
            </p>

            <ul className="mt-7 space-y-3">
              {gated.map((g) => (
                <li
                  key={g.title}
                  className="flex items-start gap-4 rounded-2xl border border-dm-line bg-white p-5"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      unlocked ? "bg-dm-blue text-white" : "bg-dm-surface text-dm-gray",
                    )}
                  >
                    {unlocked ? <Download className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[16px] font-bold text-dm-ink">{g.title}</span>
                    <span className="mt-1 block text-[14px] leading-relaxed text-dm-gray">
                      {g.desc}
                    </span>
                    {unlocked && (
                      <a
                        href={g.href}
                        {...(g.internal ? {} : { target: "_blank", rel: "noreferrer" })}
                        className="mt-2 inline-block text-[13px] font-bold uppercase tracking-wide text-dm-blue hover:underline"
                      >
                        Acessar agora →
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {!unlocked && (
              <p className="mt-5 text-[13.5px] text-dm-gray">
                Sem spam: usamos seu contato apenas para enviar o material e falar do seu projeto.
              </p>
            )}
          </Reveal>

          <Reveal i={1}>
            <LeadForm
              source="downloads:kit"
              product="Kit do comprador industrial"
              buttonLabel="Liberar materiais"
              title="Liberar o kit"
              subtitle="Preencha nome e telefone para acessar os arquivos."
              successTitle="Kit liberado"
              onSuccess={() => setUnlocked(true)}
              successExtra={
                <div className="flex flex-col gap-2">
                  {gated.map((g) => (
                    <a
                      key={g.title}
                      href={g.href}
                      {...(g.internal ? {} : { target: "_blank", rel: "noreferrer" })}
                      className="rounded-xl border border-dm-line px-4 py-3 text-[14px] font-semibold text-dm-blue hover:bg-dm-blue-soft/50"
                    >
                      {g.title}
                    </a>
                  ))}
                </div>
              }
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead
          eyebrow="Sob solicitação"
          title="Documentos técnicos personalizados"
          text={`Enviamos por e-mail ou WhatsApp em até 1 dia útil. ${withTable.length} equipamentos já têm tabela de modelos publicada no catálogo do site.`}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {onRequest.map(({ Icon, title, desc }, idx) => (
            <Reveal key={title} i={idx} className="h-full">
              <div className="h-full rounded-2xl border border-dm-line bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[16.5px] font-bold text-dm-ink">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dm-gray">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="h3">Solicitar documentação</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-dm-gray">
              Diga qual equipamento e modelo você precisa. Se ainda não souber o modelo, descreva a
              operação e a gente indica.
            </p>
            <a
              href={waLink("Olá! Quero receber a ficha técnica de um equipamento Demakine.")}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-[15px] font-bold text-dm-blue hover:underline"
            >
              Ou peça direto no WhatsApp →
            </a>
          </Reveal>
          <Reveal i={1}>
            <LeadForm
              source="downloads"
              product="Solicitação de documentação técnica"
              buttonLabel="Solicitar documento"
            />
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
