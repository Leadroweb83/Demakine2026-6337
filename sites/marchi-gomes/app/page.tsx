import { Approach, Areas, Contact, Faq, Firm, Hero } from "@/components/sections";
import { JsonLd, faqLd, legalServiceLd } from "@/components/json-ld";

export default function Home() {
  return (
    <>
      <Hero />
      <Areas />
      <Firm />
      <Approach />
      <Faq />
      <Contact />
      <JsonLd data={legalServiceLd()} />
      <JsonLd data={faqLd()} />
    </>
  );
}
