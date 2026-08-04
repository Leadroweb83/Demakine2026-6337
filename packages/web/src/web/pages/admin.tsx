import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

type Lead = {
  id: number;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  product: string | null;
  message: string | null;
  source: string | null;
  createdAt: string;
};

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const login = useMutation({
    mutationFn: async () => {
      const res = await api.admin.login.$post({ json: { password } });
      if (!res.ok) throw new Error("unauthorized");
      return res.json();
    },
    onSuccess: () => onSuccess(),
    onError: () => setError(true),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1F3D] px-6 font-[Montserrat]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(false);
          login.mutate();
        }}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
      >
        <img src="/img/site/logo-blue.png" alt="Demakine" className="mx-auto h-10 w-auto object-contain" />
        <h1 className="mt-6 text-center text-lg font-bold text-[#111318]">Painel de Leads</h1>
        <p className="mt-1 text-center text-sm text-[#111318]/60">Acesso restrito</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha de acesso"
          className="mt-6 w-full rounded-lg border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#103D94]"
          autoFocus
        />

        {error && <p className="mt-2 text-xs font-medium text-red-600">Senha incorreta. Tente novamente.</p>}

        <button
          type="submit"
          disabled={login.isPending}
          className="mt-4 w-full rounded-full bg-[#103D94] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {login.isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

function LeadsTable() {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const res = await api.admin.leads.$get();
      if (!res.ok) throw new Error("failed");
      return (await res.json()).leads as Lead[];
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await api.admin.logout.$post();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-me"] });
    },
  });

  const leads = leadsQuery.data ?? [];

  const whatsappHref = (phone: string, name: string) =>
    `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${name}! Aqui é da Demakine, recebemos seu contato.`)}`;

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-[Montserrat]">
      <header className="flex items-center justify-between bg-[#0A1F3D] px-6 py-4">
        <img src="/img/site/logo-white.png" alt="Demakine" className="h-9 w-auto object-contain" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">{leads.length} leads recebidos</span>
          <button
            onClick={() => logout.mutate()}
            className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10">
        <h1 className="text-2xl font-extrabold text-[#111318]">Leads Recebidos</h1>
        <p className="mt-1 text-sm text-[#111318]/60">Contatos enviados pelo formulário do site.</p>

        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
          {leadsQuery.isLoading ? (
            <p className="p-8 text-center text-sm text-[#111318]/60">Carregando...</p>
          ) : leads.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#111318]/60">Nenhum lead recebido ainda.</p>
          ) : (
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#F4F6FA] text-xs font-bold uppercase tracking-wide text-[#111318]/60">
                <tr>
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Telefone</th>
                  <th className="px-5 py-3">E-mail</th>
                  <th className="px-5 py-3">Cidade</th>
                  <th className="px-5 py-3">Interesse</th>
                  <th className="px-5 py-3">Origem</th>
                  <th className="px-5 py-3">Mensagem</th>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-black/5">
                    <td className="px-5 py-4 font-semibold text-[#111318]">{lead.name}</td>
                    <td className="px-5 py-4 text-[#111318]/70">{lead.company || "—"}</td>
                    <td className="px-5 py-4 text-[#111318]/70">{lead.phone}</td>
                    <td className="px-5 py-4 text-[#111318]/70">{lead.email || "—"}</td>
                    <td className="px-5 py-4 text-[#111318]/70">{lead.city || "—"}</td>
                    <td className="px-5 py-4 text-[#111318]/70">{lead.product || "—"}</td>
                    <td className="px-5 py-4 text-[11px] uppercase tracking-wide text-[#103D94]">{lead.source || "site"}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-[#111318]/70">{lead.message || "—"}</td>
                    <td className="px-5 py-4 text-[#111318]/60">
                      {new Date(lead.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={whatsappHref(lead.phone, lead.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function Admin() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["admin-me"],
    queryFn: async () => {
      const res = await api.admin.me.$get();
      if (!res.ok) return { authenticated: false };
      return res.json();
    },
  });

  if (meQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0A1F3D] text-white">Carregando...</div>;
  }

  if (!meQuery.data?.authenticated) {
    return <LoginForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-me"] })} />;
  }

  return <LeadsTable />;
}

export default Admin;
