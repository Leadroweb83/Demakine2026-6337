import { useRef, useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { track } from "@/lib/tracking";
import { Check, FileText, Loader2, Paperclip, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_SIZE = 5 * 1024 * 1024;
const input =
  "w-full rounded-xl border border-dm-line bg-white px-4 py-3 text-[15px] text-dm-ink outline-none transition-colors placeholder:text-dm-gray/70 focus:border-dm-blue";

type Resume = { key: string; name: string };

/**
 * Candidatura a uma vaga (jobSlug) ou ao banco de talentos (sem jobSlug).
 * O PDF sobe direto para o storage privado; quem não tem currículo em PDF
 * conta a experiência no campo de mensagem, que passa a ser obrigatório.
 */
export function ApplicationForm({ jobSlug, jobTitle }: { jobSlug?: string; jobTitle?: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    linkedin: "",
    salaryExpectation: "",
    message: "",
    website: "",
  });
  const [consent, setConsent] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const upload = async (f: File) => {
    setError(null);
    if (f.type !== "application/pdf") return setError("O currículo precisa estar em PDF.");
    if (f.size > MAX_SIZE) return setError("O PDF pode ter no máximo 5 MB.");
    setUploading(true);
    try {
      const res = await api.vagas.curriculo.$post({ json: { contentType: f.type, size: f.size } });
      if (!res.ok) throw new Error();
      const { url, key } = (await res.json()) as { url: string; key: string };
      const put = await fetch(url, { method: "PUT", body: f, headers: { "Content-Type": "application/pdf" } });
      if (!put.ok) throw new Error();
      setResume({ key, name: f.name });
    } catch {
      setError("Não foi possível enviar o PDF. Tente de novo.");
    } finally {
      setUploading(false);
      if (file.current) file.current.value = "";
    }
  };

  const send = useMutation({
    mutationFn: async () => {
      const res = await api.vagas.candidatura.$post({
        json: { ...form, jobSlug: jobSlug ?? null, resumeKey: resume?.key ?? null, consent },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Não foi possível enviar. Tente de novo.");
      }
    },
    onSuccess: () => track("job_application", { job: jobSlug ?? "banco-de-talentos" }),
    onError: (e) => setError(e.message),
  });

  if (send.isSuccess) {
    return (
      <div className="rounded-2xl border border-dm-line bg-white p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dm-green text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="h3 mt-4">Candidatura recebida</h3>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-dm-gray">
          {jobTitle
            ? `Obrigado pelo interesse na vaga de ${jobTitle}. Nosso RH analisa todos os currículos e entra em contato por telefone ou e-mail.`
            : "Seu currículo entrou no nosso banco de talentos. Quando abrir uma vaga no seu perfil, o RH entra em contato."}
        </p>
      </div>
    );
  }

  const needsMessage = !resume;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!consent) return setError("Marque a autorização de uso dos dados para enviar.");
        if (needsMessage && form.message.trim().length < 20) {
          return setError("Anexe o currículo em PDF ou conte um pouco da sua experiência.");
        }
        send.mutate();
      }}
      className="rounded-2xl border border-dm-line bg-white p-6 shadow-sm md:p-8"
    >
      <h3 className="h3">{jobTitle ? "Candidate-se" : "Cadastre seu currículo"}</h3>
      <p className="mt-2 text-[14.5px] text-dm-gray">
        {jobTitle ? `Vaga: ${jobTitle}` : "Para vagas futuras em qualquer área."}
      </p>

      <div className="mt-6 grid gap-3">
        <input required value={form.name} onChange={set("name")} placeholder="Nome completo*" aria-label="Nome completo" autoComplete="name" className={input} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={form.phone} onChange={set("phone")} placeholder="WhatsApp com DDD*" aria-label="WhatsApp" inputMode="tel" autoComplete="tel" className={input} />
          <input required type="email" value={form.email} onChange={set("email")} placeholder="E-mail*" aria-label="E-mail" autoComplete="email" className={input} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={form.city} onChange={set("city")} placeholder="Cidade / UF*" aria-label="Cidade" className={input} />
          <input value={form.salaryExpectation} onChange={set("salaryExpectation")} placeholder="Pretensão salarial" aria-label="Pretensão salarial" className={input} />
        </div>
        <input value={form.linkedin} onChange={set("linkedin")} placeholder="LinkedIn (opcional)" aria-label="LinkedIn" className={input} />

        {/* currículo */}
        <div className="rounded-xl border border-dashed border-dm-line p-4">
          {resume ? (
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dm-blue-soft text-dm-blue">
                <FileText className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-dm-ink">{resume.name}</span>
              <button
                type="button"
                onClick={() => setResume(null)}
                className="rounded-lg p-2 text-dm-gray hover:bg-black/[0.04] hover:text-dm-ink"
                aria-label="Remover currículo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => file.current?.click()}
              disabled={uploading}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dm-blue-soft text-dm-blue">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
              </span>
              <span>
                <span className="block text-[14px] font-bold text-dm-ink">
                  {uploading ? "Enviando o PDF..." : "Anexar currículo em PDF"}
                </span>
                <span className="block text-[12.5px] text-dm-gray">Até 5 MB. Não tem? Conte sua experiência abaixo.</span>
              </span>
            </button>
          )}
          <input
            ref={file}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </div>

        <textarea
          value={form.message}
          onChange={set("message")}
          rows={4}
          placeholder={
            needsMessage
              ? "Conte sua experiência: onde trabalhou, função e por quanto tempo*"
              : "Quer contar algo a mais? (opcional)"
          }
          aria-label="Experiência"
          className={cn(input, "resize-y")}
        />

        {/* campo armadilha para robô, fora da tela */}
        <input
          value={form.website}
          onChange={set("website")}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <label className="flex items-start gap-3 text-[13px] leading-relaxed text-dm-gray">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-dm-blue"
          />
          <span>
            Autorizo a Demakine a usar meus dados e meu currículo neste processo seletivo e em vagas
            futuras, conforme a{" "}
            <Link href="/politica-de-privacidade" className="font-semibold text-dm-blue underline">
              política de privacidade
            </Link>
            . Posso pedir a exclusão a qualquer momento.
          </span>
        </label>

        {error && (
          <p role="alert" className="text-[13.5px] font-semibold text-dm-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={send.isPending || uploading}
          className="mt-1 rounded-full bg-dm-blue px-6 py-4 text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#0d3480] disabled:opacity-60"
        >
          {send.isPending ? "Enviando..." : jobTitle ? "Enviar candidatura" : "Cadastrar currículo"}
        </button>
      </div>
    </form>
  );
}
