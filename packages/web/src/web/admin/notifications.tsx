import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Send } from "lucide-react";
import { api } from "../lib/api";
import { Btn, Card, Field, PageTitle, inputCls } from "./ui";

type Settings = { leadEmails: string[]; applicationEmails: string[]; reportEmails: string[]; dailyFollowUps: boolean };

const toText = (list: string[]) => list.join("\n");
const toList = (t: string) => t.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean);

export function AdminNotifications() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-avisos"],
    queryFn: async () => {
      const res = await api.admin.avisos.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()) as { settings: Settings; configured: boolean };
    },
  });
  const [form, setForm] = useState<{ lead: string; app: string; report: string; daily: boolean } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (q.data && !form) {
      const s = q.data.settings;
      setForm({ lead: toText(s.leadEmails), app: toText(s.applicationEmails), report: toText(s.reportEmails), daily: s.dailyFollowUps });
    }
  }, [q.data, form]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await api.admin.avisos.$put({
        json: {
          leadEmails: toList(form!.lead),
          applicationEmails: toList(form!.app),
          reportEmails: toList(form!.report),
          dailyFollowUps: form!.daily,
        },
      });
      if (!res.ok) throw new Error("Não foi possível salvar");
      return (await res.json()).settings as Settings;
    },
    onSuccess: (s) => {
      setForm({ lead: toText(s.leadEmails), app: toText(s.applicationEmails), report: toText(s.reportEmails), daily: s.dailyFollowUps });
      setMsg({ ok: true, text: "Salvo." });
      qc.invalidateQueries({ queryKey: ["admin-avisos"] });
    },
    onError: (e) => setMsg({ ok: false, text: e.message }),
  });

  const test = useMutation({
    mutationFn: async () => {
      const res = await api.admin.avisos.teste.$post();
      const body = (await res.json()) as { sent: boolean; reason?: string };
      if (!body.sent) throw new Error(body.reason ?? "Não enviou");
    },
    onSuccess: () => setMsg({ ok: true, text: "E-mail de teste enviado para você. Confira a caixa de entrada e o spam." }),
    onError: (e) => setMsg({ ok: false, text: `Teste não enviado: ${e.message}` }),
  });

  if (!form) return <PageTitle title="Avisos por e-mail" hint="Carregando..." />;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        save.mutate();
      }}
    >
      <PageTitle
        title="Avisos por e-mail"
        hint="Quem recebe cada aviso automático. Um e-mail por linha. Deixe vazio para não enviar aquele aviso."
      />

      <Card className={q.data?.configured ? "border-dm-green/20" : "border-dm-red/20"}>
        <div className="flex flex-wrap items-center gap-3">
          {q.data?.configured ? (
            <CheckCircle2 className="h-5 w-5 text-dm-green" />
          ) : (
            <CircleAlert className="h-5 w-5 text-dm-red" />
          )}
          <p className="flex-1 text-[13.5px] text-dm-ink/75">
            {q.data?.configured
              ? "Serviço de envio configurado. Os avisos saem normalmente."
              : "O serviço de envio ainda não foi configurado: as listas ficam salvas, mas nenhum e-mail sai até a chave do Resend ser cadastrada na Vercel."}
          </p>
          <Btn tone="ghost" disabled={test.isPending || !q.data?.configured} onClick={() => test.mutate()}>
            <span className="inline-flex items-center gap-1.5">
              <Send className="h-4 w-4" /> Enviar teste para mim
            </span>
          </Btn>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <Field label="Lead novo" hint="Recebem cada pedido de orçamento, na hora">
            <textarea rows={5} value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} placeholder="vendas@demakine.com.br" className={inputCls} />
          </Field>
        </Card>
        <Card>
          <Field label="Candidatura nova" hint="Recebem cada currículo das vagas, na hora">
            <textarea rows={5} value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value })} placeholder="rh@demakine.com.br" className={inputCls} />
          </Field>
        </Card>
        <Card>
          <Field label="Relatório mensal" hint="Recebem no dia 1º o resumo do mês anterior, com os valores da empresa">
            <textarea rows={5} value={form.report} onChange={(e) => setForm({ ...form, report: e.target.value })} className={inputCls} />
          </Field>
        </Card>
      </div>

      <Card>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.daily}
            onChange={(e) => setForm({ ...form, daily: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-dm-blue"
          />
          <span>
            <span className="block text-[14px] font-bold text-dm-ink">Retornos do dia às 8h</span>
            <span className="block text-[13px] text-dm-ink/60">
              Cada responsável recebe no próprio e-mail de login os retornos agendados para o dia e os atrasados. Só os
              dele.
            </span>
          </span>
        </label>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Btn type="submit" disabled={save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar"}
        </Btn>
        {msg && <span className={`text-[13px] font-semibold ${msg.ok ? "text-dm-green" : "text-dm-red"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
