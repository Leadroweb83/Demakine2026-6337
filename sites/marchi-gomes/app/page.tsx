import { Approach, Areas, Contact, Faq, Firm, Hero, Marquee, Team } from "@/components/sections";
import { JsonLd, faqLd, legalServiceLd } from "@/components/json-ld";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Areas />
      <Firm />
      <Approach />
      <Team />
      <Faq />
      <Contact />
      <JsonLd data={legalServiceLd()} />
      <JsonLd data={faqLd()} />
    </>
  );
}
