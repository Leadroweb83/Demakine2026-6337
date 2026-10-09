import { useState, type ReactNode } from "react";
import { ABROAD, UFS, cityWithUf, withoutUf } from "@/lib/uf";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { track } from "@/lib/tracking";
import { visitAttribution } from "@/lib/visits";
import { Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { PhotoUpload, type UploadedPhoto } from "@/components/photo-upload";
import { cn } from "@/lib/utils";
import { tr } from "@/lib/i18n";

type LeadFormProps = {
  source?: string;
  product?: string;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  variant?: "light" | "dark";
  /** Chamado depois do lead salvo (usado no gate de downloads). */
  onSuccess?: () => void;
  /** Conteúdo extra dentro do painel de sucesso (ex: links liberados). */
  successExtra?: ReactNode;
  /** Texto alternativo do painel de sucesso. */
  successTitle?: string;
  /**
   * Depois de enviar, abre a página de obrigado (/obrigado), que é a conversão medida no GTM e no
   * Google Ads. Padrão: sim, menos quando o painel de sucesso tem conteúdo próprio (links liberados).
   */
  thankYouPage?: boolean;
  /** Habilita o anexo de foto da peca/maquina (ate 3 imagens). */
  photos?: boolean;
  /** Rotulo do bloco de foto, quando habilitado. */
  photoLabel?: string;
  /** Ajuda do bloco de foto, quando habilitado. */
  photoHint?: string;
};

const inputBase =
  "w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors";

export function LeadForm({
  source = "site",
  product,
  compact = false,
  title,
  subtitle,
  buttonLabel = "Solicitar orçamento",
  variant = "light",
  onSuccess,
  successExtra,
  successTitle,
  thankYouPage,
  photos = false,
  photoLabel,
  photoHint,
}: LeadFormProps) {
  const dark = variant === "dark";
  const [, navigate] = useLocation();
  const goToThanks = thankYouPage ?? !successExtra;
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    uf: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [shots, setShots] = useState<UploadedPhoto[]>([]);

  const send = useMutation({
    mutationFn: async () => {
      const res = await api.leads.$post({
        json: { ...withoutUf(form), city: cityWithUf(form.city, form.uf), product, source, attachments: shots.map((s) => s.key), traffic: visitAttribution() },
      });
      if (!res.ok) throw new Error("fail");
      return res.json();
    },
    onError: () => setError("Não foi possível enviar. Tente pelo WhatsApp."),
    onSuccess: () => {
      track("generate_lead", { form_source: source, product: product ?? null });
      onSuccess?.();
      if (goToThanks) navigate(`/obrigado?origem=${encodeURIComponent(source)}`);
    },
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (send.isSuccess) {
    return (
      <div
        className={cn(
          "rounded-2xl border p-8 text-center",
          dark ? "border-white/15 bg-white/5" : "border-dm-line bg-white",
        )}
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dm-blue text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className={cn("h3 mt-4", dark && "text-white")}>
          {successTitle ?? "Recebemos seu pedido"}
        </h3>
        {/* sem botão de WhatsApp aqui: a ideia é o cliente aguardar o contato do vendedor */}
        <p className={cn("mt-2 text-[15px]", dark ? "text-white/65" : "text-dm-gray")}>
          Um especialista da Demakine entra em contato em até 1 dia útil.
        </p>
        {successExtra && <div className="mt-6">{successExtra}</div>}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!form.name.trim() || !form.phone.trim()) {
          setError("Preencha nome e telefone.");
          return;
        }
        send.mutate();
      }}
      className={cn(
        "rounded-2xl border p-6 md:p-8",
        dark ? "border-white/12 bg-white/[0.04]" : "border-dm-line bg-white shadow-sm",
      )}
    >
      {title && <h3 className={cn("h3", dark && "text-white")}>{title}</h3>}
      {subtitle && (
        <p className={cn("mt-2 text-[15px]", dark ? "text-white/60" : "text-dm-gray")}>{subtitle}</p>
      )}

      <div className={cn("grid gap-3", title || subtitle ? "mt-6" : "")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Seu nome*"
            aria-label="Seu nome"
            className={cn(
              inputBase,
              dark
                ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/45"
                : "border-dm-line bg-white text-dm-ink placeholder:text-dm-gray/70 focus:border-dm-blue",
            )}
          />
          <input
            required
            value={form.phone}
            onChange={set("phone")}
            placeholder="WhatsApp / telefone*"
            aria-label="Telefone"
            inputMode="tel"
            className={cn(
              inputBase,
              dark
                ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/45"
                : "border-dm-line bg-white text-dm-ink placeholder:text-dm-gray/70 focus:border-dm-blue",
            )}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.company}
            onChange={set("company")}
            placeholder="Empresa"
            aria-label="Empresa"
            className={cn(
              inputBase,
              dark
                ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/45"
                : "border-dm-line bg-white text-dm-ink placeholder:text-dm-gray/70 focus:border-dm-blue",
            )}
          />
          <div className="grid grid-cols-[1fr_6.5rem] gap-3">
            <input
              value={form.city}
              onChange={set("city")}
              placeholder="Cidade"
              aria-label="Cidade"
              autoComplete="address-level2"
              className={cn(
                inputBase,
                dark
                  ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/45"
                  : "border-dm-line bg-white text-dm-ink placeholder:text-dm-gray/70 focus:border-dm-blue",
              )}
            />
            <select
              value={form.uf}
              onChange={set("uf")}
              aria-label="Estado"
              autoComplete="address-level1"
              className={cn(
                inputBase,
                "px-3",
                dark
                  ? "border-white/15 bg-white/5 focus:border-white/45 [&>option]:text-dm-ink"
                  : "border-dm-line bg-white focus:border-dm-blue",
                form.uf ? (dark ? "text-white" : "text-dm-ink") : dark ? "text-white/40" : "text-dm-gray/70",
              )}
            >
              <option value="">Estado</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
              <option value={ABROAD}>Exterior</option>
            </select>
          </div>
        </div>

        {!compact && (
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="E-mail"
            aria-label="E-mail"
            className={cn(
              inputBase,
              dark
                ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/45"
                : "border-dm-line bg-white text-dm-ink placeholder:text-dm-gray/70 focus:border-dm-blue",
            )}
          />
        )}

        <textarea
          value={form.message}
          onChange={set("message")}
          rows={compact ? 2 : 4}
          placeholder={
            product
              ? tr("Conte o que precisa (material transportado, comprimento, altura, capacidade) para {produto}", { produto: tr(product) })
              : "Conte o que precisa: material transportado, comprimento, altura e capacidade"
          }
          aria-label="Mensagem"
          className={cn(
            inputBase,
            "resize-none",
            dark
              ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/45"
              : "border-dm-line bg-white text-dm-ink placeholder:text-dm-gray/70 focus:border-dm-blue",
          )}
        />
      </div>

      {photos && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-4",
            dark ? "border-white/12 bg-white/[0.03]" : "border-dm-line bg-dm-surface",
          )}
        >
          <PhotoUpload
            value={shots}
            onChange={setShots}
            dark={dark}
            {...(photoLabel ? { label: photoLabel } : {})}
            {...(photoHint ? { hint: photoHint } : {})}
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm font-medium text-dm-red">{error}</p>}

      <button
        type="submit"
        disabled={send.isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-dm-green px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_12px_30px_rgba(23,134,79,0.28)] transition-colors hover:bg-dm-green-dark disabled:opacity-60"
      >
        {send.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {send.isPending ? "Enviando..." : buttonLabel}
      </button>

      <p className={cn("mt-3 text-center text-[12.5px]", dark ? "text-white/40" : "text-dm-gray")}>
        Resposta em até 1 dia útil. Seus dados não são compartilhados.
      </p>
    </form>
  );
}
