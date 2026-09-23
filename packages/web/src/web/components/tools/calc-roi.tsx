import { useId, useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { brl, computeRoi, num, roiAssumptions } from "@/lib/engine";
import { LeadForm } from "@/components/lead-form";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { RingChart } from "@/components/ui/ring-chart";

/**
 * Calculadora de retorno: compara o custo da movimentação manual
 * com a operação mecanizada. Não estima preço de máquina; o investimento
 * é opcional e informado pelo próprio usuário.
 */
export function CalcRoi({ dark = false }: { dark?: boolean }) {
  const [volumePerDay, setVolume] = useState(1200);
  const [people, setPeople] = useState(4);
  const [peopleAfter, setAfter] = useState(2);
  const [costPerPerson, setCost] = useState(3800);
  const [daysPerMonth, setDays] = useState(22);
  const [investment, setInvestment] = useState<number | "">("");
  const [showForm, setShowForm] = useState(false);
  const uid = useId();

  const r = useMemo(
    () =>
      computeRoi({
        volumePerDay,
        people,
        peopleAfter,
        costPerPerson,
        daysPerMonth,
        investment: investment === "" ? undefined : investment,
      }),
    [volumePerDay, people, peopleAfter, costPerPerson, daysPerMonth, investment],
  );

  const box = cn(
    "rounded-2xl border p-6 md:p-7",
    dark ? "border-white/12 bg-white/[0.05] backdrop-blur" : "border-dm-line bg-white shadow-sm",
  );
  const fieldLabel = cn("text-[13.5px] font-semibold", dark ? "text-white/75" : "text-dm-ink/85");
  const input = cn(
    "mt-1.5 w-full rounded-xl border px-4 py-2.5 text-[15px] tabnum outline-none",
    dark
      ? "border-white/15 bg-white/[0.06] text-white focus:border-white/45"
      : "border-dm-line bg-white text-dm-ink focus:border-dm-blue",
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
      <div className={box}>
        <div className="flex items-center gap-2">
          <Calculator className={cn("h-4 w-4", dark ? "text-white/60" : "text-dm-blue")} />
          <p
            className={cn(
              "text-[13px] font-bold uppercase tracking-wide",
              dark ? "text-white/55" : "text-dm-gray",
            )}
          >
            Como é hoje na sua operação
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-volume`} className={fieldLabel}>Volumes movimentados por dia</label>
            <input
              id={`${uid}-volume`}
              type="number"
              min={1}
              value={volumePerDay}
              onChange={(e) => setVolume(Math.max(1, Number(e.target.value)))}
              className={input}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-dias`} className={fieldLabel}>Dias trabalhados por mês</label>
            <input
              id={`${uid}-dias`}
              type="number"
              min={1}
              max={31}
              value={daysPerMonth}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
              className={input}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-pessoas`} className={fieldLabel}>Pessoas nessa tarefa hoje</label>
            <input
              id={`${uid}-pessoas`}
              type="number"
              min={1}
              value={people}
              onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
              className={input}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-depois`} className={fieldLabel}>Pessoas depois da esteira</label>
            <input
              id={`${uid}-depois`}
              type="number"
              min={0}
              value={peopleAfter}
              onChange={(e) => setAfter(Math.max(0, Number(e.target.value)))}
              className={input}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-custo`} className={fieldLabel}>Custo mensal por pessoa</label>
            <input
              id={`${uid}-custo`}
              type="number"
              min={0}
              step={100}
              value={costPerPerson}
              onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
              className={input}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-investimento`} className={fieldLabel}>Investimento (opcional)</label>
            <input
              id={`${uid}-investimento`}
              type="number"
              min={0}
              step={1000}
              placeholder="se já tem proposta"
              value={investment}
              onChange={(e) => setInvestment(e.target.value === "" ? "" : Number(e.target.value))}
              className={input}
            />
          </div>
        </div>

        <p className={cn("mt-5 text-[12.5px] leading-relaxed", dark ? "text-white/45" : "text-dm-gray")}>
          Premissas usadas no cálculo, à vista: movimentação manual de{" "}
          {roiAssumptions.manualPerPersonHour} volumes por hora por pessoa e esteira a{" "}
          {num(roiAssumptions.beltPerHour)} volumes por hora (correia a 40 m/min, um volume a cada
          1,2 m). Ajuste os campos com os números reais da sua operação.
        </p>
      </div>

      <div className={box}>
        <div className="flex items-center gap-2">
          <TrendingUp className={cn("h-4 w-4", dark ? "text-white/60" : "text-dm-blue")} />
          <p
            className={cn(
              "text-[13px] font-bold uppercase tracking-wide",
              dark ? "text-white/55" : "text-dm-gray",
            )}
          >
            O que muda mecanizando
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Big dark={dark} k="Economia por mês" v={brl(r.monthlySaving)} accent />
          <Big dark={dark} k="Economia em 12 meses" v={brl(r.yearlySaving)} />
          <Big
            dark={dark}
            k="Payback estimado"
            v={r.paybackMonths ? `${num(r.paybackMonths, 1)} meses` : "informe o investimento"}
          />
          <Big dark={dark} k="Horas/mês liberadas" v={`${num(r.hoursSavedPerMonth, 0)} h`} />
        </div>

        {(() => {
          const today = Math.max(1, people) * costPerPerson;
          const stays = Math.max(0, today - r.monthlySaving);
          const share = today > 0 ? Math.round((r.monthlySaving / today) * 100) : 0;
          return today > 0 ? (
            <div
              className={cn(
                "mt-5 rounded-xl border p-5",
                dark ? "border-white/10 bg-white/[0.03]" : "border-dm-line bg-white",
              )}
            >
              <p className={cn("text-[13px] font-semibold", dark ? "text-white/75" : "text-dm-ink/80")}>
                Custo mensal de mão de obra nessa tarefa
              </p>
              <RingChart
                dark={dark}
                size={200}
                thickness={20}
                className="mt-4 sm:flex-row sm:items-center sm:gap-8"
                centerLabel="Hoje, por mês"
                centerValue={brl(today)}
                segments={[
                  {
                    key: "economia",
                    label: "Economia com a esteira",
                    value: r.monthlySaving,
                    display: brl(r.monthlySaving),
                    color: dark ? "#7fa8ff" : "#103d94",
                    badge: { text: `−${share}%`, tone: share > 0 ? "good" : "neutral" },
                  },
                  {
                    key: "continua",
                    label: "Custo que continua",
                    value: stays,
                    display: brl(stays),
                    color: dark ? "rgba(255,255,255,0.3)" : "#c5cad3",
                  },
                ]}
              />
            </div>
          ) : null;
        })()}

        <div
          className={cn(
            "mt-5 overflow-hidden rounded-xl border",
            dark ? "border-white/10" : "border-dm-line",
          )}
        >
          <table className="spec-table text-[14px]">
            <tbody>
              <tr>
                <th scope="row" className={dark ? "!text-white/80" : ""}>
                  Tempo diário na tarefa
                </th>
                <td className={dark ? "text-white/70" : "text-dm-ink/80"}>
                  {num(r.hoursManualPerDay, 1)} h manual → {num(r.hoursBeltPerDay, 1)} h com esteira
                </td>
              </tr>
              <tr>
                <th scope="row" className={dark ? "!text-white/80" : ""}>
                  Volumes por ano
                </th>
                <td className={dark ? "text-white/70" : "text-dm-ink/80"}>{num(r.volumePerYear)}</td>
              </tr>
              <tr>
                <th scope="row" className={dark ? "!text-white/80" : ""}>
                  Custo de mão de obra por volume
                </th>
                <td className={dark ? "text-white/70" : "text-dm-ink/80"}>
                  {brl(r.costPerVolumeBefore, 2)} → {brl(r.costPerVolumeAfter, 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {showForm ? (
          <div className="mt-6">
            <LeadForm
              variant={dark ? "dark" : "light"}
              compact
              source="calculadora-roi"
              product={`ROI: economia de ${brl(r.monthlySaving)}/mês, ${num(volumePerDay)} volumes/dia`}
              buttonLabel="Receber o cálculo"
              title="Receber este cálculo"
              subtitle="Enviamos o memorial com a máquina indicada para a sua operação."
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="cine-shine inline-flex items-center justify-center gap-2 rounded-full bg-dm-red px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017]"
            >
              Receber este cálculo
            </button>
            <a
              href={waLink(
                `Olá! Fiz a conta no site: ${num(volumePerDay)} volumes/dia, economia estimada de ${brl(r.monthlySaving)} por mês. Quero avaliar a máquina.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-dm-green px-6 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-dm-green-dark"
            >
              Falar no WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Big({
  k,
  v,
  dark,
  accent = false,
}: {
  k: string;
  v: string;
  dark?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4",
        dark ? "border-white/10 bg-white/[0.04]" : "border-dm-line bg-dm-surface",
        accent && (dark ? "border-dm-red/60 bg-dm-red/10" : "border-dm-red/40 bg-dm-red/5"),
      )}
    >
      <p className={cn("text-[11.5px] uppercase tracking-wide", dark ? "text-white/45" : "text-dm-gray")}>
        {k}
      </p>
      <p
        className={cn(
          "cine-kicker tabnum mt-1 text-[24px] leading-tight",
          dark ? "text-white" : "text-dm-ink",
          accent && "text-dm-red",
        )}
      >
        {v}
      </p>
    </div>
  );
}
