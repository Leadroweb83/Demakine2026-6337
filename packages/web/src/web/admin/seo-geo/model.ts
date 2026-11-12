/** Regras puras das telas de SEO e GEO (cores das notas, ordem dos problemas, rótulos e datas). Sem React. */
import type { Issue } from "../../../api/lib/seo/issues";
import { ITEM_NAMES } from "../../../api/lib/seo/rules";
import type { SiteArea } from "../../../api/lib/seo/types";

export type ScoreColor = "verde" | "amarelo" | "vermelho";

/** Faixas do PageSpeed: 90 a 100 verde, 50 a 89 amarelo, 0 a 49 vermelho. Arredonda antes, como o número mostrado. */
export function scoreColor(n: number): ScoreColor {
  if (!Number.isFinite(n)) return "vermelho";
  const r = Math.round(n);
  return r >= 90 ? "verde" : r >= 50 ? "amarelo" : "vermelho";
}

export function scoreWord(n: number): string {
  const c = scoreColor(n);
  return c === "verde" ? "Bom" : c === "amarelo" ? "Pode melhorar" : "Ruim";
}

const SEVERITY_RANK: Record<Issue["severity"], number> = { critico: 0, atencao: 1, info: 2 };

/** Páginas comerciais e de categoria primeiro (são as que vendem), depois produtos, depois o resto. */
const areaRank = (area: SiteArea | undefined) => (area === "comerciais" || area === "categorias" ? 0 : area === "produtos" ? 1 : area === undefined ? 3 : 2);

/** Críticos antes de atenção antes de informação; dentro de cada um, comerciais, produtos, resto; depois por endereço. */
export function sortIssues<T extends Pick<Issue, "path" | "severity">>(issues: T[], pagesByPath: Map<string, { area: SiteArea }>): T[] {
  return [...issues].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      areaRank(pagesByPath.get(a.path)?.area) - areaRank(pagesByPath.get(b.path)?.area) ||
      a.path.localeCompare(b.path),
  );
}

/** Quanto a nota do site mudou entre os dois últimos dias (null com menos de 2 pontos). */
export function dayDelta(history: { date: string; site: number }[]): number | null {
  if (history.length < 2) return null;
  return history[history.length - 1]!.site - history[history.length - 2]!.site;
}

/** Nome e explicação simples de cada setor da nota. */
export const SECTOR_LABELS = {
  conteudo: { title: "Conteúdo", hint: "Texto suficiente e um título principal (H1) em cada página." },
  imagens: { title: "Imagens", hint: "Fotos com descrição (alt), para o Google entender o que mostram." },
  links: { title: "Links", hint: "Páginas ligadas entre si, para o Google achar tudo." },
  schema: { title: "Dados estruturados", hint: "Dados que o Google lê para mostrar perguntas, preço e trilha nos resultados." },
  idiomas: { title: "Idiomas", hint: "Versões em inglês e espanhol ligadas à página em português." },
  indexacao: { title: "Indexação", hint: "A página está aberta ao Google e responde sem erro." },
  "titulo-descricao": { title: "Título e descrição", hint: "O texto que aparece no resultado do Google, no tamanho certo." },
  compartilhamento: { title: "Compartilhamento", hint: "A prévia que aparece ao mandar o link no WhatsApp e nas redes." },
} as const;

export type SectorId = keyof typeof SECTOR_LABELS;
export const SECTOR_ORDER = Object.keys(SECTOR_LABELS) as SectorId[];

export const AREA_LABELS: Record<SiteArea, string> = {
  produtos: "Produtos",
  categorias: "Categorias",
  comerciais: "Páginas comerciais",
  blog: "Blog",
  cases: "Cases",
  segmentos: "Segmentos",
  vagas: "Vagas",
  exportacao: "Exportação",
  institucional: "Institucional",
  tecnica: "Técnicas",
};

export const AREA_ORDER: SiteArea[] = ["comerciais", "categorias", "produtos", "blog", "cases", "segmentos", "institucional", "vagas", "exportacao"];

/** Aviso antes de esconder uma página do Google: só quando ela recebe visitas e não é técnica. */
export function warnBeforeHiding(visits30d: number, technical: boolean): string | null {
  if (technical || visits30d <= 0) return null;
  return `Esta página recebeu ${visits30d} ${visits30d === 1 ? "visita" : "visitas"} nos últimos 30 dias. Ocultar tira ela do Google.`;
}

const TZ = "America/Sao_Paulo";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const clock = (d: Date) => new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);

/** "hoje às 07:12", "ontem às 07:05" ou "03/11 às 07:05", no horário de Brasília. Data inválida vira "". */
export function formatWhen(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = dayKey(d);
  const when = day === dayKey(now) ? "hoje" : day === dayKey(new Date(now.getTime() - 86_400_000)) ? "ontem" : `${day.slice(8, 10)}/${day.slice(5, 7)}`;
  return `${when} às ${clock(d)}`;
}

/** Nome de cada item da nota, como a pessoa lê (o código é o do auditor). */
export const ITEM_LABELS: Record<string, string> = ITEM_NAMES;

/** Explicação curta de cada item da nota (tela de regras). */
export const ITEM_HINTS: Record<string, string> = {
  titulo: "O título que aparece no Google.",
  descricao: "O texto que aparece abaixo do título no Google.",
  h1: "O título principal visível na página.",
  indexacao: "A página está aberta ao Google e responde sem erro.",
  idiomas: "As versões em inglês e espanhol estão ligadas.",
  conteudo: "Quantidade de texto da página.",
  imagens: "Fotos com descrição (alt).",
  links: "Links entre as páginas do site.",
  schema: "Dados que o Google lê para mostrar perguntas, preço e trilha.",
  compartilhamento: "A prévia do link no WhatsApp e nas redes.",
  velocidade: "Rapidez de carregamento. Ainda não é medida: enquanto isso, esses pontos se dividem entre os outros itens.",
};
