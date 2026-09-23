import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export type UploadedPhoto = {
  /** key no storage, é isso que vai junto do lead */
  key: string;
  /** preview local (object URL), só para exibir no formulário */
  preview: string;
  name: string;
};

const MAX_FILES = 3;
const MAX_SIZE = 10 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/**
 * Upload de foto da peça direto para o storage (presigned PUT).
 * O arquivo não passa pelo servidor: a API só assina a URL.
 */
export function PhotoUpload({
  value,
  onChange,
  dark = false,
  label = "Foto da peça ou da máquina",
  hint = "Até 3 fotos, 10MB cada. JPG, PNG, WEBP ou HEIC.",
}: {
  value: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  dark?: boolean;
  label?: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setError(null);

    const room = MAX_FILES - value.length;
    if (room <= 0) {
      setError(`Máximo de ${MAX_FILES} fotos.`);
      return;
    }

    const list = Array.from(files).slice(0, room);
    setBusy(true);
    const done: UploadedPhoto[] = [];

    try {
      for (const file of list) {
        if (!OK_TYPES.includes(file.type)) {
          setError("Envie apenas imagem (JPG, PNG, WEBP ou HEIC).");
          continue;
        }
        if (file.size > MAX_SIZE) {
          setError("Cada foto pode ter no máximo 10MB.");
          continue;
        }

        const res = await api.upload.presign.$post({
          json: { filename: file.name, contentType: file.type, size: file.size },
        });
        if (!res.ok) {
          setError("Não foi possível preparar o envio da foto.");
          continue;
        }
        const data = (await res.json()) as { url: string; key: string };

        const put = await fetch(data.url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!put.ok) {
          setError("Falha ao enviar a foto. Tente novamente.");
          continue;
        }

        done.push({ key: data.key, preview: URL.createObjectURL(file), name: file.name });
      }

      if (done.length) onChange([...value, ...done]);
    } catch {
      setError("Falha ao enviar a foto. Tente novamente.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = (key: string) => onChange(value.filter((p) => p.key !== key));

  return (
    <div>
      <p className={cn("text-[13.5px] font-bold", dark ? "text-white/80" : "text-dm-ink")}>
        {label}
      </p>
      <p className={cn("mt-1 text-[12.5px]", dark ? "text-white/45" : "text-dm-gray")}>{hint}</p>

      <div className="mt-3 flex flex-wrap gap-3">
        {value.map((p) => (
          <div
            key={p.key}
            className={cn(
              "relative h-20 w-20 overflow-hidden rounded-xl border",
              dark ? "border-white/15" : "border-dm-line",
            )}
          >
            <img src={p.preview} alt={p.name} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p.key)}
              aria-label={`Remover ${p.name}`}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-dm-ink/80 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {value.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className={cn(
              "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-60",
              dark
                ? "border-white/25 text-white/60 hover:border-white/50 hover:text-white"
                : "border-dm-line text-dm-gray hover:border-dm-blue hover:text-dm-blue",
            )}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Foto
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={(e) => pick(e.target.files)}
        className="hidden"
      />

      {error && <p className="mt-2 text-[13px] font-medium text-dm-red">{error}</p>}
      {!error && value.length > 0 && (
        <p className={cn("mt-2 text-[12.5px]", dark ? "text-white/45" : "text-dm-gray")}>
          {value.length} foto{value.length > 1 ? "s" : ""} anexada
          {value.length > 1 ? "s" : ""} ao pedido.
        </p>
      )}
    </div>
  );
}
