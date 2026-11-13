/** Consultas da área SEO e GEO (React Query sobre as rotas /api/admin/seo/*). */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Issue } from "../../../api/lib/seo/issues";
import type { PageFacts } from "../../../api/lib/seo/html";
import type { SeoRules } from "../../../api/lib/seo/rules";
import type { Check } from "../../../api/lib/seo/score";
import type { PageOverrides } from "../../lib/seo-overrides";
import type { SeoGeoTab } from "./tabs";
import type { SiteArea } from "../../../api/lib/seo/types";

export type RunInfo = {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  kind: "diaria" | "manual";
  status: string;
  pagesTotal: number;
  pagesAudited: number;
  siteSeoScore: number | null;
  sectorScores: Record<string, number>;
  areaScores: Record<string, number>;
  alerts: string[];
};

export type IssueRow = Issue & { fix: string };

export type Resumo = {
  latest: RunInfo | null;
  running: { audited: number; total: number } | null;
  history: { date: string; site: number }[];
  byArea: Record<string, number>;
  bySector: Record<string, number>;
  issues: IssueRow[];
  alerts: string[];
  timeline: { at: string; text: string }[];
};

export type PageRow = {
  path: string;
  lang: "pt" | "en" | "es";
  area: SiteArea;
  label: string;
  inSitemap: boolean;
  hiddenByPanel: boolean;
  technical: boolean;
  seoScore: number | null;
  audited: boolean;
};

export const SEO_KEY = ["seo-geo"] as const;

export function useResumo() {
  return useQuery({
    queryKey: [...SEO_KEY, "resumo"],
    // enquanto uma auditoria roda (a diária, por exemplo), a tela se atualiza sozinha
    refetchInterval: (q) => (q.state.data?.running ? 5000 : false),
    queryFn: async () => {
      const res = await api.admin.seo.resumo.$get();
      if (!res.ok) throw new Error("Não foi possível carregar o resumo de SEO.");
      return (await res.json()) as unknown as Resumo;
    },
  });
}

export function usePaginas() {
  return useQuery({
    queryKey: [...SEO_KEY, "paginas"],
    queryFn: async () => {
      const res = await api.admin.seo.paginas.$get({ query: {} });
      if (!res.ok) throw new Error("Não foi possível carregar a lista de páginas.");
      return ((await res.json()) as unknown as { pages: PageRow[] }).pages;
    },
  });
}

/** "Auditar agora": chama a auditoria até ela fechar (cada chamada trabalha dentro do limite de tempo da função). */
export function useAudit() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<{ audited: number; total: number } | null>(null);
  const m = useMutation({
    mutationFn: async () => {
      for (let i = 0; i < 30; i++) {
        const res = await api.admin.seo.auditar.$post({ json: {} });
        const body = (await res.json()) as { error?: string; status?: string; audited?: number; total?: number };
        if (!res.ok) throw new Error(body.error ?? "Não foi possível auditar agora.");
        setProgress({ audited: body.audited ?? 0, total: body.total ?? 0 });
        if (body.status === "completa") return;
      }
      throw new Error("A auditoria está demorando mais que o normal. Confira daqui a pouco.");
    },
    onSettled: () => {
      setProgress(null);
      qc.invalidateQueries({ queryKey: SEO_KEY });
    },
  });
  return { run: () => m.mutate(), busy: m.isPending, progress, error: m.isError ? m.error.message : null };
}

export type PaginaDetail = {
  page: Omit<PageRow, "seoScore" | "audited"> & { overrides: PageOverrides };
  checks: Check[];
  facts: PageFacts | null;
  visits30d: number;
};

export function usePagina(path: string) {
  return useQuery({
    queryKey: [...SEO_KEY, "pagina", path],
    queryFn: async () => {
      const res = await api.admin.seo.pagina.$get({ query: { path } });
      if (!res.ok) throw new Error(res.status === 404 ? "Esta página não existe mais no site." : "Não foi possível carregar a página.");
      return (await res.json()) as unknown as PaginaDetail;
    },
  });
}

/** Regras da nota editadas no painel (com o padrão ao lado, para "voltar ao padrão"). */
export function useRegras() {
  return useQuery({
    queryKey: [...SEO_KEY, "regras"],
    queryFn: async () => {
      const res = await api.admin.seo.regras.$get();
      if (!res.ok) throw new Error("Não foi possível carregar as regras.");
      return (await res.json()) as unknown as { rules: SeoRules; defaults: SeoRules };
    },
  });
}

/** Salva as regras de SEO de uma página (esconder do Google, canonical, imagem...). O site republica sozinho. */
export function useSavePagina(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: Record<string, unknown>) => {
      const res = await api.admin.seo.pagina.$put({ json: { path, doc } });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Não foi possível salvar.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SEO_KEY }),
  });
}

/** Audita só esta página e atualiza a nota dela. */
export function useAuditPage(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.admin.seo.auditar.$post({ json: { path } });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Não foi possível auditar agora.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SEO_KEY }),
  });
}

/** Salva as regras da nota (o servidor recusa pesos que não somam 100). */
export function useSaveRegras() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rules: SeoRules) => {
      const res = await api.admin.seo.regras.$put({ json: rules });
      const body = (await res.json()) as { error?: string; errors?: string[] };
      if (!res.ok) throw new Error(body.errors?.join(" ") ?? body.error ?? "Não foi possível salvar.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SEO_KEY }),
  });
}

