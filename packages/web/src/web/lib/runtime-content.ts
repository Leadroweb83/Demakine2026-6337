/**
 * Conteúdo editado no painel, carregado por main.tsx antes de o app ser importado.
 * site.ts e content.ts leem daqui na primeira avaliação, então todo valor derivado
 * (listas ordenadas, destaques) já nasce com a versão editada.
 */
export type RuntimeContent = {
  docs: Record<string, Record<string, unknown>>;
  deleted: Record<string, string[]>;
  /** muda a cada edição no painel (ver api/lib/content-snapshot.ts) */
  version?: string;
};

const EMPTY: RuntimeContent = { docs: {}, deleted: {} };

export function runtimeContent(): RuntimeContent {
  const g = globalThis as { __DM_CONTENT__?: RuntimeContent | null };
  return g.__DM_CONTENT__ ?? EMPTY;
}

/** Documento editado de uma coleção, ou undefined se o padrão do código vale. */
export function editedDoc<T>(collection: string, key: string): Partial<T> | undefined {
  return runtimeContent().docs[collection]?.[key] as Partial<T> | undefined;
}

export function editedDocs<T>(collection: string): Record<string, Partial<T>> {
  return (runtimeContent().docs[collection] ?? {}) as Record<string, Partial<T>>;
}

export function deletedKeys(collection: string): string[] {
  return runtimeContent().deleted[collection] ?? [];
}

/**
 * Busca o conteúdo editado; se a API não responder a tempo, usa a cópia gravada no build da
 * página pré-renderizada (conteudo-<versão>.json) e, sem ela, o padrão do código.
 */
export async function loadRuntimeContent(timeoutMs = 2500) {
  const g = globalThis as { __DM_CONTENT__?: RuntimeContent | null };
  const get = async (url: string) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      return res.ok ? ((await res.json()) as RuntimeContent) : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
  g.__DM_CONTENT__ = await get("/api/conteudo");
  // versão usada na pré-renderização (este arquivo também entra no código do servidor, sem window)
  const built = (globalThis as { __DM_SSR__?: { version?: string } }).__DM_SSR__?.version;
  if (!g.__DM_CONTENT__ && built && built !== "padrao") g.__DM_CONTENT__ = await get(`/conteudo-${built}.json`);
}
