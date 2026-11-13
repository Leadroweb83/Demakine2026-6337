import { TunnelLazy } from "@/components/tunnel-lazy";
import { images } from "@/content/site";
import { Approach, Areas, Articles, Contact, Doors, Faq, Firm, Future, Hero, ImageStrip, Marquee, Pillars, Services } from "@/components/sections";
import { JsonLd, faqLd, legalServiceLd } from "@/components/json-ld";
import { ScalesDivider } from "@/components/scales-divider";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Doors />
      <ScalesDivider />
      <Areas />
      <Services image={images.services} imageAlt="Duas pessoas revisam e assinam um documento, com a estátua da Justiça ao fundo" />
      <TunnelLazy fallback={<ImageStrip />} />
      <Approach />
      <Firm />
      <Pillars />
      <Future />
      <Articles />
      <ScalesDivider tone="bone" />
      <Faq image={images.faq} imageAlt="Uma pessoa entrega uma caneta a outra, sobre uma mesa com um documento para assinar" />
      <Contact />
      <JsonLd data={legalServiceLd()} />
      <JsonLd data={faqLd()} />
    </>
  );
}
