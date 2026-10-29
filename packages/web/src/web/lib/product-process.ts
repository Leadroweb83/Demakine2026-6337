/**
 * Como o equipamento trabalha, passo a passo. Substitui a tabela genérica de materiais
 * nos produtos que têm manual técnico da Demakine como fonte.
 */
export type ProcessStep = { title: string; text: string; icon: "entrada" | "vibracao" | "separacao" | "ensaque" };

export type ProductProcess = {
  title: string;
  intro: string;
  steps: ProcessStep[];
  outputs: { label: string; detail: string }[];
  capacity?: { label: string; unit: string; rows: { model: string; value: number }[] };
  notes: string[];
  source: string;
};

const processes: Record<string, ProductProcess> = {
  "peneira-para-carvao": {
    title: "Como a peneira trabalha o carvão",
    intro:
      "Ela recebe o carvão, separa por tamanho e entrega três saídas diferentes: carvão pronto para o pacote, pó e cavaco. Cada um sai por uma bica própria.",
    steps: [
      {
        icon: "entrada",
        title: "Alimentação",
        text: "O carvão entra pela bica de entrada, a 1,13 m do chão, uma peça depois da outra, sem sobrepor.",
      },
      {
        icon: "vibracao",
        title: "Peneiramento",
        text: "Duas peneiras vibram movidas pelo eixo excêntrico, que classifica o carvão e o empurra até as bicas.",
      },
      {
        icon: "separacao",
        title: "Separação",
        text: "Pó e cavaco caem por saídas próprias e não se misturam com o carvão bom.",
      },
      {
        icon: "ensaque",
        title: "Ensaque",
        text: "O carvão classificado sai pelas bicas de ensaque, a 80 cm do chão, direto para o pacote.",
      },
    ],
    outputs: [
      { label: "Carvão para ensaque", detail: "2 bicas (PDM1 e PDM2) ou 3 bicas (PDM3)" },
      { label: "Pó", detail: "1 saída própria" },
      { label: "Cavaco", detail: "1 saída própria" },
    ],
    capacity: {
      label: "Produção por modelo",
      unit: "pacotes de 3 kg por hora",
      rows: [
        { model: "PDM1", value: 200 },
        { model: "PDM2", value: 400 },
        { model: "PDM3", value: 600 },
      ],
    },
    notes: [
      "Ligue a peneira vazia e só depois comece a alimentar.",
      "Alimente o carvão de forma individual, sem uma peça por cima da outra.",
      "Entrou corpo estranho ou apareceu ruído diferente: desligue o motor na hora e verifique antes de voltar.",
      "No fim do turno, deixe a máquina ligada até sair todo o material.",
    ],
    source: "Manual técnico da Peneira Empacotadora para Carvão Demakine",
  },
};

export function processFor(slug: string) {
  return processes[slug];
}
