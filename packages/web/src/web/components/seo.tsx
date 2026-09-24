import { useEffect } from "react";
import { site } from "@/lib/site";
import { editedDoc } from "@/lib/runtime-content";
import { seoKey } from "@/lib/seo-pages";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** página que não deve ir para o Google (404, loja ainda não lançada) */
  noindex?: boolean;
};

function setMeta(attr: "name" | "property", key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

/** Aviso "não indexar": liga nas páginas marcadas e sai nas demais (o site troca de página sem recarregar). */
function setRobots(noindex: boolean) {
  const tag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!noindex) return tag?.remove();
  if (tag) tag.setAttribute("content", "noindex, follow");
  else setMeta("name", "robots", "noindex, follow");
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

export function Seo({
  title: baseTitle,
  description: baseDescription,
  path = "/",
  image,
  type = "website",
  jsonLd,
  noindex = false,
}: SeoProps) {
  // título e descrição editados no painel (SEO das páginas fixas) valem sobre o padrão da página
  const edited = editedDoc<{ title?: string; description?: string }>("seo", seoKey(path));
  const title = edited?.title?.trim() || baseTitle;
  const description = edited?.description?.trim() || baseDescription;

  useEffect(() => {
    const url = `${site.url}${path}`;
    const ogImage = `${site.url}${image ?? "/og-image.png"}`;

    document.title = title;
    setMeta("name", "description", description);
    setRobots(noindex);
    // página fora do Google não aponta canonical (um 404 não pode herdar o endereço da página anterior)
    if (noindex) document.head.querySelector('link[rel="canonical"]')?.remove();
    else setLink("canonical", url);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
  }, [title, description, path, image, type, noindex]);

  useEffect(() => {
    if (!jsonLd) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLd]);

  return null;
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.legal,
  alternateName: site.name,
  url: site.url,
  logo: `${site.url}/img/site/logo-demakine.png`,
  email: site.email,
  telephone: `+55 ${site.phone.replace(/\D/g, "").replace(/^(\d{2})(\d{4,5})(\d{4})$/, "$1 $2-$3")}`,
  address: {
    "@type": "PostalAddress",
    // endereço de Dados do site: "Rua X, 212, Bairro, Cidade/UF"
    streetAddress: site.address.split(",").slice(0, -1).join(",").trim() || site.address,
    addressLocality: (site.address.split(",").pop() ?? "").split("/")[0]!.trim() || "Limeira",
    addressRegion: (site.address.split("/").pop() ?? "SP").trim().slice(0, 2).toUpperCase(),
    addressCountry: "BR",
  },
  sameAs: [site.social.facebook, site.social.instagram, site.social.linkedin, site.social.youtube],
};
