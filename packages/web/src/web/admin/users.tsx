import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ROLE_LABEL, type PanelUser } from "../lib/auth";
import { Badge, Btn, Card, Field, PageTitle, inputCls } from "./ui";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  active: boolean | null;
  mustChangePassword: boolean | null;
  createdAt: string;
};

const ROLE_OPTIONS = ["admin", "editor", "vendedor", "super_admin"] as const;

const ROLE_HELP: Record<string, string> = {
  super_admin: "Vê tudo, cria usuários e controla as chaves.",
  admin: "Vê tudo do negócio: leads, catálogo, loja, conteúdo e dados do site. Não gerencia usuários.",
  editor: "Só conteúdo: blog, cases, depoimentos e mídia. Não vê leads, preço nem configuração.",
  vendedor: "Só leads e vagas. Nenhuma área de conteúdo.",
};

export function AdminUsers({ me }: { me: PanelUser }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", role: "admin", password: "" });
  const [feedback, setFeedback] = useState<{ kind: "ok" | "erro"; text: string } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.admin.users.$get();
      if (!res.ok) throw new Error("failed");
      return (await res.json()).users as Row[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await api.admin.users.$post({
        json: {
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password || undefined,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("error" in data ? data.error : "Falha ao criar usuário");
      return data as { password: string };
    },
    onSuccess: (data) => {
      setFeedback({
        kind: "ok",
        text: `Usuário criado. Senha inicial: ${data.password} — passe para a pessoa, ela troca no primeiro acesso.`,
      });
      setForm({ name: "", email: "", role: "admin", password: "" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => setFeedback({ kind: "erro", text: err.message }),
  });

  const patch = useMutation({
    mutationFn: async (input: { id: string; role?: string; active?: boolean }) => {
      const res = await api.admin.users[":id"].$patch({
        param: { id: input.id },
        json: { role: input.role, active: input.active },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("error" in data ? data.error : "Falha ao atualizar");
      return data;
    },
    onSuccess: () => {
      setFeedback({ kind: "ok", text: "Usuário atualizado." });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => setFeedback({ kind: "erro", text: err.message }),
  });

  const resetPw = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.admin.users[":id"].password.$post({ param: { id }, json: {} });
      const data = await res.json();
      if (!res.ok) throw new Error("error" in data ? data.error : "Falha ao gerar senha");
      return data as { password: string };
    },
    onSuccess: (data) => {
      setFeedback({
        kind: "ok",
        text: `Nova senha gerada: ${data.password} — a pessoa troca no primeiro acesso.`,
      });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => setFeedback({ kind: "erro", text: err.message }),
  });

  const rows = usersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Usuários e papéis"
        hint="Só o super admin vê esta área. Cada pessoa entra com o próprio e-mail e enxerga apenas o que o papel permite."
      />

      {feedback && (
        <div
          className={`rounded-xl px-5 py-4 text-[13.5px] font-semibold ${
            feedback.kind === "ok"
              ? "bg-dm-green-soft text-dm-green-dark"
              : "bg-dm-red/10 text-dm-red"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <Card>
        <h2 className="font-display text-[15px] font-extrabold text-dm-ink">Criar usuário</h2>
        <p className="mt-1 text-[12.5px] text-dm-ink/55">
          Deixe a senha em branco para eu gerar uma forte automaticamente.
        </p>
        <form
          className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            setFeedback(null);
            create.mutate();
          }}
        >
          <Field label="Nome">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              required
            />
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
              required
            />
          </Field>
          <Field label="Papel" hint={ROLE_HELP[form.role]}>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputCls}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Senha inicial (opcional)">
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputCls}
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </Field>
          <div className="md:col-span-2 xl:col-span-4">
            <Btn type="submit" disabled={create.isPending}>
              {create.isPending ? "Criando..." : "Criar usuário"}
            </Btn>
          </div>
        </form>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {usersQuery.isLoading ? (
          <p className="p-8 text-center text-[13.5px] text-dm-ink/60">Carregando...</p>
        ) : (
          <table className="w-full min-w-[860px] text-left text-[13.5px]">
            <thead className="bg-dm-surface text-[11px] font-bold uppercase tracking-wide text-dm-ink/55">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Papel</th>
                <th className="px-5 py-3">Situação</th>
                <th className="px-5 py-3">Criado em</th>
                <th className="px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const self = u.id === me.id;
                return (
                  <tr key={u.id} className="border-t border-black/5">
                    <td className="px-5 py-4 font-semibold text-dm-ink">
                      {u.name}
                      {self && <span className="ml-2 text-[11px] text-dm-ink/45">(você)</span>}
                    </td>
                    <td className="px-5 py-4 text-dm-ink/70">{u.email}</td>
                    <td className="px-5 py-4">
                      {self ? (
                        <Badge>{ROLE_LABEL[u.role ?? ""] ?? u.role}</Badge>
                      ) : (
                        <select
                          value={u.role ?? "editor"}
                          onChange={(e) => patch.mutate({ id: u.id, role: e.target.value })}
                          className="rounded-lg border border-black/10 px-2.5 py-1.5 text-[12.5px] outline-none focus:border-dm-blue"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {u.active === false ? (
                        <Badge tone="red">Desativado</Badge>
                      ) : u.mustChangePassword ? (
                        <Badge tone="gray">Senha provisória</Badge>
                      ) : (
                        <Badge tone="green">Ativo</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-dm-ink/60">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => resetPw.mutate(u.id)}
                          className="rounded-full border border-black/10 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-dm-ink hover:bg-black/[0.04]"
                        >
                          Nova senha
                        </button>
                        {!self && (
                          <button
                            onClick={() => patch.mutate({ id: u.id, active: u.active === false })}
                            className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-white ${
                              u.active === false ? "bg-dm-green hover:bg-dm-green-dark" : "bg-dm-red hover:bg-[#c5111a]"
                            }`}
                          >
                            {u.active === false ? "Reativar" : "Desativar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Card>
        <h2 className="font-display text-[15px] font-extrabold text-dm-ink">O que cada papel vê</h2>
        <ul className="mt-3 space-y-2 text-[13.5px] text-dm-ink/70">
          {ROLE_OPTIONS.map((r) => (
            <li key={r}>
              <span className="font-bold text-dm-ink">{ROLE_LABEL[r]}: </span>
              {ROLE_HELP[r]}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
