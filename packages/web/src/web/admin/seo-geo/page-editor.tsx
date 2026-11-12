import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";
import { DEFAULT_RULES, type SeoRules } from "../../../api/lib/seo/rules";
import { SeoDocError, toSeoDoc } from "../../lib/seo-overrides";
import { Badge, Btn, Card, inputCls } from "../ui";
import { useAuditPage, usePagina, useRegras, useSavePagina, type PaginaDetail } from "./data";
import { AREA_LABELS, ITEM_LABELS, scoreColor, warnBeforeHiding } from "./model";
import { SCORE_TONE, ScoreRing } from "./score-ring";
import type { PanelProps } from ".";

const ORIGIN = "https://www.demakine.com.br";

/** Contador de caracteres com a faixa ideal: verde dentro dela, âmbar fora. */
function Counter({ n, min, max }: { n: number; min: number; max: number }) {
  const ok = n >= min && n <= max;
  return (
    <span className={`tabular-nums ${n === 0 ? "text-dm-ink/45" : ok ? "font-bold text-dm-green-dark" : "font-bold text-amber-700"}`}>
      {n} <span className="font-normal text-dm-ink/45">(ideal {min} a {max})</span>
    </span>
  );
}

/** Como o resultado aparece no Google, no computador e no celular. */
function GooglePreview({ path, title, description }: { path: string; title: string; description: string }) {
  const [mobile, setMobile] = useState(false);
  const crumbs = path === "/" ? "" : ` › ${path.split("/").filter(Boolean).join(" › ")}`;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Prévia no Google</h3>
        <div className="flex rounded-full bg-black/5 p-0.5 text-[11.5px] font-bold" role="group" aria-label="Tamanho da prévia">
          {[false, true].map((m) => (
            <button key={String(m)} type="button" aria-pressed={mobile === m} onClick={() => setMobile(m)} className={`rounded-full px-3 py-1 transition-colors ${mobile === m ? "bg-white text-dm-ink shadow-sm" : "text-dm-ink/55"}`}>
              {m ? "Celular" : "Computador"}
            </button>
          ))}
        </div>
      </div>
      <div className={`rounded-xl border border-black/5 bg-white p-4 shadow-sm ${mobile ? "max-w-[360px]" : ""}`}>
        <p className="truncate text-[12px] text-[#3c4043]">www.demakine.com.br{crumbs}</p>
        <p className={`mt-1 text-[#1a0dab] ${mobile ? "line-clamp-2 text-[18px] leading-snug" : "line-clamp-1 text-[20px]"}`}>{title}</p>
        <p className={`mt-1 text-[#4d5156] ${mobile ? "line-clamp-4 text-[13.5px]" : "line-clamp-2 text-[14px]"} leading-relaxed`}>{description || "Sem descrição: o Google escolhe um trecho da página."}</p>
      </div>
    </div>
  );
}

