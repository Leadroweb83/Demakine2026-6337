import { useState } from "react";
import { ClipboardCheck, Download, FileText, Images, Lock, Printer, Wrench } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { CtaBand, PageHero, Section, SectionHead } from "@/components/kit";
import { getProduct, products } from "@/lib/content";
import { productMaintenance } from "@/lib/product-maintenance";
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
  {
    Icon: Printer,
    title: "Checklist geral de manutenção",
    desc: "Rotina diária, semanal e mensal para esteiras e roscas que ainda não têm checklist próprio, com folha de registro do que foi feito.",
    meta: "PDF · 2 páginas",
    href: "/downloads/checklist-manutencao-demakine.pdf",
  },
  {
    Icon: ClipboardCheck,
    title: "Guia de correias por aplicação",
    desc: "Qual correia usar em cada material: lisa, taliscada, perfil em V, PVC sanitária, atóxica, borracha reforçada e modular, com o que evitar em cada caso.",
    meta: "PDF · 1 página",
    href: "/downloads/tabela-de-correias-demakine.pdf",
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
    title: "Checklist antes de comprar uma esteira (PDF)",
    desc: "27 conferências em 6 blocos, mais os erros que custam caro depois da compra. É a lista que a nossa engenharia percorre antes de fechar projeto.",
    href: "/downloads/checklist-antes-de-comprar-uma-esteira.pdf",
  },
  {
    title: "Catálogo técnico completo (PDF)",
    desc: "Todas as linhas, modelos e tabelas de especificação em um arquivo.",
    href: "/downloads/catalogo-demakine.pdf",
  },
  {
    title: "Calculadora de dimensionamento e de retorno",
    desc: "Largura de correia, capacidade e inclinação de referência, mais o cálculo de quanto custa movimentar carga na mão hoje.",
    href: "/ferramentas",
    internal: true,
  },
];

export default function Downloads() {
  const withTable = products.filter((p) => p.models.length > 0);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      <Seo
        title="Central de materiais: catálogo, checklists e guias | Demakine"
        description="Baixe o catálogo Demakine, o checklist de manutenção para imprimir, o guia de correias por aplicação e o checklist antes de comprar uma esteira transportadora."
        path="/downloads"
      />

      <PageHero
        eyebrow="Central de materiais"
        title="Catálogo, checklists e guias técnicos"
        text="Material para você comparar modelos, conferir dimensões, treinar sua equipe na manutenção e apresentar a solução internamente. Download direto, sem enrolação."
        image="/img/site/hero.jpg"
        crumbs={[{ label: "Downloads" }]}
      />

      <Section>
        <SectionHead
          eyebrow="Download direto"
          title="Disponível agora, sem cadastro"
          text="Três materiais que você baixa na hora: o catálogo de equipamentos, o checklist de manutenção para pendurar na fábrica e o guia de correias por aplicação."
        />
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

        <Reveal className="mt-10">
          <h3 className="text-[18px] font-bold text-dm-ink">Checklist por equipamento</h3>
          <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-dm-gray">
            Tirados do manual técnico de cada máquina, com a frequência certa de cada cuidado e folha
            de registro.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(productMaintenance).map(([slug, m]) => (
              <li key={slug}>
                <a
                  href={m.checklistPdf}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-dm-line bg-white px-4 py-3.5 transition-colors hover:border-dm-blue/40 hover:bg-dm-blue-soft/40"
                >
                  <Printer className="h-5 w-5 shrink-0 text-dm-blue" />
                  <span className="flex-1 text-[14.5px] font-semibold text-dm-ink group-hover:text-dm-blue">
                    {getProduct(slug)?.name ?? slug}
                  </span>
                  <Download className="h-4 w-4 shrink-0 text-dm-ink/40 group-hover:text-dm-blue" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------ kit gated */}
      <Section tone="surface">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-dm-blue">Kit técnico</p>
            <h2 className="h2 mt-3">Kit do comprador industrial</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-dm-gray">
              O checklist que evita o erro caro na compra da esteira, o catálogo completo e as
              calculadoras de dimensionamento e de retorno. Deixe seu contato uma vez e libere o
              acesso aos três materiais.
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
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-dm-green px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
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
