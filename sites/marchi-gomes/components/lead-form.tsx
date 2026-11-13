"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaOptions, leadSchema, type Lead } from "@/lib/lead";
import { whatsappHref } from "@/lib/site";
import { Arrow } from "./icons";
import CalendarTwo from "./ui/calendar-02";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

type Status = "idle" | "sent" | "error";

export function LeadForm({ defaultArea }: { defaultArea?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [day, setDay] = useState<Date>();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "", phone: "", email: "", message: "", company: "", preferredDate: "",
      area: (areaOptions as readonly string[]).includes(defaultArea ?? "") ? (defaultArea as Lead["area"]) : undefined,
    },
  });

  async function onSubmit(form: Lead) {
    let attribution: Record<string, string> = {};
    try { attribution = JSON.parse(sessionStorage.getItem("mg-attr") ?? "{}"); } catch {}
    const data = { ...form, attribution };
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (res?.ok) {
      setStatus("sent");
      // Evento de conversao para GTM/GA4
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: "generate_lead", area: data.area });
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="border hairline p-8">
        <p className="display text-4xl text-copper-hi">Mensagem recebida.</p>
        <p className="mt-4 text-bone/80">Nossa equipe retorna o seu contato em horário comercial.</p>
      </div>
    );
  }

  const err = (k: keyof Lead) =>
    errors[k] ? <p className="mt-1 text-sm text-[#f0a48f]">{String(errors[k]?.message)}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 sm:grid-cols-2">
      <label className="block">
        <span className="eyebrow">Nome</span>
        <input className="field" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        {err("name")}
      </label>
      <label className="block">
        <span className="eyebrow">WhatsApp</span>
        <input className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" aria-invalid={!!errors.phone} {...register("phone")} />
        {err("phone")}
      </label>
      <label className="block">
        <span className="eyebrow">E-mail (opcional)</span>
        <input className="field" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        {err("email")}
      </label>
      <label className="block">
        <span className="eyebrow">Assunto</span>
        <select className="field" defaultValue="" aria-invalid={!!errors.area} {...register("area")}>
          <option value="" disabled>Selecione</option>
          {areaOptions.map((a) => <option key={a}>{a}</option>)}
        </select>
        {err("area")}
      </label>
      <label className="block sm:col-span-2">
        <span className="eyebrow">Conte, em poucas linhas, o que você precisa</span>
        <textarea className="field resize-none" rows={3} {...register("message")} />
        {err("message")}
      </label>
      <details className="sm:col-span-2">
        <summary className="eyebrow flex items-center justify-between border-b hairline py-3">
          <span>
            Melhor dia para o retorno (opcional)
            {day && <span className="ml-3 normal-case tracking-normal text-bone">{day.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</span>}
          </span>
          <span className="faq-plus text-xl text-copper transition-transform duration-300" aria-hidden="true">+</span>
        </summary>
        <div className="mt-5 flex flex-wrap items-start gap-6">
          <CalendarTwo
            value={day}
            onChange={(d) => { setDay(d); setValue("preferredDate", d ? iso(d) : ""); }}
          />
          <p className="max-w-[16rem] text-sm text-mist">
            Escolha um dia útil. O horário é confirmado pela equipe no primeiro contato.
          </p>
        </div>
      </details>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("company")} />
      <label className="flex items-start gap-3 text-sm text-bone/70 sm:col-span-2">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[#c9a078]" {...register("consent")} />
        <span>
          Autorizo o uso destes dados para que o escritório retorne o meu contato.
          {err("consent")}
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-60" data-magnetic>
          {isSubmitting ? "Enviando" : "Enviar mensagem"} <Arrow />
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-[#f0a48f]">
            Não foi possível enviar agora. <a className="underline" href={whatsappHref()}>Fale pelo WhatsApp</a>.
          </p>
        )}
      </div>
    </form>
  );
}
