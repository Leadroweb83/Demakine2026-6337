import Link from "next/link";
import { Monogram } from "@/components/logo";
import { Arrow } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="hero-light">
      <div className="wrap grid min-h-[100svh] items-center gap-12 pt-28 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow" data-reveal>Erro 404</p>
          <h1 className="display mt-5 text-[clamp(2.8rem,7vw,6rem)]" data-split>Este caminho não leva a lugar algum.</h1>
          <p className="mt-6 max-w-md text-bone/75" data-reveal>A página pode ter mudado de endereço. Volte ao início ou veja as áreas de atuação.</p>
          <div className="mt-10 flex flex-wrap gap-4" data-reveal>
            <Link href="/" className="btn btn-primary">Voltar ao início <Arrow /></Link>
            <Link href="/#areas" className="btn btn-ghost">Áreas de atuação</Link>
          </div>
        </div>
        <Monogram assemble className="h-56 w-56 text-copper max-lg:order-first max-lg:h-32 max-lg:w-32 lg:h-80 lg:w-80" />
      </div>
    </section>
  );
}
