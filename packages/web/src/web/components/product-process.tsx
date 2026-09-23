import { ArrowDownToLine, Check, ChevronRight, FileText, PackageCheck, Split, Vibrate } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/kit";
import type { ProductProcess as Process, ProcessStep } from "@/lib/product-process";

const ICONS: Record<ProcessStep["icon"], typeof Vibrate> = {
  entrada: ArrowDownToLine,
  vibracao: Vibrate,
  separacao: Split,
  ensaque: PackageCheck,
};

export function ProductProcess({ process }: { process: Process }) {
  const max = Math.max(...(process.capacity?.rows.map((r) => r.value) ?? [1]));

  return (
    <Section>
      <Reveal>
        <p className="eyebrow text-dm-blue">Como funciona</p>
        <h2 className="h2 mt-3">{process.title}</h2>
        <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">{process.intro}</p>
      </Reveal>

      <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {process.steps.map((step, idx) => {
          const Icon = ICONS[step.icon];
          const last = idx === process.steps.length - 1;
          return (
            <li key={step.title} className="relative">
              <Reveal i={idx} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dm-blue-soft text-dm-blue">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-[13px] font-extrabold tracking-[0.18em] text-dm-ink/30">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[17px] font-bold text-dm-ink">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-dm-ink/70">{step.text}</p>
                </div>
              </Reveal>
              {!last && (
                <ChevronRight
                  aria-hidden="true"
                  className="absolute -right-3.5 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 rounded-full border border-dm-line bg-white p-1 text-dm-blue xl:block"
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-2xl border border-dm-line bg-white p-6">
            <h3 className="text-[16px] font-bold text-dm-ink">O que sai da máquina</h3>
            <ul className="mt-4 divide-y divide-dm-line">
              {process.outputs.map((o, idx) => (
                <li key={o.label} className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="flex items-center gap-2.5 text-[15px] font-semibold text-dm-ink">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: ["#103d94", "#8a94a6", "#b45309"][idx] ?? "#103d94" }}
                    />
                    {o.label}
                  </span>
                  <span className="text-right text-[14px] text-dm-gray">{o.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {process.capacity && (
          <Reveal i={1}>
            <div className="h-full rounded-2xl border border-dm-line bg-white p-6">
              <h3 className="text-[16px] font-bold text-dm-ink">{process.capacity.label}</h3>
              <p className="mt-1 text-[13.5px] text-dm-gray">{process.capacity.unit}</p>
              <ul className="mt-5 space-y-4">
                {process.capacity.rows.map((r) => (
                  <li key={r.model}>
                    <div className="flex items-baseline justify-between text-[14px]">
                      <span className="font-bold text-dm-ink">{r.model}</span>
                      <span className="font-semibold tabular-nums text-dm-ink/75">{r.value}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full rounded-full bg-dm-blue-soft">
                      <div
                        className="h-full rounded-full bg-dm-blue transition-[width] duration-700"
                        style={{ width: `${(r.value / max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>

      <Reveal className="mt-4">
        <div className="rounded-2xl bg-dm-blue-soft/60 p-6">
          <h3 className="text-[16px] font-bold text-dm-ink">Na hora de operar</h3>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {process.notes.map((n) => (
              <li key={n} className="flex gap-3 text-[15px] leading-relaxed text-dm-ink/80">
                <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-dm-blue" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center gap-2 text-[13px] text-dm-gray">
            <FileText className="h-4 w-4 shrink-0" />
            Fonte: {process.source}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
