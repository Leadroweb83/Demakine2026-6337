import { Approach, Areas, Articles, Contact, Doors, Faq, Firm, Future, Hero, ImageStrip, Marquee, Pillars, Services } from "@/components/sections";
import { JsonLd, faqLd, legalServiceLd } from "@/components/json-ld";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Doors />
      <Areas />
      <Services />
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
