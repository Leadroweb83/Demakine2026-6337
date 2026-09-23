/**
 * Motor de dimensionamento e cálculo.
 * Toda a lógica usa as tabelas de modelos reais publicadas em content.json
 * (nenhum valor inventado; quando a tabela não cobre o caso, cai em "sob medida").
 */
import { getProduct, products, type Product } from "./content";

/* ------------------------------------------------------------------ helpers */

/** "1,8 m" | "700 mm" | "12 metros" -> metros (number) */
export function parseMeters(raw?: string): number | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  const num = Number.parseFloat(v.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(num)) return null;
  if (v.includes("mm")) return num / 1000;
  if (v.includes("cm")) return num / 100;
  return num;
}

/** "1,5 cv" -> 1.5 */
export function parseCv(raw?: string): number | null {
  if (!raw) return null;
  const num = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

export function brl(v: number, digits = 0): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function num(v: number, digits = 0): string {
  return v.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/* ------------------------------------------------------- famílias de produto */

export type MaterialKey =
  | "sacaria"
  | "caixas"
  | "granel"
  | "graos-fechado"
  | "reciclagem"
  | "frutas"
  | "carvao"
  | "cama-frango";

export const materials: { key: MaterialKey; label: string; hint: string }[] = [
  { key: "sacaria", label: "Sacaria / fardos", hint: "sacos de 25 a 60 kg, fardos, bags" },
  { key: "caixas", label: "Caixas e pacotes", hint: "caixas de papelão, engradados, encomendas" },
  { key: "granel", label: "Granel a céu aberto", hint: "grãos, adubo, areia, cavaco" },
  { key: "graos-fechado", label: "Granel em tubo fechado", hint: "sem perda ao vento, pó, farelo" },
  { key: "reciclagem", label: "Reciclagem / triagem", hint: "esteira de catação, cooperativa" },
  { key: "frutas", label: "Frutas e legumes", hint: "produto delicado, hortifruti, CEASA" },
  { key: "carvao", label: "Carvão / peneiramento", hint: "seleção e empacotamento de carvão" },
  { key: "cama-frango", label: "Cama de frango / aviário", hint: "limpeza de galpão avícola" },
];

const familyBySituation: Record<MaterialKey, string> = {
  sacaria: "esteira-transportadora-para-sacaria",
  caixas: "esteira-transportadora-de-caixas",
  granel: "esteira-transportadora-para-granel",
  "graos-fechado": "rosca-transportadora",
  reciclagem: "esteira-transportadora-para-reciclagem-triagem",
  frutas: "esteira-para-transporte-de-frutas-e-legumes",
  carvao: "peneira-para-carvao",
  "cama-frango": "esteira-transportadora-em-v-para-cama-de-frango-aviario",
};

/* -------------------------------------------------------------- sizing (esteira) */

export type SizingInput = {
  material: MaterialKey;
  /** distância horizontal entre carga e descarga, em metros */
  distance: number;
  /** altura de descarga desejada, em metros */
  height: number;
  /** ambiente: precisa inox/sanitário? */
  sanitary?: boolean;
};

export type SizingResult = {
  product: Product;
  /** comprimento de esteira necessário (hipotenusa), em metros */
  needed: number;
  /** inclinação resultante, em graus */
  angle: number;
  model?: {
    model: string;
    length: number | null;
    heightMax: number | null;
    motor: string | null;
    belt: string | null;
    speed: string | null;
    capacity: string | null;
  };
  custom: boolean;
  notes: string[];
  alternatives: Product[];
};

export function sizeConveyor(input: SizingInput): SizingResult {
  const notes: string[] = [];
  const distance = Math.max(0, input.distance);
  const height = Math.max(0, input.height);
  const needed = Math.sqrt(distance * distance + height * height);
  const angle = distance > 0 ? (Math.atan2(height, distance) * 180) / Math.PI : height > 0 ? 90 : 0;

  let slug = familyBySituation[input.material];

  // elevação vertical alta pede elevador, não esteira inclinada
  if (height >= 7 && (input.material === "sacaria" || input.material === "caixas")) {
    slug = "elevador-de-sacaria";
    notes.push(
      "Para elevar mais de 7 m com sacaria, o elevador de sacaria ocupa muito menos espaço no piso que uma esteira inclinada.",
    );
  }
  if (height >= 7 && (input.material === "granel" || input.material === "graos-fechado")) {
    slug = "elevador-de-canecas";
    notes.push(
      "Acima de 7 m de elevação com granel, o elevador de canecas é a solução mais eficiente e ocupa menos área.",
    );
  }
  if (angle > 30 && input.material === "granel") {
    notes.push(
      "Inclinação acima de 30° com granel exige correia taliscada ou em V para o material não retornar.",
    );
  }
  if (input.sanitary) {
    notes.push(
      "Para uso sanitário fabricamos a mesma máquina em aço inox, com correia atóxica, item de projeto especial.",
    );
  }

  const product = getProduct(slug) ?? products[0];

  // escolhe o menor modelo que atende comprimento e altura
  const rows = product.models
    .map((m) => ({
      model: m.model,
      length: parseMeters(m.specs["Comprimento"]),
      heightMax: parseMeters(m.specs["Altura máxima"]),
      motor: m.specs["Motor de tração"] ?? null,
      belt: m.specs["Largura da correia"] ?? m.specs["Diâmetro Helicóide"] ?? null,
      speed: m.specs["Velocidade"] && m.specs["Velocidade"] !== "Definir" ? m.specs["Velocidade"] : null,
      capacity: m.specs["Capacidade"] ?? null,
    }))
    .filter((m) => m.length !== null)
    .sort((a, b) => (a.length ?? 0) - (b.length ?? 0));

  const fit = rows.find(
    (m) => (m.length ?? 0) >= needed - 0.01 && (m.heightMax === null || m.heightMax >= height - 0.01),
  );

  const alternatives = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 2);

  if (!fit) {
    if (rows.length > 0) {
      notes.push(
        `A linha padrão vai até ${num(rows[rows.length - 1].length ?? 0, 0)} m de comprimento. Acima disso fabricamos sob medida ou em módulos.`,
      );
    } else {
      notes.push("Esse equipamento é sempre dimensionado sob medida para a sua operação.");
    }
    return { product, needed, angle, custom: true, notes, alternatives };
  }

  return { product, needed, angle, model: fit, custom: false, notes, alternatives };
}

/* --------------------------------------------------------------------- ROI */

export type RoiInput = {
  /** sacos ou volumes movimentados por dia */
  volumePerDay: number;
  /** pessoas hoje dedicadas à movimentação manual */
  people: number;
  /** custo mensal por pessoa (salário + encargos) */
  costPerPerson: number;
  /** dias trabalhados por mês */
  daysPerMonth: number;
  /** pessoas que continuam na operação depois da esteira */
  peopleAfter: number;
  /** investimento estimado no equipamento (opcional) */
  investment?: number;
};

export type RoiResult = {
  monthlySaving: number;
  yearlySaving: number;
  paybackMonths: number | null;
  hoursManualPerDay: number;
  hoursBeltPerDay: number;
  hoursSavedPerMonth: number;
  volumePerYear: number;
  costPerVolumeBefore: number;
  costPerVolumeAfter: number;
};

/** Referências usadas no cálculo (mostradas na tela, nada escondido). */
export const roiAssumptions = {
  /** volumes por hora por pessoa na movimentação manual */
  manualPerPersonHour: 180,
  /** volumes por hora na esteira: 40 m/min de correia com 1 volume a cada 1,2 m */
  beltPerHour: 2000,
};

export function computeRoi(input: RoiInput): RoiResult {
  const days = Math.max(1, input.daysPerMonth);
  const people = Math.max(1, input.people);
  const after = Math.min(Math.max(0, input.peopleAfter), people);
  const volume = Math.max(1, input.volumePerDay);

  const monthlySaving = Math.max(0, (people - after) * input.costPerPerson);
  const yearlySaving = monthlySaving * 12;

  const hoursManualPerDay = volume / (people * roiAssumptions.manualPerPersonHour);
  const hoursBeltPerDay = volume / roiAssumptions.beltPerHour;
  const hoursSavedPerMonth = Math.max(0, (hoursManualPerDay - hoursBeltPerDay) * days);

  const volumePerYear = volume * days * 12;
  const costBefore = people * input.costPerPerson * 12;
  const costAfter = after * input.costPerPerson * 12;

  return {
    monthlySaving,
    yearlySaving,
    paybackMonths:
      input.investment && input.investment > 0 && monthlySaving > 0
        ? input.investment / monthlySaving
        : null,
    hoursManualPerDay,
    hoursBeltPerDay,
    hoursSavedPerMonth,
    volumePerYear,
    costPerVolumeBefore: volumePerYear > 0 ? costBefore / volumePerYear : 0,
    costPerVolumeAfter: volumePerYear > 0 ? costAfter / volumePerYear : 0,
  };
}

/* -------------------------------------------------------------------- quiz */

export type QuizAnswers = {
  material: MaterialKey | null;
  volume: "baixo" | "medio" | "alto" | null;
  move: "fixo" | "movel" | null;
  height: "chao" | "media" | "alta" | null;
  ambient: "comum" | "sanitario" | "externo" | null;
};

export const emptyQuiz: QuizAnswers = {
  material: null,
  volume: null,
  move: null,
  height: null,
  ambient: null,
};

export type QuizResult = {
  main: Product;
  others: Product[];
  reasons: string[];
};

export function solveQuiz(a: QuizAnswers): QuizResult | null {
  if (!a.material || !a.volume || !a.move || !a.height || !a.ambient) return null;

  const reasons: string[] = [];
  let slug = familyBySituation[a.material];

  if (a.height === "alta" && (a.material === "sacaria" || a.material === "caixas")) {
    slug = "elevador-de-sacaria";
    reasons.push("Elevação acima de 6 m com volumes fechados pede elevador, não esteira inclinada.");
  }
  if (a.height === "alta" && (a.material === "granel" || a.material === "graos-fechado")) {
    slug = "elevador-de-canecas";
    reasons.push("Para elevar granel a grande altura, o elevador de canecas é o mais eficiente.");
  }
  if (a.material === "granel" && a.height === "media") {
    slug = "esteira-transportadora-para-granel";
    reasons.push("Em V a correia forma calha e segura o granel na subida, sem perda de material.");
  }

  const main = getProduct(slug) ?? products[0];

  if (a.move === "movel") {
    reasons.push("Fabricamos com rodas e pneus automotivos para você deslocar a máquina no pátio.");
  } else {
    reasons.push("Versão fixa com pés reguláveis e estrutura ancorada ao piso.");
  }
  if (a.volume === "alto") {
    reasons.push("Volume alto: recomendamos motorização reforçada e correia mais larga.");
  }
  if (a.volume === "baixo") {
    reasons.push("Volume moderado: um modelo compacto da linha já resolve com folga.");
  }
  if (a.ambient === "sanitario") {
    reasons.push("Ambiente sanitário: mesma máquina em aço inox com correia atóxica.");
  }
  if (a.ambient === "externo") {
    reasons.push("Uso externo: galvanização a fogo ou pintura industrial reforçada.");
  }

  const others = products
    .filter((p) => p.slug !== main.slug && (p.category === main.category || p.models.length > 0))
    .slice(0, 2);

  return { main, others, reasons };
}

/* -------------------------------------------------- configurador (SVG) */

export type ConfigInput = {
  length: number;
  angle: number;
  family: "sacaria" | "granel" | "caixas" | "reciclagem";
};

export function configure({ length, angle, family }: ConfigInput) {
  const slug =
    family === "sacaria"
      ? "esteira-transportadora-para-sacaria"
      : family === "granel"
        ? "esteira-transportadora-para-granel"
        : family === "caixas"
          ? "esteira-transportadora-de-caixas"
          : "esteira-transportadora-para-reciclagem-triagem";

  const product = getProduct(slug) ?? products[0];
  const rows = product.models
    .map((m) => ({
      model: m.model,
      length: parseMeters(m.specs["Comprimento"]),
      heightMax: parseMeters(m.specs["Altura máxima"]),
      motor: m.specs["Motor de tração"] ?? "-",
      belt: m.specs["Largura da correia"] ?? "-",
      speed: m.specs["Velocidade"] ?? "-",
      capacity: m.specs["Capacidade"] ?? "-",
    }))
    .filter((m) => m.length !== null)
    .sort((a, b) => (a.length ?? 0) - (b.length ?? 0));

  const discharge = Math.sin((angle * Math.PI) / 180) * length;
  const fit = rows.find((m) => (m.length ?? 0) >= length - 0.01);
  const maxLen = rows.length ? (rows[rows.length - 1].length ?? 0) : 0;
  const overHeight = !!(fit?.heightMax && discharge > fit.heightMax);

  return {
    product,
    model: fit ?? null,
    discharge,
    maxLen,
    overHeight,
    custom: !fit || overHeight,
  };
}
