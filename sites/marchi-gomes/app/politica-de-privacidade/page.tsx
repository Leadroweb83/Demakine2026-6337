import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a Marchi Gomes Advogados trata os dados pessoais enviados pelo site, conforme a Lei Geral de Proteção de Dados (LGPD).",
  alternates: { canonical: "/politica-de-privacidade" },
};

/**
 * MINUTA. Descreve o que o site faz de fato (formulario, WhatsApp, medicao com
 * consentimento). Precisa de revisao e aprovacao dos socios antes do lancamento.
 */
const sections: { h: string; p: string[] }[] = [
  { h: "Quem é o responsável pelos dados", p: [`${site.name}, com endereço na ${site.contact.street}, ${site.contact.city} - ${site.contact.state}, CEP ${site.contact.zip}, é a controladora dos dados pessoais tratados por meio deste site.`] },
  { h: "Quais dados coletamos", p: [
    "Dados que você informa no formulário de contato: nome, telefone, e-mail (opcional), assunto de interesse, mensagem e, se desejar, o dia preferido para o retorno.",
    "Dados de origem da visita: a página pela qual você chegou, o site de onde veio e identificadores de campanha presentes no endereço, quando existirem.",
    "Dados de navegação, coletados por ferramentas de medição apenas se você aceitar os cookies de medição.",
  ] },
  { h: "Para que usamos", p: [
    "Para responder ao seu contato e avaliar como o escritório pode ajudar.",
    "Para entender quais canais trazem visitantes ao site e melhorar a experiência de navegação, quando houver o seu consentimento.",
  ] },
  { h: "Com quem compartilhamos", p: [
    "Com fornecedores de tecnologia que operam o site, o recebimento das mensagens e, se você consentir, as ferramentas de medição. Não vendemos dados pessoais.",
    "Ao clicar nos botões de WhatsApp, a conversa acontece naquele aplicativo, sujeito às regras de privacidade do próprio serviço.",
  ] },
  { h: "Cookies e medição", p: ["O site só ativa cookies de medição depois do seu aceite, e você pode recusar sem prejuízo da navegação. Para rever a escolha, apague os dados do site no seu navegador e o aviso será exibido novamente."] },
  { h: "Por quanto tempo guardamos", p: ["Pelo tempo necessário para atender ao seu contato e cumprir obrigações legais e profissionais aplicáveis."] },
  { h: "Seus direitos", p: ["Você pode solicitar a confirmação do tratamento, o acesso, a correção ou a exclusão dos seus dados, bem como revogar o consentimento, nos termos da Lei nº 13.709/2018 (LGPD)."] },
  { h: "Como falar conosco", p: [`Pelo telefone e WhatsApp ${site.contact.phone}${site.contact.email ? ` ou pelo e-mail ${site.contact.email}` : ""}, ou no endereço indicado acima.`] },
  { h: "Sigilo profissional", p: ["As informações compartilhadas com o escritório também são protegidas pelo dever de sigilo profissional do advogado."] },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="hero-light">
        <div className="wrap pb-14 pt-40 lg:pt-48">
          <p className="eyebrow">LGPD</p>
          <h1 className="display mt-6 text-[clamp(2.6rem,6vw,5rem)]" data-split>Política de privacidade</h1>
        </div>
      </section>
      <section className="bg-paper py-20 text-ink lg:py-24">
        <div className="wrap max-w-3xl">
          {!site.launchReady && <p className="mb-10 border border-copper-lo/50 px-4 py-3 text-sm text-copper-lo">Minuta: aguardando revisão e aprovação dos sócios.</p>}
          {sections.map((sec) => (
            <div key={sec.h} className="border-t border-ink/15 py-8">
              <h2 className="font-display text-[1.75rem] leading-tight">{sec.h}</h2>
              {sec.p.map((t) => <p key={t} className="mt-4 text-ink/80">{t}</p>)}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
