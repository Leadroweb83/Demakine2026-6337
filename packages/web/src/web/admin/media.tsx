import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, ImagePlus, Loader2, Search, Trash2, X } from "lucide-react";
import { api } from "../lib/api";
import type { PanelUser } from "../lib/auth";
import { cn } from "@/lib/utils";
import { Btn, PageTitle, inputCls } from "./ui";

export type MediaItem = {
  id: number;
  key: string;
  url: string;
  name: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  uploadedBy: string | null;
  uploaderName: string | null;
  createdAt: string;
};

const MAX_SIDE = 1920;
const kb = (n: number | null) => (n ? (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`) : "");

/** Reduz para no máximo 1920 px e converte para WEBP no navegador antes de enviar. */
async function optimize(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (!blob) throw new Error("Não foi possível converter a imagem");
  return { blob, width: w, height: h };
}

export function useMediaLibrary() {
  return useQuery({
    queryKey: ["admin-midia"],
    queryFn: async () => {
      const res = await api.admin.midia.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).items as unknown as MediaItem[];
    },
  });
}

/** Envio de várias imagens: otimiza, sobe direto no storage e registra na biblioteca. */
export function useMediaUpload() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]) => {
    setError(null);
    const done: MediaItem[] = [];
    setBusy(files.length);
    for (const file of files) {
      try {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name}: não é imagem`);
        const { blob, width, height } = await optimize(file);
        const pre = await api.admin.midia.presign.$post({ json: { contentType: "image/webp", size: blob.size } });
        if (!pre.ok) throw new Error(((await pre.json()) as { error?: string }).error ?? "Falha ao preparar o envio");
        const { url, key } = (await pre.json()) as { url: string; key: string };
        const put = await fetch(url, { method: "PUT", body: blob, headers: { "Content-Type": "image/webp" } });
        if (!put.ok) throw new Error(`${file.name}: falha no envio`);
        const name = file.name.replace(/\.[^.]+$/, "");
        const reg = await api.admin.midia.$post({ json: { key, name, width, height, size: blob.size } });
        if (!reg.ok) throw new Error(((await reg.json()) as { error?: string }).error ?? "Falha ao registrar");
        done.push((await reg.json()).item as unknown as MediaItem);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha no envio");
      } finally {
        setBusy((n) => n - 1);
      }
    }
    qc.invalidateQueries({ queryKey: ["admin-midia"] });
    return done;
  };

  return { upload, busy, error };
}

