import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronLeft,
  ClipboardList,
  Images,
  LogOut,
  Newspaper,
  Package,
  ShoppingCart,
  Sliders,
  UserCircle2,
  Users,
  Briefcase,
  Menu,
} from "lucide-react";
import { api } from "../lib/api";
import { authClient, can, clearAuthToken, ROLE_LABEL, type PanelUser } from "../lib/auth";
import { AdminLogin } from "../admin/login";
import { AdminDashboard } from "../admin/dashboard";
import { AdminLeads, type LeadsFilter } from "../admin/leads";
import { AdminUsers } from "../admin/users";
import { AdminAccount } from "../admin/account";
import { AdminVagas } from "../admin/vagas";
import { AdminSiteSettings } from "../admin/site-settings";
import { Badge, Card, PageTitle } from "../admin/ui";
import { UserAvatar } from "../admin/avatar";
import { caseStudies } from "@/lib/cases";

type Area = "leads" | "conteudo" | "loja" | "config" | "usuarios" | "vagas" | "livre";

type NavItem = {
  id: string;
  label: string;
  Icon: typeof BarChart3;
  area: Area;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { id: "overview", label: "Dashboard", Icon: BarChart3, area: "livre" },
  { id: "leads", label: "Leads", Icon: ClipboardList, area: "leads" },
  { id: "cases", label: "Cases", Icon: Newspaper, area: "conteudo" },
  { id: "blog", label: "Blog", Icon: Newspaper, area: "conteudo", soon: true },
  { id: "produtos", label: "Catálogo", Icon: Package, area: "conteudo", soon: true },
  { id: "loja", label: "Loja", Icon: ShoppingCart, area: "loja", soon: true },
  { id: "vagas", label: "Vagas", Icon: Briefcase, area: "vagas" },
  { id: "midia", label: "Mídia", Icon: Images, area: "conteudo", soon: true },
  { id: "site", label: "Dados do site", Icon: Sliders, area: "config" },
  { id: "usuarios", label: "Usuários", Icon: Users, area: "usuarios" },
  { id: "conta", label: "Minha conta", Icon: UserCircle2, area: "livre" },
];

function allowed(role: string, area: Area) {
  if (area === "livre") return true;
  if (role === "super_admin") return true;
  if (role === "admin") return area !== "usuarios";
  if (role === "vendedor") return area === "leads";
  if (role === "editor") return area === "conteudo" || area === "vagas";
  if (role === "rh") return area === "vagas";
  return false;
}

