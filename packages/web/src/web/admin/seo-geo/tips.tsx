import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Btn, Card } from "../ui";
import { useDicas } from "./data";
import { SEO_GEO_TABS } from "./tabs";
import type { PanelProps } from ".";

const KEY = "seo-geo-dicas-feitas";
const read = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
};

/** As 15 dicas do dia (mudam todo dia depois da auditoria das 7h). "Feito" fica só neste navegador. */
export function Tips({ go }: PanelProps) {
  const q = useDicas();
  const [done, setDone] = useState<Record<string, boolean>>(read);
  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
  };
  if (q.isPending) return <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>;
  if (q.isError) return <Card><p className="text-[13.5px] font-semibold text-dm-red">{q.error.message}</p></Card>;
  const day = new Date(`${q.data.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  const left = q.data.tips.filter((t) => !done[t.id]).length;
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-dm-ink/60">Dicas de {day}: {left} de {q.data.tips.length} ainda por fazer. Amanhã vêm 15 novas.</p>
      <ul className="space-y-3">
        {q.data.tips.map((t) => (
          <li key={t.id} className={`rounded-2xl border border-black/5 bg-white p-4 shadow-sm ${done[t.id] ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-extrabold text-dm-ink">{t.title}</h3>
              {t.kind === "dado" && <span className="rounded-full bg-dm-red/10 px-2 py-0.5 text-[10.5px] font-bold text-dm-red">Do seu site</span>}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-dm-ink/70">{t.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn tone="ghost" onClick={() => go(t.tab)} className="inline-flex items-center gap-1.5">
                Abrir {SEO_GEO_TABS.find((x) => x.id === t.tab)?.label ?? ""} <ArrowRight size={13} aria-hidden="true" />
              </Btn>
              <button type="button" aria-pressed={Boolean(done[t.id])} onClick={() => toggle(t.id)} className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold text-dm-ink/60 hover:bg-black/[0.04]">
                <Check size={14} aria-hidden="true" /> {done[t.id] ? "Feito" : "Marcar como feito"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
