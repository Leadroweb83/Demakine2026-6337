import { Link } from "wouter";
import { ArrowRight, Wheat } from "lucide-react";
import { Reveal } from "./reveal";
import { BtnWhats } from "./kit";
import { agroChain, agroChains, agroClients } from "@/lib/agro";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Faixa dedicada ao agro na home, com paleta própria (verde + dourado)
 * levando para a página /agro.
 */
export function AgroBand() {
  return (
    <section className="agro py-16 md:py-24">
      <div className="agro-bg" />
      <div className="agro-beam" />
      <div className="agro-field" />

      <div className="dm-container relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <span className="agro-tag">
              <span>Linha Agro</span>
            </span>

            <h2 className="cine-title cine-title-sm mt-5 text-white">
              <span className="cine-line">
                <span style={{ ["--i" as string]: 0 }}>Safra não espera</span>
              </span>
              <span className="cine-line">
                <span style={{ ["--i" as string]: 1 }}>
                  equipamento <span className="text-[#e8c469]">parado</span>
                </span>
              </span>
            </h2>

            <div className="agro-rule mt-5" />

            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-white/75">
              Grãos, fertilizantes, sementes, ração e hortifrúti têm uma área só para eles no nosso
              site: equipamento indicado por etapa da operação, correia certa para cada material e{" "}
              {agroClients.length} clientes do agro que já produzem com a Demakine.
            </p>

            <ul className="agro-bullets mt-7">
              {agroChains.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <span className="font-semibold text-white">{c.name}</span>: {c.text}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/agro"
                className="cine-shine inline-flex items-center justify-center gap-2 rounded-xl bg-[#d8a02a] px-6 py-3.5 text-[15px] font-bold text-[#12331e] transition-colors hover:bg-[#e8b23c]"
              >
                Ver a linha agro
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <BtnWhats href={waLink("Olá! Sou do agro e quero falar sobre equipamentos Demakine.")}>
                Falar com especialista agro
              </BtnWhats>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {agroChain.map((s, i) => (
              <Reveal
                key={s.step}
                i={i}
                className={cn("h-full", i === agroChain.length - 1 && agroChain.length % 2 === 1 && "sm:col-span-2")}
              >
                <Link
                  href="/agro#etapas"
                  className="cine-shine flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.05] p-5 transition-colors hover:border-[#e8c469]/55"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[1.5rem] font-extrabold leading-none text-[#e8c469]/70">
                      {s.step}
                    </span>
                    <Wheat className="h-4.5 w-4.5 text-[#e8c469]/70" />
                  </div>
                  <p className="mt-4 text-[15.5px] font-bold text-white">{s.title}</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/62">{s.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
