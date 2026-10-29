/**
 * Páginas legais: /politica-de-privacidade e /termos-de-uso.
 * Mesma casca para as duas, conteúdo vindo de lib/legal.ts.
 */
import { Link } from "wouter";
import { FileText, Mail, Phone, ShieldCheck } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { PageHero, Section } from "@/components/kit";
import {
  legalUpdatedAt,
  privacySections,
  termsSections,
  type LegalSection,
} from "@/lib/legal";
import { site } from "@/lib/site";

function Blocks({ section }: { section: LegalSection }) {
  return (
    <section id={section.id} className="scroll-mt-28 border-t border-dm-line pt-8">
      <h2 className="font-display text-[21px] font-extrabold leading-tight text-dm-ink md:text-[25px]">
        {section.title}
      </h2>
      <div className="mt-4 space-y-4">
        {section.blocks.map((b, i) => {
          if (b.kind === "p") {
            return (
              <p key={i} className="text-[15.5px] leading-relaxed text-dm-gray">
                {b.text}
              </p>
            );
          }
          if (b.kind === "ul") {
            return (
              <ul key={i} className="space-y-2.5">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-3 text-[15.5px] leading-relaxed text-dm-gray">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dm-blue" />
                    {it}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="bg-dm-surface">
                    {b.head.map((h) => (
                      <th
                        key={h}
                        className="border border-dm-line px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-wide text-dm-ink"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri} className="align-top">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-dm-line px-3.5 py-3 text-[14px] leading-relaxed text-dm-gray"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LegalPage({
  kind,
  sections,
}: {
  kind: "privacidade" | "termos";
  sections: LegalSection[];
}) {
  const isPrivacy = kind === "privacidade";
  const title = isPrivacy ? "Política de Privacidade" : "Termos de Uso";
  const path = isPrivacy ? "/politica-de-privacidade" : "/termos-de-uso";

  return (
    <>
      <Seo
        title={`${title} | ${site.name}`}
        description={
          isPrivacy
            ? "Como a Demakine coleta, usa, compartilha e protege os dados pessoais enviados pelo site, e como exercer os direitos previstos na LGPD."
            : "Condições de uso do site da Demakine: orçamento e cotação, informação técnica, calculadoras, conteúdo enviado pelo usuário e limites de responsabilidade."
        }
        path={path}
      />

      <PageHero
        eyebrow={isPrivacy ? "LGPD" : "Condições"}
        title={isPrivacy ? "Política de Privacidade" : "Termos de Uso"}
        text={
          isPrivacy
            ? "O que coletamos, por que coletamos, com quem compartilhamos e como você pede acesso, correção ou exclusão dos seus dados."
            : "As regras de uso deste site, o que vale como compromisso comercial e o que é apenas estimativa técnica."
        }
        image="/img/site/hero.webp"
        crumbs={[{ label: title }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-dm-blue">Neste documento</p>
            <nav className="mt-4 flex flex-col gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-xl px-4 py-2.5 text-[14px] font-semibold text-dm-ink/80 transition-colors hover:bg-dm-blue-soft/60 hover:text-dm-blue"
                >
                  {s.title}
                </a>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-dm-line bg-dm-surface p-5">
              <ShieldCheck className="h-5 w-5 text-dm-green" />
              <p className="mt-2.5 text-[14.5px] font-bold text-dm-ink">
                Pedido sobre seus dados
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-dm-gray">
                Acesso, correção ou exclusão: escreva para o e-mail abaixo e respondemos no prazo
                legal.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-3 flex items-center gap-2 text-[13.5px] font-bold text-dm-blue hover:underline"
              >
                <Mail className="h-4 w-4" />
                {site.email}
              </a>
              <a
                href={site.phoneHref}
                className="mt-1.5 flex items-center gap-2 text-[13.5px] font-bold text-dm-blue hover:underline"
              >
                <Phone className="h-4 w-4" />
                {site.phone}
              </a>
            </div>

            <Link
              href={isPrivacy ? "/termos-de-uso" : "/politica-de-privacidade"}
              className="mt-4 flex items-center gap-2 rounded-2xl border border-dm-line px-5 py-4 text-[14px] font-bold text-dm-ink transition-colors hover:border-dm-blue hover:text-dm-blue"
            >
              <FileText className="h-4 w-4 text-dm-gray" />
              {isPrivacy ? "Ver os Termos de Uso" : "Ver a Política de Privacidade"}
            </Link>
          </aside>

          <div>
            <Reveal>
              <p className="rounded-2xl border border-dm-line bg-dm-surface px-5 py-4 text-[13.5px] leading-relaxed text-dm-gray">
                Última atualização: <strong className="text-dm-ink">{legalUpdatedAt}</strong>.
                {isPrivacy
                  ? " Esta política vale para o site demakine.com.br, incluindo a loja e os formulários de orçamento."
                  : " Ao continuar navegando, você concorda com as condições abaixo."}
              </p>
            </Reveal>

            <div className="mt-10 space-y-10">
              {sections.map((s) => (
                <Blocks key={s.id} section={s} />
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-dm-line bg-dm-blue-deep p-6 text-white">
              <p className="text-[15.5px] font-bold">{site.legal}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/65">
                {site.address}
                <br />
                {site.phone} · {site.email}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

export function PoliticaDePrivacidade() {
  return <LegalPage kind="privacidade" sections={privacySections} />;
}

export function TermosDeUso() {
  return <LegalPage kind="termos" sections={termsSections} />;
}
