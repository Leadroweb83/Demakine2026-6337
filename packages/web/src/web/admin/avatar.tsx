import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  image,
  size = 36,
  className,
}: {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={style}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-white", className)}
      />
    );
  }
  return (
    <span
      style={style}
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-dm-blue-soft font-bold uppercase text-dm-blue",
        className,
      )}
    >
      {name.trim().slice(0, 1)}
    </span>
  );
}

/** Recorta o centro em quadrado e reduz para 256 px em WebP antes de enviar. */
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("Não foi possível processar a foto");
  return blob;
}

/** Foto de perfil com trocar e remover. Sem userId, age sobre a própria conta. */
export function AvatarEditor({
  name,
  image,
  userId,
  compact = false,
}: {
  name: string;
  image?: string | null;
  userId?: string;
  compact?: boolean;
}) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-me"] });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  async function upload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }
    setBusy(true);
    try {
      const blob = await toSquareWebp(file);
      const pre = await api.admin.avatar.presign.$post({
        json: { contentType: "image/webp", size: blob.size, userId },
      });
      if (!pre.ok) throw new Error(((await pre.json()) as { error?: string }).error ?? "Falha ao preparar o envio");
      const { url, key } = (await pre.json()) as { url: string; key: string };
      const put = await fetch(url, { method: "PUT", body: blob, headers: { "Content-Type": "image/webp" } });
      if (!put.ok) throw new Error("Falha ao enviar a foto");
      const save = await api.admin.avatar.$post({ json: { key, userId } });
      if (!save.ok) throw new Error("Falha ao salvar a foto");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await api.admin.avatar.$post({ json: { key: null, userId } });
    setBusy(false);
    if (!res.ok) setError("Falha ao remover a foto");
    else refresh();
  }

  return (
    <div className={cn("flex items-center", compact ? "gap-2" : "gap-4")}>
      <UserAvatar name={name} image={image} size={compact ? 34 : 64} />
      <div className={cn("flex flex-wrap items-center", compact ? "gap-1" : "gap-2")}>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label={`Escolher foto de ${name}`}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          title={image ? "Trocar foto" : "Adicionar foto"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-black/10 font-bold uppercase tracking-wide text-dm-ink transition-colors hover:bg-black/[0.04] disabled:opacity-60",
            compact ? "p-2" : "px-3.5 py-1.5 text-[11.5px]",
          )}
        >
          <Camera className="h-3.5 w-3.5" />
          {compact ? <span className="sr-only">{image ? "Trocar foto" : "Adicionar foto"}</span> : busy ? "Enviando..." : image ? "Trocar foto" : "Adicionar foto"}
        </button>
        {image && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            title="Remover foto"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide text-dm-ink/55 transition-colors hover:bg-dm-red/10 hover:text-dm-red disabled:opacity-60",
              compact ? "p-2" : "px-3 py-1.5 text-[11.5px]",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {compact ? <span className="sr-only">Remover foto</span> : "Remover"}
          </button>
        )}
        {error && <p className="w-full text-[12px] font-semibold text-dm-red">{error}</p>}
      </div>
    </div>
  );
}
