import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { api } from "@/lib/api";

/** Chamada para /vagas usada na home e no contato; mostra quantas vagas estão abertas. */
export function JobsCta() {
  const count = useQuery({
    queryKey: ["vagas"],
    queryFn: async () => {
      const res = await api.vagas.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).jobs;
    },
    select: (jobs) => jobs.length,
  });
  const n = count.data ?? 0;

  return (
    <Reveal>
      <Link
        href="/vagas"
        className="group flex flex-col gap-5 rounded-2xl border border-dm-line bg-white p-6 transition-colors hover:border-dm-blue/40 sm:flex-row sm:items-center md:p-8"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-dm-blue-soft text-dm-blue">
          <Briefcase className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="eyebrow block text-dm-blue">Trabalhe na Demakine</span>
          <span className="mt-2 block font-display text-[21px] font-extrabold leading-tight text-dm-ink md:text-[24px]">
            {n > 0
              ? `${n} ${n === 1 ? "vaga aberta" : "vagas abertas"} na nossa fábrica em Limeira`
              : "Quer fazer parte do time?"}
          </span>
          <span className="mt-1.5 block text-[15px] text-dm-gray">
            Candidate-se online ou deixe o currículo no banco de talentos.
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-dm-blue px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors group-hover:bg-[#0d3480] sm:self-center">
          Ver vagas
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </Reveal>
  );
}