/** Volta as regras ao padrão; devolve as regras padrão. */
export function useResetRegras() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.admin.seo.regras.$delete();
      if (!res.ok) throw new Error("Não foi possível voltar ao padrão.");
      return ((await res.json()) as unknown as { rules: SeoRules }).rules;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SEO_KEY }),
  });
}

export type LinkResultRow = { url: string; status: number; chain: string[]; broken: boolean; foundOn: string[] };
export type LinkReportRow = { at: string; checked: number; truncated: boolean; broken: LinkResultRow[]; redirected: LinkResultRow[] };
export type OldUrlRow = { path: string; status: number; finalPath: string | null; needsRedirect: boolean; suggested: string | null };
export type OldTest = { valid: string[]; rejected: { raw: string; reason: string }[]; results: OldUrlRow[]; truncated: boolean };
export type CreateResult = { created: number; skipped: { from: string; reason: string }[] };

export function useLinks() {
  return useQuery({
    queryKey: [...SEO_KEY, "links"],
    queryFn: async () => {
      const res = await api.admin.seo.links.$get();
      if (!res.ok) throw new Error("Não foi possível carregar o último relatório.");
      return ((await res.json()) as unknown as { report: LinkReportRow | null }).report;
    },
  });
}

export function useVerifyLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.admin.seo.links.verificar.$post({ json: {} });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Não foi possível verificar agora.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SEO_KEY, "links"] }),
  });
}

export function useTestOld() {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await api.admin.seo.importar.testar.$post({ json: { text } });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Não foi possível testar a lista.");
      return (await res.json()) as unknown as OldTest;
    },
  });
}

export function useCreateRedirects() {
  return useMutation({
    mutationFn: async (items: { from: string; to: string }[]) => {
      const res = await api.admin.seo.importar.criar.$post({ json: { items } });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Não foi possível criar os redirecionamentos.");
      return (await res.json()) as unknown as CreateResult;
    },
  });
}

export type ImageIssueRow = { src: string; page: string; product?: string; problems: ("sem-alt" | "nome-numerico" | "pesada")[]; bytes?: number };
export type SchemaFindingRow = { type: string; level: "ok" | "faltando" | "erro"; message: string };

export function useImagens() {
  return useQuery({
    queryKey: [...SEO_KEY, "imagens"],
    queryFn: async () => {
      const res = await api.admin.seo.imagens.$get();
      if (!res.ok) throw new Error("Não foi possível carregar as imagens.");
      return ((await res.json()) as unknown as { issues: ImageIssueRow[] }).issues;
    },
  });
}

export function useSaveAlt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { slug: string; src: string; alt: string }) => {
      const res = await api.admin.seo["imagem-alt"].$put({ json: v });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Não foi possível salvar.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SEO_KEY, "imagens"] }),
  });
}

export function useEstruturados() {
  return useQuery({
    queryKey: [...SEO_KEY, "estruturados"],
    queryFn: async () => {
      const res = await api.admin.seo.estruturados.$get();
      if (!res.ok) throw new Error("Não foi possível carregar os dados estruturados.");
      return ((await res.json()) as unknown as { pages: { path: string; label: string; findings: SchemaFindingRow[] }[] }).pages;
    },
  });
}

export type TipRow = { id: string; title: string; body: string; tab: SeoGeoTab; kind: "biblioteca" | "dado" };

export function useDicas() {
  return useQuery({
    queryKey: [...SEO_KEY, "dicas"],
    queryFn: async () => {
      const res = await api.admin.seo.dicas.$get();
      if (!res.ok) throw new Error("Não foi possível carregar as dicas.");
      return (await res.json()) as unknown as { date: string; tips: TipRow[] };
    },
  });
}

export type DuelResultRow = import("../../../api/lib/seo/run-duel").DuelResult;
export type Competitor = { id: number; name: string; url: string };

export function useConcorrentes() {
  return useQuery({
    queryKey: [...SEO_KEY, "concorrentes"],
    refetchInterval: (q) => (q.state.data?.running ? 5000 : false),
    queryFn: async () => {
      const res = await api.admin.seo.concorrentes.$get();
      if (!res.ok) throw new Error("Não foi possível carregar o duelo.");
      return (await res.json()) as unknown as { competitors: Competitor[]; latest: DuelResultRow | null; running: { done: number; total: number } | null };
    },
  });
}

export function useSaveConcorrentes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { name: string; url: string }[]) => {
      const res = await api.admin.seo.concorrentes.$put({ json: { items } });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Não foi possível salvar.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [...SEO_KEY, "concorrentes"] }),
  });
}

/** "Duelar agora": chama o duelo até ele fechar (cada chamada trabalha dentro do limite de tempo da função). */
export function useDuelar() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const m = useMutation({
    mutationFn: async () => {
      for (let i = 0; i < 40; i++) {
        const res = await api.admin.seo.duelar.$post({ json: {} });
        const body = (await res.json()) as { error?: string; status?: string; done?: number; total?: number };
        if (!res.ok) throw new Error(body.error ?? "Não foi possível rodar o duelo agora.");
        setProgress({ done: body.done ?? 0, total: body.total ?? 0 });
        if (body.status === "completa") return;
      }
      throw new Error("O duelo está demorando mais que o normal. Confira daqui a pouco.");
    },
    onSettled: () => {
      setProgress(null);
      qc.invalidateQueries({ queryKey: [...SEO_KEY, "concorrentes"] });
    },
  });
  return { run: () => m.mutate(), busy: m.isPending, progress, error: m.isError ? m.error.message : null };
}
