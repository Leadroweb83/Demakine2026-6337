import { Check } from "lucide-react";
import { Seo } from "@/components/seo";
import { BtnGhost, BtnPrimary, Section } from "@/components/kit";
import { site } from "@/lib/site";

/**
 * Página de obrigado depois de qualquer formulário de orçamento (components/lead-form.tsx).
 * Existe para a conversão ser medida pelo endereço (GTM/Google Ads: página /obrigado).
 * Fora do Google (noindex) e sem botão de WhatsApp: o cliente aguarda o contato do vendedor.
 */
export default function Obrigado() {
  return (
    <>
      <Seo
        title="Recebemos seu pedido | Demakine"
        description="Um especialista da Demakine entra em contato em até 1 dia útil."
        path="/obrigado"
        noindex
      />
      <Section className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dm-blue text-white">
            <Check className="h-8 w-8" />
          </span>
          <h1 className="h2 mt-6">Recebemos seu pedido</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-dm-gray">
            Um especialista da Demakine entra em contato em até 1 dia útil, pelo telefone ou e-mail que você
            informou.
          </p>
          <p className="mt-2 text-[14.5px] text-dm-gray">Horário de atendimento: {site.hoursLine}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <BtnPrimary to="/produtos">Ver o catálogo</BtnPrimary>
            <BtnGhost href="/downloads/catalogo-demakine.pdf" external>
              Baixar catálogo (PDF)
            </BtnGhost>
          </div>
        </div>
      </Section>
    </>
  );
}
