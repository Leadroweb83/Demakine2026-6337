import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { tr } from "@/lib/i18n";

const field =
  "w-full rounded-xl border border-dm-line bg-white px-4 py-3 text-[15px] text-dm-ink outline-none transition-colors placeholder:text-dm-gray/70 focus:border-dm-blue";

const STAR = "M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z";

/** Formulário "Deixe seu comentário": todos os campos obrigatórios; o comentário só aparece depois de aprovado no painel. */
export function ReviewForm() {
  const [form, setForm] = useState({ name: "", company: "", text: "", website: "" });
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      const res = await api.avaliacoes.$post({ json: { ...form, rating } });
      if (!res.ok) throw new Error("fail");
    },
    onError: () => setError("Não foi possível enviar agora. Tente de novo em instantes."),
  });

  const set = (key: "name" | "company" | "text" | "website") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (send.isSuccess) {
    return (
      <div className="rounded-2xl border border-dm-line bg-white p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dm-blue text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="h3 mt-4">Obrigado pelo seu comentário</h3>
        <p className="mt-2 text-[15px] text-dm-gray">
          Ele passa por uma revisão rápida da nossa equipe e aparece aqui assim que for aprovado.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!rating || [form.name, form.company, form.text].some((v) => !v.trim())) {
          setError("Preencha todos os campos e escolha uma nota.");
          return;
        }
        send.mutate();
      }}
      className="rounded-2xl border border-dm-line bg-white p-6 shadow-sm md:p-8"
    >
      <h3 className="h3">Deixe seu comentário e nos ajude a melhorar</h3>
      <p className="mt-2 text-[15px] text-dm-gray">Conte como foi sua experiência com a Demakine.</p>

      <div className="mt-6 grid gap-3">
        <fieldset>
          <legend className="mb-2 text-[13.5px] font-semibold text-dm-ink">Sua nota*</legend>
          <div className="flex gap-1" role="radiogroup" aria-label={tr("Sua nota")}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} / 5`}
                onClick={() => setRating(n)}
                className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-dm-surface"
              >
                <svg viewBox="0 0 20 20" className={cn("h-7 w-7", n <= rating ? "fill-dm-red" : "fill-dm-line")}>
                  <path d={STAR} />
                </svg>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={form.name} onChange={set("name")} maxLength={80} placeholder={tr("Seu nome*")} aria-label={tr("Seu nome")} className={field} />
          <input required value={form.company} onChange={set("company")} maxLength={80} placeholder={tr("Empresa*")} aria-label={tr("Empresa")} className={field} />
        </div>
        <textarea
          required
          minLength={10}
          maxLength={800}
          rows={4}
          value={form.text}
          onChange={set("text")}
          placeholder={tr("Seu comentário*")}
          aria-label={tr("Seu comentário")}
          className={cn(field, "resize-y")}
        />
        {/* campo-isca: invisível para pessoas, robôs costumam preencher */}
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set("website")}
          aria-hidden
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          name="website"
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[14px] font-semibold text-dm-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={send.isPending}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-dm-red px-7 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c31017] disabled:opacity-60"
      >
        {send.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar comentário
      </button>
    </form>
  );
}

type SiteReview = { id: number; name: string; company: string; rating: number; text: string };

/** Comentários enviados pelo formulário e aprovados no painel. Sem nenhum, a seção some. */
export function SiteReviews() {
  const q = useQuery({
    queryKey: ["avaliacoes"],
    queryFn: async () => {
      const res = await api.avaliacoes.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).items as unknown as SiteReview[];
    },
  });
  if (!q.data?.length) return null;
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {q.data.map((r) => (
        <figure key={r.id} className="flex h-full flex-col rounded-2xl border border-dm-line bg-white p-6">
          <div className="flex gap-0.5" role="img" aria-label={`${r.rating} / 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} viewBox="0 0 20 20" className={cn("h-4 w-4", n <= r.rating ? "fill-dm-red" : "fill-dm-line")}>
                <path d={STAR} />
              </svg>
            ))}
          </div>
          <blockquote className="mt-4 flex-1 whitespace-pre-line text-[15.5px] leading-relaxed text-dm-ink/85">“{r.text}”</blockquote>
          <figcaption className="mt-5 border-t border-dm-line pt-4">
            <span className="block text-[15px] font-bold text-dm-ink">{r.name}</span>
            <span className="block text-[13.5px] text-dm-gray">{r.company}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