/** Checklist do que falta para cada aplicacao virar case real. So aparece no painel. */
function CasesPending() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Cases: o que falta preencher"
        hint="As páginas em /cases publicam a configuração técnica e um cenário simulado, nunca número de cliente. Para virar case de verdade, cada aplicação precisa dos itens abaixo. Este checklist aparece somente aqui no painel."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {caseStudies.map((c) => (
          <Card key={c.slug}>
            <Badge>{c.segment}</Badge>
            <h3 className="mt-2 font-display text-[16px] font-bold text-dm-ink">{c.title}</h3>
            <a
              href={`/cases/${c.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-[12.5px] font-semibold text-dm-blue underline"
            >
              /cases/{c.slug}
            </a>
            <ul className="mt-4 space-y-3">
              {c.pending.map((p) => (
                <li key={p.field} className="flex gap-3">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-dm-red" />
                  <span>
                    <span className="block text-[13.5px] font-bold text-dm-ink">{p.field}</span>
                    <span className="block text-[12.5px] leading-relaxed text-dm-ink/60">
                      {p.why}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <p className="text-[12.5px] text-dm-ink/50">
        A edição dos cases com dados reais, fotos e depoimento entra na fase 3 do painel.
      </p>
    </div>
  );
}

function Soon({ label }: { label: string }) {
  return (
    <div className="space-y-6">
      <PageTitle title={label} hint="Esta área ainda está em construção." />
      <Card>
        <p className="text-[13.5px] leading-relaxed text-dm-ink/70">
          Em breve você vai poder cuidar desta parte do site direto por aqui.
        </p>
      </Card>
    </div>
  );
}

function Panel({ user, onSignOut }: { user: PanelUser; onSignOut: () => void }) {
  const nav = useMemo(() => NAV.filter((n) => allowed(user.role, n.area)), [user.role]);
  const [current, setCurrent] = useState(
    user.mustChangePassword ? "conta" : user.role === "rh" ? "vagas" : "overview",
  );
  const newApplications = useQuery({
    queryKey: ["admin-candidaturas-novas"],
    enabled: can(user.role, "candidatos"),
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await api.admin.candidaturas.novas.$get();
      return res.ok ? (await res.json()).total : 0;
    },
  });
  const badges: Record<string, number> = { vagas: newApplications.data ?? 0 };
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leadsFilter, setLeadsFilter] = useState<LeadsFilter | undefined>();

  const go = (id: string, filter?: LeadsFilter) => {
    setLeadsFilter(filter);
    setCurrent(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!nav.some((n) => n.id === current)) setCurrent("overview");
  }, [nav, current]);

  const item = nav.find((n) => n.id === current);

  return (
    <div className="flex min-h-screen bg-dm-surface">
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col justify-between bg-dm-blue-deep transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[76px]" : "w-[248px]"}`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-5">
            {!collapsed && (
              <img
                src="/img/site/logo-white.png"
                alt="Demakine"
                className="h-8 w-auto object-contain"
              />
            )}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setMobileOpen(false);
                else setCollapsed((v) => !v);
              }}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft
                size={18}
                className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <nav className="mt-2 space-y-1 px-2.5">
            {nav.map((n) => {
              const active = n.id === current;
              return (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  title={n.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors ${
                    active
                      ? "bg-white text-dm-blue-deep"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <n.Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate">{n.label}</span>
                      {!n.soon && (badges[n.id] ?? 0) > 0 && (
                        <span
                          className="rounded-full bg-dm-red px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white"
                          title={`${badges[n.id]} candidatura(s) nova(s)`}
                        >
                          {badges[n.id]}
                        </span>
                      )}
                      {n.soon && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            active ? "bg-dm-blue/10 text-dm-blue" : "bg-white/15 text-white/70"
                          }`}
                        >
                          em breve
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 px-4 py-5">
          {collapsed ? (
            <UserAvatar name={user.name} image={user.image} size={38} className="mx-auto ring-white/20" />
          ) : (
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} image={user.image} size={40} className="ring-white/20" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-white">{user.name}</p>
                <p className="truncate text-[11.5px] text-white/55">{user.email}</p>
                <p className="mt-1 text-[10.5px] font-bold uppercase tracking-wide text-white/50">
                  {ROLE_LABEL[user.role] ?? user.role}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onSignOut}
            className="mt-3 flex w-full items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={15} />
            {!collapsed && "Sair"}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-dm-blue-deep px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-white/80 hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <img
            src="/img/site/logo-white.png"
            alt="Demakine"
            className="h-7 w-auto object-contain"
          />
          <span className="ml-auto truncate text-[11px] font-bold uppercase tracking-wide text-white/60">
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
        </div>

        <div className="mx-auto max-w-[1360px] px-5 py-8 lg:px-10 lg:py-10">
          {user.mustChangePassword && current !== "conta" && (
            <div className="mb-6 rounded-xl bg-dm-red/10 px-5 py-4 text-[13.5px] font-semibold text-dm-red">
              Sua senha é provisória. Vá em Minha conta e defina uma senha sua.
            </div>
          )}

          {current === "overview" && <AdminDashboard user={user} onGo={go} />}
          {current === "leads" && (
            <AdminLeads key={JSON.stringify(leadsFilter ?? {})} user={user} initial={leadsFilter} />
          )}
          {current === "cases" && <CasesPending />}
          {current === "vagas" && <AdminVagas user={user} />}
          {current === "site" && <AdminSiteSettings />}
          {current === "usuarios" && <AdminUsers me={user} />}
          {current === "conta" && <AdminAccount user={user} forced={user.mustChangePassword} />}
          {item?.soon && <Soon label={item.label} />}
        </div>
      </main>
    </div>
  );
}

function Admin() {
  const qc = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["admin-me"],
    queryFn: async () => {
      const res = await api.admin.me.$get();
      if (!res.ok) return { user: null };
      return res.json();
    },
  });

  useEffect(() => {
    document.title = "Painel Demakine";
  }, []);

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dm-blue-deep text-[14px] text-white/80">
        Carregando painel...
      </div>
    );
  }

  const user = meQuery.data?.user as PanelUser | null | undefined;

  if (!user) {
    return <AdminLogin onSuccess={() => qc.invalidateQueries({ queryKey: ["admin-me"] })} />;
  }

  return (
    <Panel
      user={user}
      onSignOut={async () => {
        await authClient.signOut();
        clearAuthToken();
        qc.clear();
        qc.invalidateQueries({ queryKey: ["admin-me"] });
      }}
    />
  );
}

export default Admin;
