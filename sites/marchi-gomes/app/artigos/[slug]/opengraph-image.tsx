import { articles } from "@/content/articles";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => articles.map((a) => ({ slug: a.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  return ogImage(a?.title ?? "Artigos", a ? `Artigo · ${a.area}` : "Artigos");
}