function Switch({ checked, onChange, disabled, label, hint }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)} className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-dm-green" : "bg-black/20"}`}>
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${checked ? "translate-x-5" : ""}`} />
      </button>
      <div className="min-w-0">
        <p className="text-[13.5px] font-bold text-dm-ink">{label}</p>
        {hint && <p className="text-[12.5px] leading-snug text-dm-ink/55">{hint}</p>}
      </div>
    </div>
  );
}

function Checks({ checks }: { checks: PaginaDetail["checks"] }) {
  if (checks.length === 0) return <p className="text-[13px] text-dm-ink/55">Esta página ainda não foi auditada. Use "Auditar esta página" para ver a nota item a item.</p>;
  const round = (n: number) => Math.round(n * 10) / 10;
  return (
    <ul className="space-y-3">
      {checks.map((c) => {
        const pct = c.max > 0 ? Math.round((c.points / c.max) * 100) : 0;
        const tone = SCORE_TONE[scoreColor(pct)];
        return (
          <li key={c.item}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-bold text-dm-ink">{ITEM_LABELS[c.item] ?? c.item}</span>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: c.skipped ? undefined : tone.text }}>
                {c.skipped ? "não avaliado" : `${round(c.points)} de ${round(c.max)}`}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.07]" aria-hidden="true">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone.stroke }} />
            </div>
            <p className="mt-1 text-[12.5px] text-dm-ink/65">{c.message}</p>
            {!c.ok && !c.skipped && c.fix && <p className="text-[12.5px] text-dm-ink/55">Como resolver: {c.fix}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function EditorForm({ path, detail, rules }: { path: string; detail: PaginaDetail; rules: SeoRules }) {
  const { page, facts, checks, visits30d } = detail;
  const o = page.overrides;
  const save = useSavePagina(path);
  const audit = useAuditPage(path);
  const [title, setTitle] = useState(o.title ?? "");
  const [description, setDescription] = useState(o.description ?? "");
  const [ogImage, setOgImage] = useState(o.ogImage ?? "");
  const [canonical, setCanonical] = useState(o.canonical ?? "");
  const [show, setShow] = useState(o.noindex !== true);
  const [inSitemap, setInSitemap] = useState(o.noSitemap !== true);
  const [confirmHide, setConfirmHide] = useState(false);
  const [saved, setSaved] = useState(false);

  const wasHidden = o.noindex === true;
  const hidingNow = !show && !wasHidden;
  const warning = hidingNow ? warnBeforeHiding(visits30d, page.technical) : null;

  // o que vai ser salvo: o documento atual com os campos desta tela trocados (o resto, como a resposta curta, fica)
  const built = useMemo(() => {
    try {
      return { doc: toSeoDoc({ ...o, title, description, canonical, ogImage, noindex: !show, noSitemap: !inSitemap }), error: null as string | null };
    } catch (err) {
      return { doc: null, error: err instanceof SeoDocError ? err.message : "Confira os campos." };
    }
  }, [o, title, description, canonical, ogImage, show, inSitemap]);

  const dirty =
    title !== (o.title ?? "") || description !== (o.description ?? "") || ogImage !== (o.ogImage ?? "") || canonical !== (o.canonical ?? "") || show !== (o.noindex !== true) || inSitemap !== (o.noSitemap !== true);
  const blocked = !built.doc || (Boolean(warning) && !confirmHide);

  const liveTitle = facts?.title ?? page.label;
  const shownTitle = title.trim() || liveTitle;
  const shownDesc = description.trim() || facts?.description || "";
  const score = checks.length ? Math.round(checks.reduce((s, c) => s + c.points, 0)) : null;
  const clear = () => {
    setTitle("");
    setDescription("");
    setOgImage("");
    setCanonical("");
    setShow(true);
    setInSitemap(true);
    setConfirmHide(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <GooglePreview path={path} title={shownTitle} description={shownDesc} />

        <Card className="space-y-4">
          <label className="block">
            <span className="flex flex-wrap justify-between gap-x-3 text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
              Título <Counter n={shownTitle.length} min={rules.title.min} max={rules.title.max} />
            </span>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} placeholder={liveTitle} className={`${inputCls} mt-1.5`} />
          </label>
          <label className="block">
            <span className="flex flex-wrap justify-between gap-x-3 text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
              Descrição <Counter n={shownDesc.length} min={rules.description.min} max={rules.description.max} />
            </span>
            <textarea rows={3} value={description} onChange={(e) => { setDescription(e.target.value); setSaved(false); }} placeholder={facts?.description ?? ""} className={`${inputCls} mt-1.5`} />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Imagem de compartilhamento</span>
            <input value={ogImage} onChange={(e) => { setOgImage(e.target.value); setSaved(false); }} placeholder="/img/... ou https://..." className={`${inputCls} mt-1.5`} />
            <span className="mt-1 block text-[12px] text-dm-ink/50">É a imagem do cartão no WhatsApp e nas redes. Vazio usa a imagem padrão do site (1200 por 630 pixels funciona melhor).</span>
            {ogImage.trim() && (ogImage.trim().startsWith("/") || ogImage.trim().startsWith("https://")) && <img src={ogImage.trim()} alt="Prévia da imagem de compartilhamento" className="mt-2 h-24 w-auto max-w-full rounded-lg border border-black/10 object-cover" />}
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">Endereço canônico</span>
            <input value={canonical} onChange={(e) => { setCanonical(e.target.value); setSaved(false); }} placeholder={`${ORIGIN}${path}`} className={`${inputCls} mt-1.5`} />
            <span className="mt-1 block text-[12px] text-dm-ink/50">Só preencha se esta página for cópia de outra: o Google passa a tratar a outra como a principal. Aceita só endereços do próprio site.</span>
          </label>
        </Card>

        <Card className="space-y-4">
          <Switch
            checked={show}
            onChange={(v) => { setShow(v); setConfirmHide(false); setSaved(false); }}
            disabled={page.technical}
            label="Aparecer no Google"
            hint={page.technical ? "Página técnica: fica fora do Google de propósito." : "Desligado, a página sai dos resultados do Google na próxima visita dele."}
          />
          {warning && (
            <div className="rounded-xl border border-amber-300/70 bg-amber-50 p-4" role="alert">
              <p className="flex items-center gap-2 text-[13.5px] font-bold text-amber-900">
                <TriangleAlert size={16} aria-hidden="true" /> {warning}
              </p>
              <label className="mt-2 flex items-start gap-2 text-[13px] text-amber-900">
                <input type="checkbox" checked={confirmHide} onChange={(e) => setConfirmHide(e.target.checked)} className="mt-1 h-4 w-4" />
                Entendi, quero tirar esta página do Google.
              </label>
            </div>
          )}
          <Switch
            checked={inSitemap && show}
            onChange={(v) => { setInSitemap(v); setSaved(false); }}
            disabled={page.technical || !show}
            label="Aparecer no sitemap"
            hint={!show ? "Página oculta do Google já fica fora do sitemap." : "O sitemap é a lista de páginas que o Google lê. Tirar daqui não esconde a página."}
          />
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Btn
            disabled={!dirty || blocked || save.isPending}
            onClick={() => {
              if (!built.doc) return;
              setSaved(false);
              save.mutate(built.doc, { onSuccess: () => setSaved(true) });
            }}
          >
            {save.isPending ? "Salvando..." : "Salvar"}
          </Btn>
          <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-dm-ink/55 hover:text-dm-ink">
            <RotateCcw size={14} aria-hidden="true" /> Voltar ao padrão
          </button>
        </div>
        <div aria-live="polite" className="space-y-1">
          {built.error && <p className="text-[12.5px] font-semibold text-dm-red">{built.error}</p>}
          {save.isError && <p className="text-[12.5px] font-semibold text-dm-red">{save.error.message}</p>}
          {saved && !dirty && <p className="text-[12.5px] font-semibold text-dm-green-dark">Salvo. A mudança vai ao ar em cerca de 1 a 2 minutos.</p>}
        </div>
      </div>

      <div className="space-y-5">
        <Card>
          <div className="flex items-center gap-4">
            <ScoreRing value={score} size={88} label="Nota de SEO da página" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">Nota de SEO desta página</p>
              <p className="mt-0.5 text-[12.5px] text-dm-ink/60">{visits30d} {visits30d === 1 ? "visita" : "visitas"} nos últimos 30 dias</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Btn tone="ghost" onClick={() => audit.mutate()} disabled={audit.isPending} className="inline-flex items-center gap-2">
              <RefreshCw size={14} className={audit.isPending ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
              {audit.isPending ? "Auditando..." : "Auditar esta página"}
            </Btn>
            {audit.isError && <span className="text-[12.5px] font-semibold text-dm-red">{audit.error.message}</span>}
          </div>
          <div className="mt-5 border-t border-black/5 pt-4">
            <Checks checks={checks} />
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Editor de SEO de uma página: prévia do Google, texto, imagem, canonical, visibilidade e a nota item a item. */
export function PageEditor({ path, go }: { path: string; go: PanelProps["go"] }) {
  const q = usePagina(path);
  const regras = useRegras();
  const rules = regras.data?.rules ?? DEFAULT_RULES;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => go("paginas")} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-dm-blue hover:underline">
          <ArrowLeft size={15} aria-hidden="true" /> Todas as páginas
        </button>
        <a href={`${ORIGIN}${path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-dm-ink/55 hover:text-dm-blue">
          Ver no site <ExternalLink size={13} aria-hidden="true" />
        </a>
      </div>

      {q.isPending && <p className="text-[13.5px] text-dm-ink/55">Carregando...</p>}
      {q.isError && (
        <Card>
          <p className="text-[13.5px] font-semibold text-dm-red">{q.error.message}</p>
        </Card>
      )}
      {q.isSuccess && (
        <>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-[22px] font-extrabold text-dm-ink">{q.data.page.label}</h2>
              <Badge tone="gray">{AREA_LABELS[q.data.page.area]}</Badge>
              {q.data.page.hiddenByPanel && <Badge tone="red">Oculta do Google</Badge>}
              {q.data.page.technical && <Badge tone="gray">Técnica</Badge>}
            </div>
            <p className="mt-1 break-all font-mono text-[12px] text-dm-ink/45">{path}</p>
          </div>
          <EditorForm key={path} path={path} detail={q.data} rules={rules} />
        </>
      )}
    </div>
  );
}
