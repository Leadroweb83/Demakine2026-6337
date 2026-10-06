import { lazy, Suspense, useState } from "react";
import { Calculator, Ruler, SlidersHorizontal } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/kit";
import type { LightTone } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

// cada ferramenta é um arquivo à parte: a página do produto só baixa a que estiver aberta
const CalcEsteira = lazy(() => import("@/components/tools/calc-esteira").then((m) => ({ default: m.CalcEsteira })));
const CalcRoi = lazy(() => import("@/components/tools/calc-roi").then((m) => ({ default: m.CalcRoi })));
const Configurator = lazy(() => import("@/components/tools/configurator").then((m) => ({ default: m.Configurator })));

type ToolId = "configurar" | "dimensionar" | "retorno";

const TOOLS: Record<ToolId, { label: string; hint: string; Icon: typeof Ruler }> = {
  configurar: { label: "Configurar visualmente", hint: "Ajuste comprimento e inclinação e veja o desenho.", Icon: SlidersHorizontal },
  dimensionar: { label: "Dimensionar", hint: "Material, distância e altura: receba o modelo indicado.", Icon: Ruler },
  retorno: { label: "Calcular o retorno", hint: "Compare o custo de movimentar na mão com o equipamento.", Icon: Calculator },
};

/** Quais ferramentas fazem sentido em cada linha de produto. */
function toolsFor(category: string): ToolId[] {
  if (category === "esteiras-transportadoras") return ["configurar", "dimensionar", "retorno"];
  if (category === "roscas-transportadoras" || category === "elevadores") return ["dimensionar", "retorno"];
  return ["retorno"];
}

/**
 * Ferramentas da engenharia dentro da página do produto (saíram do menu do site):
 * configurador, dimensionador e calculadora de retorno, conforme a linha.
 */
export function ProductTools({ category, tone }: { category: string; tone: LightTone }) {
  const tools = toolsFor(category);
  const [active, setActive] = useState<ToolId>(tools[0]!);

  return (
    <Section tone={tone}>
      <Reveal>
        <p className="eyebrow text-dm-blue">Ferramentas da engenharia</p>
        <h2 className="h2 mt-3">Faça a conta antes de pedir o orçamento</h2>
        <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-dm-gray">
          A mesma lógica que a nossa engenharia usa no dia a dia, com os modelos da tabela real de produção.
        </p>
      </Reveal>

      {tools.length > 1 && (
        <div role="tablist" aria-label="Ferramentas" className="mt-8 flex flex-wrap gap-2">
          {tools.map((id) => {
            const { label, Icon } = TOOLS[id];
            const on = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-bold transition-colors",
                  on ? "border-dm-blue bg-dm-blue text-white" : "border-dm-line bg-white text-dm-ink/75 hover:border-dm-blue/50 hover:text-dm-blue",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-[14px] text-dm-gray">{TOOLS[active].hint}</p>

      <div role="tabpanel" className="mt-6">
        <Suspense fallback={<div className="min-h-[420px] rounded-2xl border border-dm-line bg-white" />}>
          {active === "configurar" && <Configurator dark={false} />}
          {active === "dimensionar" && <CalcEsteira />}
          {active === "retorno" && <CalcRoi />}
        </Suspense>
      </div>
    </Section>
  );
}
