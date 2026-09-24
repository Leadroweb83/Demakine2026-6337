import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { LeadForm } from "@/components/lead-form";
import { BtnWhats, PageHero, Section, SectionHead } from "@/components/kit";
import { departments, site, waLink } from "@/lib/site";
import { JobsCta } from "@/components/jobs-cta";

export default function Contato() {
  return (
    <>
      <Seo
        title="Contato | Demakine Equipamentos Agroindustriais"
        description="Fale com a Demakine por telefone, WhatsApp ou e-mail. Contatos por departamento, endereço da fábrica em Limeira/SP e formulário de orçamento."
        path="/contato"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contato Demakine",
          url: `${site.url}/contato`,
        }}
      />

      <PageHero
        eyebrow="Contato"
        title="Fale com a Demakine"
        text="Dúvidas, orçamentos ou assistência técnica: nossa equipe está preparada para atender por telefone, WhatsApp ou e-mail."
        image="/img/site/fabrica.webp"
        crumbs={[{ label: "Contato" }]}
      />

      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-dm-blue">Canais diretos</p>
            <h2 className="h2 mt-3">Escolha o canal mais rápido para você</h2>

            <div className="mt-8 grid gap-4">
              <a
                href={waLink("Olá! Vim pelo site da Demakine e quero falar com o comercial.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-dm-line bg-white p-5 transition-colors hover:border-[#25D366]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/12 text-[#1da851]">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-dm-ink">WhatsApp comercial</span>
                  <span className="block text-[15px] text-dm-gray">{site.mobile}</span>
                  <span className="mt-1 block text-[13.5px] text-dm-gray/80">
                    Resposta no horário comercial
                  </span>
                </span>
              </a>

              <a
                href={site.phoneHref}
                className="flex items-start gap-4 rounded-2xl border border-dm-line bg-white p-5 transition-colors hover:border-dm-blue"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-dm-ink">Telefone fixo</span>
                  <span className="block text-[15px] text-dm-gray">{site.phone}</span>
                </span>
              </a>

              <a
                href={`mailto:${site.email}`}
                className="flex items-start gap-4 rounded-2xl border border-dm-line bg-white p-5 transition-colors hover:border-dm-blue"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Mail className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-dm-ink">E-mail comercial</span>
                  <span className="block text-[15px] text-dm-gray">{site.email}</span>
                </span>
              </a>

              <div className="flex items-start gap-4 rounded-2xl border border-dm-line bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <MapPin className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-dm-ink">Fábrica</span>
                  <span className="block text-[15px] leading-relaxed text-dm-gray">
                    {site.address}
                  </span>
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[13.5px] font-bold text-dm-blue hover:underline"
                  >
                    Abrir no Google Maps →
                  </a>
                </span>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-dm-line bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                  <Clock className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-dm-ink">Horário de atendimento</span>
                  <span className="block text-[15px] text-dm-gray">
                    Segunda a quinta: {site.hours.monThu}
                  </span>
                  <span className="block text-[15px] text-dm-gray">Sexta: {site.hours.fri}</span>
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal i={1}>
            <LeadForm
              source="contato"
              title="Enviar mensagem"
              subtitle="Preencha o formulário e nossa equipe responde em até 1 dia útil."
              buttonLabel="Enviar mensagem"
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead
          eyebrow="Departamentos"
          title="Fale direto com a área que você precisa"
          text="Cada setor tem telefone e e-mail próprios."
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
        <div className="mt-8">
          <JobsCta />
        </div>
      </Section>

      <Section className="pt-0">
        <Reveal className="overflow-hidden rounded-2xl border border-dm-line">
          <iframe
            title="Localização da Demakine em Limeira/SP"
            src="https://www.google.com/maps?q=Rua%20Silvino%20del%20Pietro%2C%20212%20-%20Jd.%20Nova%20Limeira%20-%20Limeira%20SP&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[380px] w-full border-0 md:h-[440px]"
          />
        </Reveal>
        <div className="mt-8 text-center">
          <BtnWhats href={waLink("Olá! Quero um orçamento de equipamento Demakine.")}>
            Pedir orçamento agora
          </BtnWhats>
        </div>
      </Section>
    </>
  );
}
