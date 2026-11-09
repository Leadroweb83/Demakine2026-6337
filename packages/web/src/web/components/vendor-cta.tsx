import { MessageCircle } from "lucide-react";
import { BtnGhost, BtnPrimary } from "@/components/kit";
import { cn } from "@/lib/utils";
import { quoteHref, waHref } from "@/lib/site";

/**
 * Os dois chamados para falar com um vendedor: WhatsApp (link wa.me, medido como whatsapp_click
 * pelo gtm.ts a partir do data-track-location) e formulário de orçamento.
 */
export function VendorCta({
  waMessage,
  location,
  product,
  dark = false,
  showQuote = true,
  className,
}: {
  waMessage: string;
  /** vira click_location no evento do GA4 (ver lib/gtm.ts) */
  location: string;
  product?: string;
  /** botão de orçamento claro, para fundo escuro */
  dark?: boolean;
  /** false ao lado do próprio formulário, onde o botão de orçamento seria redundante */
  showQuote?: boolean;
  className?: string;
}) {
  return (
    <div data-track-location={location} className={cn("flex flex-wrap gap-3", className)}>
      <BtnPrimary href={waHref(waMessage)} external>
        <MessageCircle className="h-4 w-4" aria-hidden />
        Falar com um vendedor
      </BtnPrimary>
      {showQuote && (
        <BtnGhost to={quoteHref({ produto: product, mensagem: waMessage })} dark={dark}>
          Pedir orçamento
        </BtnGhost>
      )}
    </div>
  );
}
