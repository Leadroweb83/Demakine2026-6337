import { Calculator, Layers, PiggyBank, Sparkles } from "lucide-react";
import { Seo } from "@/components/seo";
import { Reveal } from "@/components/reveal";
import { Breadcrumb, CtaBand, Section, SectionHead } from "@/components/kit";
import { CineBullets, CineRule, CineSection, CineTag, CineTitle } from "@/components/cine";
import { CalcEsteira } from "@/components/tools/calc-esteira";
import { CalcRoi } from "@/components/tools/calc-roi";
import { Configurator } from "@/components/tools/configurator";
import { Quiz } from "@/components/tools/quiz";
import { roiAssumptions } from "@/lib/engine";

const tools = [
  { id: "dimensionar", Icon: Calculator, name: "Dimensionador de esteira", text: "Comprimento, inclinação e modelo indicado." },
  { id: "configurador", Icon: Layers, name: "Configurador visual", text: "Monte a máquina e veja o desenho." },
  { id: "retorno", Icon: PiggyBank, name: "Calculadora de retorno", text: "Compare mão de obra x esteira." },
  { id: "recomendacao", Icon: Sparkles, name: "Recomendação guiada", text: "5 perguntas, 1 equipamento certo." },
];

export default function Ferramentas() {
  return (
    <>
      <Seo
        title="Ferramentas de engenharia: dimensione sua esteira | Demakine"
        description="Dimensione o transportador, configure a máquina, calcule o retorno da automação e receba a recomendação do equipamento certo. Ferramentas gratuitas da engenharia Demakine."
        path="/ferramentas"
      />

      <div className="border-b border-dm-line bg-white">
        <div className="dm-container py-3.5">
          <Breadcrumb items={[{ label: "Ferramentas" }]} />
        </div>
      </div>

      {/* ---------------------------------------------------- hero cine */}
      <CineSection bleed className="py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <CineTag>Engenharia aberta</CineTag>
            <CineTitle
              as="h1"
              className="mt-5"
              lines={["Descubra a máquina", "certa antes de", "pedir orçamento"]}
            />
            <CineRule className="mt-6" />
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70">
              Quatro ferramentas com a mesma lógica que a nossa engenharia usa no dia a dia. O
              resultado sai com o modelo da nossa tabela real de produção, sem chute e sem cadastro
              obrigatório.
            </p>
            <CineBullets
              className="mt-7"
              items={[
                "Dimensionamento por material, distância e altura de descarga",
                "Modelos reais das linhas ETD, EV, ETH, ER e RTC",
                "Cálculo de retorno com as premissas visíveis na tela",
              ]}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {tools.map((t, i) => (
              <Reveal key={t.id} i={i}>
                <a
                  href={`#${t.id}`}
                  className="cine-shine block h-full rounded-2xl border border-white/12 bg-white/[0.05] p-5 transition-colors hover:border-white/35"
                >
                  <t.Icon className="h-6 w-6 text-[#ff5a60]" />
                  <p className="mt-4 text-[15.5px] font-bold text-white">{t.name}</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{t.text}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </CineSection>

      {/* ---------------------------------------------------- dimensionador */}
      <Section id="dimensionar">
        <SectionHead
          eyebrow="Ferramenta 01"
          title="Dimensionador de transportador"
          text="Informe o material, a distância entre carga e descarga e a altura que precisa vencer. Devolvemos o comprimento aproximado da esteira, a inclinação, a correia indicada e o modelo da nossa tabela."
        />
        <div className="mt-10">
          <CalcEsteira />
        </div>
      </Section>

      {/* ---------------------------------------------------- configurador */}
      <Section tone="surface" id="configurador">
        <SectionHead
          eyebrow="Ferramenta 02"
          title="Configurador visual"
          text="Ajuste comprimento, inclinação e linha do equipamento. O desenho técnico se redesenha em tempo real, com a correia rodando, para você visualizar a máquina antes de pedir a proposta."
        />
        <div className="mt-10">
          <Configurator dark={false} />
        </div>
      </Section>

      {/* ---------------------------------------------------- ROI */}
      <Section id="retorno">
        <SectionHead
          eyebrow="Ferramenta 03"
          title="Vale a pena automatizar?"
          text="Compare o custo de movimentar carga na mão com o ganho de uma esteira. Todas as premissas ficam visíveis: você troca qualquer número e vê o efeito na hora."
        />
        <div className="mt-10">
          <CalcRoi />
        </div>
        <p className="mt-6 max-w-3xl text-[13.5px] leading-relaxed text-dm-gray">
          Premissas padrão: {roiAssumptions.manualPerPersonHour} volumes por hora por pessoa no processo
          manual e {roiAssumptions.beltPerHour} volumes por hora com transportador. São valores de
          referência de operações parecidas com a sua. Ajuste para o seu caso. O investimento é
          opcional e só entra no cálculo quando você informa, porque o preço depende do projeto.
        </p>
      </Section>

      {/* ---------------------------------------------------- quiz */}
      <Section tone="surface" id="recomendacao">
        <SectionHead
          eyebrow="Ferramenta 04"
          title="Recomendação guiada"
          text="Cinco perguntas rápidas sobre a sua operação e indicamos o equipamento mais provável, com os pontos de atenção do projeto."
        />
        <div className="mt-10">
          <Quiz />
        </div>
      </Section>

      <CtaBand
        title="Ferramenta indicou o equipamento. Agora vamos ao projeto."
        text="Envie o resultado que apareceu na tela junto com o material e o layout da sua operação. Nossa engenharia valida o dimensionamento e devolve a proposta com prazo de fabricação."
        waMessage="Olá! Usei as ferramentas do site da Demakine e quero validar o dimensionamento."
      />
    </>
  );
}
