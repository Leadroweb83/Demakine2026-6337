import { areas } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => areas.map((a) => ({ slug: a.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = areas.find((a) => a.slug === slug);
  return ogImage(area?.title ?? "Áreas de atuação", "Área de atuação · Limeira, SP");
}
