import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import { ROLE_LABEL, type PanelUser } from "../lib/auth";
import { cn } from "@/lib/utils";
import { PageTitle, inputCls } from "./ui";

type Item = {
  id: number;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  summary: string;
  createdAt: string;
};

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const key = d.toLocaleDateString("en-CA");
  const today = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - 864e5).toLocaleDateString("en-CA");
  if (key === today) return "Hoje";
  if (key === yesterday) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
};

export function AdminActivity({ user }: { user: PanelUser }) {
  const q = useQuery({
    queryKey: ["admin-atividades"],
    queryFn: async () => {
      const res = await api.admin.atividades.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()).items as unknown as Item[];
    },
    refetchInterval: 60_000,
  });
  const [who, setWho] = useState("todos");
  const [term, setTerm] = useState("");

  const items = q.data ?? [];
  const people = useMemo(() => [...new Map(items.map((i) => [i.userId, i.userName ?? "?"])).entries()], [items]);
  const shown = items.filter(
    (i) => (who === "todos" || i.userId === who) && (!term.trim() || i.summary.toLowerCase().includes(term.trim().toLowerCase())),
  );
  const groups = useMemo(() => {
    const out: { day: string; items: Item[] }[] = [];
    for (const i of shown) {
      const day = dayLabel(i.createdAt);
      const last = out[out.length - 1];
      if (last?.day === day) last.items.push(i);
      else out.push({ day, items: [i] });
    }
    return out;
  }, [shown]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Atividades"
        hint={
          user.role === "super_admin"
            ? "Tudo o que foi alterado no painel, por quem e quando. Valores e senhas não aparecem aqui."
            : user.role === "admin"
              ? "Suas alterações e as dos editores."
              : "Suas alterações no painel."
        }
      />
      <div className="flex flex-wrap gap-3">
        <label className="relative block min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dm-ink/40" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar: produto, lead #12, senha..." aria-label="Buscar atividade" className={cn(inputCls, "pl-10")} />
        </label>
        {people.length > 1 && (
          <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Filtrar por pessoa" className={cn(inputCls, "w-auto min-w-[200px]")}>
            <option value="todos">Todas as pessoas</option>
            {people.map(([id, name]) => (
              <option key={id ?? "?"} value={id ?? ""}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {q.isPending && <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>}
      {q.isSuccess && !shown.length && (
        <p className="rounded-2xl bg-white p-8 text-center text-[13.5px] text-dm-ink/55 shadow-sm">Nenhuma atividade registrada ainda.</p>
      )}

      {groups.map((g) => (
        <section key={g.day}>
          <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-dm-ink/50">{g.day}</h2>
          <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            {g.items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3">
                <span className="w-12 shrink-0 text-[12px] tabular-nums text-dm-ink/45">
                  {new Date(i.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="min-w-0 flex-1 text-[13.5px] text-dm-ink">
                  <b>{i.userName ?? "Alguém"}</b> <span className="text-dm-ink/75">{i.summary.charAt(0).toLowerCase() + i.summary.slice(1)}</span>
                </span>
                {i.userRole && <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/35">{ROLE_LABEL[i.userRole] ?? i.userRole}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
