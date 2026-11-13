import type { Metadata } from "next";
import Link from "next/link";
import { firstContact, firstContactChecklist } from "@/content/site";
import { whatsappHref } from "@/lib/site";
import { Contact } from "@/components/sections";
import { WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Como é o primeiro atendimento",
  description: "Veja como funciona o primeiro contato com a Marchi Gomes Advogados, em Limeira: do WhatsApp à definição da estratégia, com sigilo e linguagem clara.",
  alternates: { canonical: "/primeiro-atendimento" },
};

export default function FirstContactPage() {
  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-20 pt-40 lg:pb-28 lg:pt-52">
          <p className="eyebrow" data-reveal>Primeiro atendimento</p>
          <h1 className="display mt-8 max-w-[18ch] text-[clamp(2.8rem,7vw,6.25rem)]" data-split>Você não precisa ter todas as respostas para começar.</h1>
          <span className="rule mt-10" data-draw />
          <p className="mt-8 max-w-xl text-lg text-bone/80" data-reveal>
            O primeiro contato serve para entender a sua situação e mostrar os caminhos possíveis. Veja como ele acontece.
          </p>
        </div>
      </section>
      <section className="bg-paper py-24 text-ink lg:py-32">
        <ol className="wrap max-w-5xl border-t border-ink/15">
          {firstContact.map((st, i) => (
            <li key={st.title} className="grid gap-x-12 gap-y-3 border-b border-ink/15 py-10 sm:grid-cols-[6rem_1fr]" data-reveal>
              <span className="display text-6xl text-copper-lo">0{i + 1}</span>
              <div>
                <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight">{st.title}</h2>
                <p className="mt-3 max-w-2xl text-lg text-ink/75">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-bone py-24 text-ink lg:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow !text-copper-lo" data-reveal>Para a conversa render</p>
            <h2 className="display mt-5 text-[clamp(2.2rem,4.4vw,3.8rem)]" data-split>O que vale ter em mãos.</h2>
            <p className="mt-6 max-w-md text-ink/70" data-reveal>Nada disso é obrigatório. Se você ainda não reuniu os documentos, pode entrar em contato da mesma forma.</p>
            <a href={whatsappHref("Olá! Vim pelo site e gostaria de agendar um primeiro atendimento.")} className="btn mt-9 bg-ink text-bone hover:bg-navy-2" data-magnetic data-event="whatsapp_primeiro_atendimento">
              <WhatsAppIcon /> Iniciar a conversa
            </a>
          </div>
          <ul className="border-t border-ink/15">
            {firstContactChecklist.map((c) => (
              <li key={c} className="flex gap-5 border-b border-ink/15 py-6 text-lg" data-reveal>
                <span className="mt-3 h-px w-8 shrink-0 bg-copper-lo" aria-hidden="true" />{c}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="border-t hairline bg-navy py-14">
        <p className="wrap text-bone/75">Ficou com dúvida sobre algum termo? Consulte o <Link href="/glossario" className="text-copper-hi underline underline-offset-4">glossário jurídico</Link>.</p>
      </section>
      <Contact />
    </>
  );
}
