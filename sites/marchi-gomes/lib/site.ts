import { site, whatsappMessage } from "@/content/site";

/** Link de WhatsApp. Sem numero cadastrado, cai na secao de contato. */
export function whatsappHref(message: string = whatsappMessage) {
  const n = site.contact.whatsapp;
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : "/#contato";
}

export const hasAddress = Boolean(site.contact.street && site.contact.city);
