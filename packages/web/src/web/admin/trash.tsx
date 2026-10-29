import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, ClipboardList, Image, RotateCcw, Trash2, UserRound } from "lucide-react";
import { api } from "../lib/api";
import type { PanelUser } from "../lib/auth";
import { PageTitle } from "./ui";

type Item = {
  type: "lead" | "candidatura" | "vaga" | "midia";
  id: number;
  label: string;
  detail: string | null;
  deletedAt: string;
  deletedByName: string | null;
  daysLeft: number;
};

const META = {
  lead: { label: "Lead", Icon: ClipboardList },
  candidatura: { label: "Candidatura", Icon: UserRound },
  vaga: { label: "Vaga", Icon: Briefcase },
  midia: { label: "Imagem", Icon: Image },
} as const;

/** Cada tipo restaurado volta para a própria tela: atualiza as listas dela. */
const LIST_KEYS: Record<Item["type"], string[]> = {
  lead: ["admin-leads", "admin-dashboard"],
  candidatura: ["admin-candidaturas", "admin-candidaturas-novas", "admin-vagas"],
  vaga: ["admin-vagas"],
  midia: ["admin-midia"],
};

export function AdminTrash({ user }: { user: PanelUser }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-lixeira"],
    queryFn: async () => {
      const res = await api.admin.lixeira.$get();
      if (!res.ok) throw new Error("fail");
      return (await res.json()) as unknown as { items: Item[]; days: number };
    },
  });
  const refresh = (type: Item["type"]) => {
    qc.invalidateQueries({ queryKey: ["admin-lixeira"] });
    for (const k of LIST_KEYS[type]) qc.invalidateQueries({ queryKey: [k] });
  };

  const restore = useMutation({
    mutationFn: async (i: Item) => {
      const res = await api.admin.lixeira[":type"][":id"].restaurar.$post({ param: { type: i.type, id: String(i.id) } });
      if (!res.ok) throw new Error("fail");
      return i;
    },
    onSuccess: (i) => refresh(i.type),
  });
  const destroy = useMutation({
    mutationFn: async (i: Item) => {
      const res = await api.admin.lixeira[":type"][":id"].$delete({ param: { type: i.type, id: String(i.id) } });
      if (!res.ok) throw new Error("fail");
      return i;
    },
    onSuccess: (i) => refresh(i.type),
  });

  const isSuper = user.role === "super_admin";
  const items = q.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Lixeira"
        hint={`Leads, candidaturas, vagas e imagens apagados ficam aqui por ${q.data?.days ?? 30} dias e depois somem de vez, com os arquivos.${
          isSuper ? " Você também pode apagar na hora (pedido de exclusão pela lei de proteção de dados, por exemplo)." : ""
        }`}
      />
      {q.isPending && <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>}
      {q.isSuccess && !items.length && (
        <p className="rounded-2xl bg-white p-8 text-center text-[13.5px] text-dm-ink/55 shadow-sm">A lixeira está vazia.</p>
      )}
      {items.length > 0 && (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          {items.map((i) => {
            const meta = META[i.type];
            return (
              <li key={`${i.type}-${i.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-dm-ink/55">
                  <meta.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-dm-ink">
                    <span className="mr-2 text-[11px] font-bold uppercase tracking-wide text-dm-ink/45">{meta.label}</span>
                    {i.label}
                  </p>
                  <p className="truncate text-[12px] text-dm-ink/50">
                    {i.detail ? `${i.detail} · ` : ""}apagado {i.deletedByName ? `por ${i.deletedByName.split(" ")[0]} ` : ""}em{" "}
                    {new Date(i.deletedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className={`text-[12px] font-semibold ${i.daysLeft <= 3 ? "text-dm-red" : "text-dm-ink/50"}`}>
                  {i.daysLeft === 0 ? "sai hoje" : `sai em ${i.daysLeft} ${i.daysLeft === 1 ? "dia" : "dias"}`}
                </span>
                <button
                  type="button"
                  disabled={restore.isPending}
                  onClick={() => restore.mutate(i)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-dm-ink hover:bg-black/[0.03]"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                </button>
                {isSuper && (
                  <button
                    type="button"
                    disabled={destroy.isPending}
                    onClick={() => confirm(`Apagar de vez "${i.label}"? Não dá para desfazer.`) && destroy.mutate(i)}
                    className="rounded-md p-2 text-dm-red/70 hover:bg-dm-red/10 hover:text-dm-red"
                    title="Apagar de vez"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Apagar {i.label} de vez</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