function UploadButton({ onDone, label = "Enviar imagens" }: { onDone?: (items: MediaItem[]) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useMediaUpload();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Btn onClick={() => input.current?.click()} disabled={busy > 0}>
        <span className="inline-flex items-center gap-1.5">
          {busy > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {busy > 0 ? `Enviando ${busy}...` : label}
        </span>
      </Btn>
      {error && <span className="text-[12.5px] font-semibold text-dm-red">{error}</span>}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onDone?.(await upload(files));
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ tela */

export function AdminMedia({ user }: { user: PanelUser }) {
  const lib = useMediaLibrary();
  const [term, setTerm] = useState("");
  const items = (lib.data ?? []).filter((m) => {
    const t = term.trim().toLowerCase();
    return !t || m.name.toLowerCase().includes(t) || (m.alt ?? "").toLowerCase().includes(t);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Mídia"
          hint="Imagens usadas no catálogo, no blog e nos cases. Cada envio é reduzido para até 1920 px e convertido para WEBP, que carrega mais rápido."
        />
        <UploadButton />
      </div>

      <label className="relative block max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dm-ink/40" />
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar por nome ou descrição" aria-label="Buscar imagem" className={cn(inputCls, "pl-10")} />
      </label>

      {lib.isPending && <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>}
      {lib.isSuccess && !lib.data.length && (
        <p className="rounded-2xl bg-white p-8 text-center text-[13.5px] text-dm-ink/55 shadow-sm">
          Nenhuma imagem ainda. As fotos atuais dos produtos continuam no site; envie aqui as novas.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map((m) => (
          <MediaCard key={m.id} item={m} canDelete={user.role !== "editor" || m.uploadedBy === user.id} />
        ))}
      </div>
    </div>
  );
}

function MediaCard({ item, canDelete }: { item: MediaItem; canDelete: boolean }) {
  const qc = useQueryClient();
  const [alt, setAlt] = useState(item.alt ?? "");
  const [copied, setCopied] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      const res = await api.admin.midia[":id"].$patch({ param: { id: String(item.id) }, json: { alt } });
      if (!res.ok) throw new Error("fail");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-midia"] }),
  });
  const remove = useMutation({
    mutationFn: async () => {
      const res = await api.admin.midia[":id"].$delete({ param: { id: String(item.id) } });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "fail");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-midia"] }),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <a href={item.url} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-dm-surface">
        <img src={item.url} alt={item.alt ?? ""} loading="lazy" className="h-full w-full object-contain" />
      </a>
      <div className="space-y-2.5 p-3.5">
        <p className="truncate text-[13px] font-bold text-dm-ink" title={item.name}>
          {item.name}
        </p>
        <p className="text-[11.5px] text-dm-ink/50">
          {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
          {kb(item.size)}
          {item.uploaderName ? ` · ${item.uploaderName.split(" ")[0]}` : ""}
        </p>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => alt !== (item.alt ?? "") && save.mutate()}
          placeholder="Descrição da imagem (para Google e acessibilidade)"
          aria-label={`Descrição de ${item.name}`}
          className={cn(inputCls, "py-2 text-[12.5px]")}
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(item.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-dm-ink/55 hover:bg-black/[0.04] hover:text-dm-ink"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-dm-green" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
          {save.isPending && <span className="text-[11px] text-dm-ink/45">salvando...</span>}
          {canDelete && (
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => confirm(`Apagar "${item.name}"? Se ela estiver em algum produto ou post, a imagem some de lá.`) && remove.mutate()}
              className="ml-auto rounded-md p-1.5 text-dm-red/70 hover:bg-dm-red/10 hover:text-dm-red"
              title="Apagar"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Apagar {item.name}</span>
            </button>
          )}
        </div>
        {remove.isError && <p className="text-[11.5px] font-semibold text-dm-red">{remove.error.message}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ seletor de imagens */

/** Janela para escolher imagens da biblioteca (ou enviar novas) de dentro de outro editor. */
export function MediaPicker({
  onPick,
  onClose,
  multiple = true,
}: {
  onPick: (urls: string[]) => void;
  onClose: () => void;
  multiple?: boolean;
}) {
  const lib = useMediaLibrary();
  const [chosen, setChosen] = useState<string[]>([]);
  const toggle = (url: string) =>
    setChosen((c) => (c.includes(url) ? c.filter((u) => u !== url) : multiple ? [...c, url] : [url]));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Escolher imagens">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-[17px] font-extrabold text-dm-ink">Escolher imagens</h2>
          <div className="flex items-center gap-2">
            <UploadButton label="Enviar novas" onDone={(items) => setChosen((c) => [...c, ...items.map((i) => i.url)])} />
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-dm-ink/50 hover:bg-black/[0.04]" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3 lg:grid-cols-5">
          {(lib.data ?? []).map((m) => {
            const on = chosen.includes(m.url);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.url)}
                aria-pressed={on}
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 bg-dm-surface text-left transition-colors",
                  on ? "border-dm-blue" : "border-transparent hover:border-dm-blue/30",
                )}
              >
                <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="aspect-square w-full object-contain" />
                <span className="block truncate px-2 py-1.5 text-[11.5px] font-semibold text-dm-ink/70">{m.name}</span>
                {on && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-dm-blue text-[11px] font-bold text-white">
                    {multiple ? chosen.indexOf(m.url) + 1 : <Check className="h-4 w-4" />}
                  </span>
                )}
              </button>
            );
          })}
          {lib.isSuccess && !lib.data.length && (
            <p className="col-span-full py-10 text-center text-[13.5px] text-dm-ink/55">Nenhuma imagem na biblioteca. Envie as primeiras.</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-black/5 px-5 py-4">
          <span className="mr-auto text-[12.5px] text-dm-ink/55">{chosen.length} selecionada(s)</span>
          <Btn tone="ghost" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn disabled={!chosen.length} onClick={() => onPick(chosen)}>
            Usar {chosen.length > 1 ? "imagens" : "imagem"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
