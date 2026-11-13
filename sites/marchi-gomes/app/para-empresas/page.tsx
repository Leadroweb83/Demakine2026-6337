import type { Metadata } from "next";
import Link from "next/link";
import { areas, business, site } from "@/content/site";
import { whatsappHref } from "@/lib/site";
import { Contact, Faq, HeroMedia, Services } from "@/components/sections";
import { Arrow, WhatsAppIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: `Assessoria jurídica para empresas em ${site.contact.city}`,
  description: "Assessoria jurídica empresarial pontual ou continuada: participação dos sócios, responsável por demanda, reuniões de acompanhamento e comunicação periódica.",
  alternates: { canonical: "/para-empresas" },
};

export default function BusinessPage() {
  const list = business.areaSlugs.map((sl) => areas.find((a) => a.slug === sl)!).filter(Boolean);
  return (
    <>
      <section className="hero-light relative isolate overflow-hidden">
        <HeroMedia strong video={false} />
        <div className="wrap pb-20 pt-40 lg:pb-28 lg:pt-52">
          <p className="eyebrow" data-reveal>Para empresas</p>
          <h1 className="display mt-8 max-w-[16ch] text-[clamp(2.8rem,7vw,6.25rem)]" data-split>{business.title}</h1>
          <span className="rule mt-10" data-draw />
          <p className="mt-8 max-w-2xl text-lg text-bone/80" data-reveal>{business.lead}</p>
          <a href={whatsappHref("Olá! Vim pelo site e gostaria de conhecer a assessoria jurídica para empresas.")} className="btn btn-primary mt-10" data-reveal data-magnetic data-event="whatsapp_empresas">
            <WhatsAppIcon /> Falar sobre a minha empresa
          </a>
        </div>
      </section>

      <section className="bg-paper py-24 text-ink lg:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow !text-copper-lo" data-reveal>A rotina da assessoria</p>
            <h2 className="display mt-5 text-[clamp(2.2rem,4.6vw,4rem)]" data-split>Atendimento personalizado, na prática.</h2>
            <p className="mt-6 max-w-md text-ink/70" data-reveal>A consultoria pode ser pontual ou continuada, conforme a necessidade da empresa.</p>
          </div>
          <ol className="grid gap-px sm:grid-cols-2">
            {business.routine.map((r, i) => (
              <li key={r.title} className="border-t border-ink/15 py-8 sm:pr-8" data-reveal>
                <span className="font-display text-lg text-copper-lo">0{i + 1}</span>
                <h3 className="mt-3 font-display text-[1.75rem] leading-tight">{r.title}</h3>
                <p className="mt-3 text-ink/70">{r.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-navy py-24 lg:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow" data-reveal>Organização interna</p>
            <h2 className="display mt-5 text-[clamp(2.2rem,4.6vw,4rem)]" data-split>O que sustenta o trabalho.</h2>
          </div>
          <ul className="border-t hairline">
            {business.backoffice.map((b) => (
              <li key={b} className="flex items-center gap-6 border-b hairline py-6 font-display text-[clamp(1.4rem,2.4vw,2rem)]" data-reveal>
                <span className="h-px w-10 shrink-0 bg-copper" aria-hidden="true" />{b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Services heading="Serviços para a empresa." />

      <section className="bg-paper py-20 text-ink">
        <div className="wrap">
          <p className="eyebrow !text-copper-lo">Áreas mais procuradas por empresas</p>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <li key={a.slug}>
                <Link href={`/areas/${a.slug}`} className="group flex items-center justify-between border-b border-ink/15 py-5">
                  <span className="display text-3xl group-hover:text-copper-lo">{a.name}</span>
                  <Arrow className="h-4 w-4 text-copper-lo transition-transform duration-500 group-hover:translate-x-2" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Faq items={business.faqs} heading="Dúvidas de quem contrata para a empresa." />

      <Contact defaultArea="Empresarial e Societário" />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: business.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </>
  );
}
