import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

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
}: LeadFormProps) {
  const dark = variant === "dark";
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      const res = await api.leads.$post({
        json: { ...form, product, source },
      });
      if (!res.ok) throw new Error("fail");
      return res.json();
    },
    onError: () => setError("Não foi possível enviar. Tente pelo WhatsApp."),
    onSuccess: () => onSuccess?.(),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
        <p className={cn("mt-2 text-[15px]", dark ? "text-white/65" : "text-dm-gray")}>
          Um especialista da Demakine entra em contato em até 1 dia útil. Quer agilizar? Fale agora no
          WhatsApp.
        </p>
        <a
          href={waLink(
            product
              ? `Olá! Acabei de pedir orçamento no site sobre: ${product}.`
              : "Olá! Acabei de enviar um pedido de orçamento pelo site da Demakine.",
          )}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
        >
          Falar no WhatsApp
        </a>
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
          <input
            value={form.city}
            onChange={set("city")}
            placeholder="Cidade / UF"
            aria-label="Cidade"
            className={cn(
              inputBase,
              dark
                ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/45"
                : "border-dm-line bg-white text-dm-ink placeholder:text-dm-gray/70 focus:border-dm-blue",
            )}
          />
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
              ? `Conte o que precisa (material transportado, comprimento, altura, capacidade) — ${product}`
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

      {error && <p className="mt-3 text-sm font-medium text-dm-red">{error}</p>}

      <button
        type="submit"
        disabled={send.isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-dm-red px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017] disabled:opacity-60"
      >
        {send.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {send.isPending ? "Enviando..." : buttonLabel}
      </button>

      <p className={cn("mt-3 text-center text-[12.5px]", dark ? "text-white/40" : "text-dm-gray/80")}>
        Resposta em até 1 dia útil. Seus dados não são compartilhados.
      </p>
    </form>
  );
}
