import { images } from "@/content/site";
import { Approach, Areas, Articles, Contact, Doors, Faq, Firm, Future, Hero, ImageStrip, Marquee, Pillars, Services } from "@/components/sections";
import { JsonLd, faqLd, legalServiceLd } from "@/components/json-ld";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Doors />
      <Areas />
      <Services image={images.services} imageAlt="Duas pessoas revisam e assinam um documento, com a estátua da Justiça ao fundo" />
      <ImageStrip />
      <Approach />
      <Firm />
      <Pillars />
      <Future />
      <Articles />
      <Faq />
      <Contact />
      <JsonLd data={legalServiceLd()} />
      <JsonLd data={faqLd()} />
    </>
  );
}
