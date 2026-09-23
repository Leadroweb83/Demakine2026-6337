import { MessageCircle, Phone } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { FaqAccordion } from "@/components/faq";
import { BtnGhost, BtnWhats, CtaBand, PageHero, Section } from "@/components/kit";
import { faqFlat, faqGroups, faqJsonLd } from "@/lib/faq";
import { site, waLink } from "@/lib/site";

export default function Faq() {
  return (
    <>
      <Seo
        title="Perguntas frequentes | Demakine"
        description="Prazo, frete, correia, inclinação, instalação, peças de reposição e assistência técnica: as dúvidas que mais recebemos sobre esteiras, roscas, elevadores e empacotamento."
        path="/faq"
        jsonLd={faqJsonLd(faqFlat)}
      />

      <PageHero
        eyebrow="Perguntas frequentes"
        title="As dúvidas que mais chegam na fábrica"
        text="Reunimos aqui o que o comprador industrial pergunta antes de fechar: como funciona o orçamento, como escolher correia e capacidade, o que preparar para instalar e como funciona a assistência depois da entrega."
        image="/img/site/hero.jpg"
        crumbs={[{ label: "Perguntas frequentes" }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
          {/* índice */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-dm-blue">Neste conteúdo</p>
            <nav className="mt-4 flex flex-col gap-1">
              {faqGroups.map((g) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className="rounded-xl px-4 py-3 text-[15px] font-semibold text-dm-ink/80 transition-colors hover:bg-dm-blue-soft/60 hover:text-dm-blue"
                >
                  {g.title}
                  <span className="mt-0.5 block text-[12.5px] font-medium text-dm-gray">
                    {g.items.length} perguntas
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-dm-line bg-dm-surface p-5">
              <p className="text-[15px] font-bold text-dm-ink">Não achou sua dúvida?</p>
              <p className="mt-2 text-[14px] leading-relaxed text-dm-gray">
                Fale com quem projeta a máquina. A resposta vem com o dimensionamento da sua
                operação.
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <BtnWhats
                  href={waLink("Olá! Tenho uma dúvida sobre equipamentos Demakine.")}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </BtnWhats>
                <BtnGhost href={site.phoneHref} className="gap-2">
                  <Phone className="h-4 w-4" />
                  {site.phone}
                </BtnGhost>
              </div>
            </div>
          </aside>

          {/* grupos */}
          <div className="min-w-0 space-y-14">
            {faqGroups.map((g, idx) => (
              <Reveal key={g.id} i={idx} className="scroll-mt-28">
                <div id={g.id} className="scroll-mt-28">
                  <h2 className="h3">{g.title}</h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-dm-gray">{g.intro}</p>
                  <FaqAccordion className="mt-6" items={g.items} openFirst={idx === 0} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand waMessage="Olá! Vi o FAQ do site e quero falar sobre o meu projeto." />
    </>
  );
}
