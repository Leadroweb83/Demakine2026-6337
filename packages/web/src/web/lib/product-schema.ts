import { site } from "./site";

/**
 * Modelo principal por produto, usado como `sku` no schema. Só entra onde o Marketing indicou um modelo de
 * referência; produto sem modelo único (a mesma série aparece em mais de uma esteira) fica sem `sku`.
 */
export const PRIMARY_SKU: Record<string, string> = {
  "esteira-transportadora-para-sacaria": "ETD8",
  "rosca-transportadora": "RTC10",
};

export const PRICE_ON_REQUEST = "Preço sob consulta: definido em projeto conforme comprimento, correia, motorização e frete";

/**
 * `offers` do Product, sem preço (decisão comercial: preço sob consulta). Sem `price` o Google não mostra valor
 * no resultado, mas o alerta de campo ausente deixa de aparecer. Nunca `price: 0`.
 * O vendedor leva o `@id` da empresa e os dados mínimos: o Google não resolve `@id` de outra página.
 */
export function productOffer(url: string) {
  return {
    "@type": "Offer",
    url,
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", "@id": `${site.url}/#empresa`, name: site.legal, url: site.url },
    priceSpecification: { "@type": "PriceSpecification", priceCurrency: "BRL", description: PRICE_ON_REQUEST },
  };
}

/** Campos do Product que o Marketing pediu: `url`, `sku` (quando há) e `offers`. */
export function productCommerce(slug: string, url: string) {
  const sku = PRIMARY_SKU[slug];
  return { url, ...(sku ? { sku } : {}), offers: productOffer(url) };
}
