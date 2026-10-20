import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";
import { tr } from "@/lib/i18n";

/**
 * Único botão de WhatsApp do site: fica fixo na lateral. Todos os outros botões de contato levam ao
 * formulário de orçamento. No celular sobe um pouco para não ficar atrás da barra "Orçamento".
 */
export function WhatsappFloat() {
  return (
    <a
      href={waLink("Olá! Vim pelo site da Demakine e quero falar com um especialista.")}
      target="_blank"
      rel="noreferrer"
      aria-label={tr("Falar no WhatsApp")}
      className="fixed bottom-[88px] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-dm-green text-white shadow-[0_14px_34px_rgba(23,134,79,0.4)] transition-colors hover:bg-dm-green-dark md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
