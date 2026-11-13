import type { MetadataRoute } from "next";
import { areas, cities, site } from "@/content/site";
import { articles } from "@/content/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/en`, lastModified: now, priority: 0.6 },
    { url: `${site.url}/es`, lastModified: now, priority: 0.6 },
    { url: `${site.url}/escritorio`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    ...areas.map((a) => ({
      url: `${site.url}/areas/${a.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...["para-empresas", ...cities.map((c) => `atuacao/${c.slug}`), "primeiro-atendimento", "glossario", "politica-de-privacidade"].map((u) => ({ url: `${site.url}/${u}`, lastModified: now, priority: 0.5 })),
    { url: `${site.url}/artigos`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...articles.filter((a) => !a.draft).map((a) => ({ url: `${site.url}/artigos/${a.slug}`, lastModified: new Date(a.date), priority: 0.6 })),
  ];
}
