import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CARD_BLOCKS, KPI_BLOCKS } from "./layout";

/** Mesmos papéis e ids de api/lib/dashboard-access.ts. */
const ROLES = [
  { id: "admin", label: "Admin" },
  { id: "vendedor", label: "Vendedor" },
] as const;
type Role = (typeof ROLES)[number]["id"];
type Access = Record<Role, string[]>;

const GROUPS: { title: string; rows: { id: string; title: string; hint?: string }[] }[] = [
  {
    title: "Alcance",
    rows: [
      {
        id: "equipe",
        title: "Ver leads de toda a equipe",
        hint: "Desmarcado: o Dashboard mostra só os leads em que a pessoa é responsável.",
      },
    ],
  },
  { title: "Indicadores", rows: KPI_BLOCKS.map((b) => ({ id: b.id, title: b.title })) },
  { title: "Gráficos e listas", rows: CARD_BLOCKS.map((b) => ({ id: b.id, title: b.title })) },
];

/** Super admin decide o que cada papel enxerga. O que ficar desmarcado nem chega ao navegador deles. */
export function DashboardAccessPanel({ onClose }: { onClose: () => void }) {
  const q = useQuery({
    queryKey: ["admin-dashboard-acesso"],
    queryFn: async () => {
      const res = await api.admin.dashboard.acesso.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).access as Access;
    },
  });
  if (!q.data) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" aria-busy="true" />;
  }
  return <AccessEditor initial={q.data} onClose={onClose} />;
}

function AccessEditor({ initial, onClose }: { initial: Access; onClose: () => void }) {
  const qc = useQueryClient();
  const [blocked, setBlocked] = useState<Access>(initial);
  const toggle = (role: Role, id: string) =>
    setBlocked((b) => ({ ...b, [role]: b[role].includes(id) ? b[role].filter((x) => x !== id) : [...b[role], id] }));
  const setAll = (role: Role, visible: boolean) =>
    setBlocked((b) => ({ ...b, [role]: visible ? [] : GROUPS.flatMap((g) => g.rows.map((r) => r.id)) }));

  const save = useMutation({
    mutationFn: async () => {
      const res = await api.admin.dashboard.acesso.$put({ json: { access: blocked } });
      if (!res.ok) throw new Error("Não foi possível salvar");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-dashboard-acesso"] });
      onClose();
    },
  });

  return (
    <div className="rounded-2xl border border-dm-blue/20 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="font-display text-[16px] font-extrabold text-dm-ink">O que cada papel vê no Dashboard</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-dm-ink/60">
            Desmarque o que o papel não deve ver. O bloqueio vale no servidor: os dados nem chegam ao navegador da
            pessoa, e o bloco some também do Personalizar dela. Você, como super admin, vê tudo sempre. Os valores em
            R$ continuam seguindo a regra do responsável pelo lead.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="border-b border-black/10">
              <th className="py-2 pr-3 text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">Bloco</th>
              {ROLES.map((r) => (
                <th key={r.id} className="w-28 px-2 py-2 text-center">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">{r.label}</span>
                  <span className="mt-1 flex justify-center gap-2 text-[10.5px] font-semibold normal-case">
                    <button type="button" onClick={() => setAll(r.id, true)} className="text-dm-blue hover:underline">
                      todos
                    </button>
                    <button type="button" onClick={() => setAll(r.id, false)} className="text-dm-ink/45 hover:underline">
                      nenhum
                    </button>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {GROUPS.map((g) => (
            <tbody key={g.title}>
              <tr>
                <td colSpan={ROLES.length + 1} className="pb-1 pt-4 text-[11px] font-bold uppercase tracking-wide text-dm-blue">
                  {g.title}
                </td>
              </tr>
              {g.rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5">
                  <td className="py-2.5 pr-3">
                    <span className="block text-[13.5px] font-semibold text-dm-ink">{row.title}</span>
                    {row.hint && <span className="block text-[12px] text-dm-ink/50">{row.hint}</span>}
                  </td>
                  {ROLES.map((r) => {
                    const on = !blocked[r.id].includes(row.id);
                    return (
                      <td key={r.id} className="px-2 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(r.id, row.id)}
                          aria-label={`${r.label} vê ${row.title}`}
                          className="h-4.5 w-4.5 cursor-pointer accent-dm-blue"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="rounded-full bg-dm-blue px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white hover:bg-[#0d3480] disabled:opacity-60"
        >
          {save.isPending ? "Salvando..." : "Salvar acesso"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-black/10 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink hover:bg-black/[0.03]"
        >
          Cancelar
        </button>
        {save.isError && <span className="text-[13px] font-semibold text-dm-red">{save.error.message}</span>}
      </div>
    </div>
  );
}
