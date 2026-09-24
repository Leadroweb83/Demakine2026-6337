import { useEffect, useMemo, useRef, useState } from "react";
import { createSwapy, utils, type SlotItemMapArray, type Swapy } from "swapy";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_BLOCKS, DEFAULT_LAYOUT, KPI_BLOCKS, type DashboardLayout } from "./layout";

type Block = { id: string; title: string };

/**
 * Lista ordenável com arrastar (Swapy em modo manual: o React manda na ordem,
 * o Swapy só anima) e botões de subir/descer para teclado e celular.
 */
function SortableGroup({
  title,
  blocks,
  hidden,
  onOrder,
  onToggle,
}: {
  title: string;
  blocks: Block[];
  hidden: string[];
  onOrder: (ids: string[]) => void;
  onToggle: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const swapy = useRef<Swapy | null>(null);
  const [map, setMap] = useState<SlotItemMapArray>(() => utils.initSlotItemMap(blocks, "id"));
  const slotted = useMemo(() => utils.toSlottedItems(blocks, "id", map), [blocks, map]);

  useEffect(() => {
    if (!container.current) return;
    swapy.current = createSwapy(container.current, { manualSwap: true, animation: "dynamic", dragAxis: "y" });
    swapy.current.onSwap((e) => setMap(e.newSlotItemMap.asArray));
    return () => swapy.current?.destroy();
  }, []);

  useEffect(() => {
    swapy.current?.update();
    onOrder(map.map((m) => m.item));
    // onOrder muda a cada render do pai; só a ordem importa aqui
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= map.length) return;
    setMap((cur) => {
      const next = cur.map((m) => ({ ...m }));
      [next[idx]!.item, next[j]!.item] = [next[j]!.item, next[idx]!.item];
      return next;
    });
  };

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">{title}</p>
      <div ref={container} className="mt-2 space-y-1.5">
        {slotted.map(({ slotId, itemId, item }, idx) => {
          const off = hidden.includes(itemId);
          return (
            <div
              key={slotId}
              data-swapy-slot={slotId}
              className="rounded-xl data-[swapy-highlighted]:bg-dm-blue-soft"
            >
              <div
                key={itemId}
                data-swapy-item={itemId}
                className={cn(
                  "flex items-center gap-2 rounded-xl border bg-white px-2.5 py-2 data-[swapy-dragging]:opacity-70 data-[swapy-dragging]:shadow-lg",
                  off ? "border-dashed border-black/15" : "border-black/10",
                )}
              >
                <span
                  data-swapy-handle
                  className="cursor-grab rounded-md p-1 text-dm-ink/40 hover:bg-black/[0.04] active:cursor-grabbing"
                  title="Arrastar"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <span className={cn("flex-1 text-[13.5px] font-semibold", off ? "text-dm-ink/40 line-through" : "text-dm-ink")}>
                  {item?.title}
                </span>
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-md p-1.5 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-ink disabled:opacity-25"
                  title="Subir"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Subir {item?.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === slotted.length - 1}
                  className="rounded-md p-1.5 text-dm-ink/45 hover:bg-black/[0.04] hover:text-dm-ink disabled:opacity-25"
                  title="Descer"
                >
                  <ArrowDown className="h-4 w-4" />
                  <span className="sr-only">Descer {item?.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(itemId)}
                  aria-pressed={!off}
                  className={cn(
                    "rounded-md p-1.5 hover:bg-black/[0.04]",
                    off ? "text-dm-ink/35" : "text-dm-blue",
                  )}
                  title={off ? "Mostrar" : "Esconder"}
                >
                  {off ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{off ? `Mostrar ${item?.title}` : `Esconder ${item?.title}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardCustomizer({
  blocked = [],
  layout,
  saving,
  onSave,
  onCancel,
}: {
  /** blocos que o super admin tirou deste papel: não aparecem para escolher */
  blocked?: string[];
  layout: DashboardLayout;
  saving: boolean;
  onSave: (layout: DashboardLayout) => void;
  onCancel: () => void;
}) {
  const [hidden, setHidden] = useState<string[]>(layout.hidden);
  const [version, setVersion] = useState(0);
  const [base, setBase] = useState<DashboardLayout>(layout);
  const kpiOrder = useRef<string[]>([]);
  const cardOrder = useRef<string[]>([]);

  const byId = (list: readonly Block[], order: string[]) =>
    order
      .filter((id) => !blocked.includes(id))
      .map((id) => list.find((b) => b.id === id))
      .filter((b): b is Block => Boolean(b));
  const kpis = useMemo(() => byId(KPI_BLOCKS, base.order), [base]);
  const cards = useMemo(() => byId(CARD_BLOCKS, base.order), [base]);

  const toggle = (id: string) =>
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  const reset = () => {
    setBase(DEFAULT_LAYOUT);
    setHidden([]);
    setVersion((v) => v + 1);
  };

  return (
    <div className="rounded-2xl border border-dm-blue/20 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[15px] font-extrabold text-dm-ink">Personalizar dashboard</h2>
          <p className="mt-1 text-[12.5px] text-dm-ink/55">
            Arraste pela alça ou use as setas para mudar a ordem. O olho mostra ou esconde o bloco. Fica
            salvo só para você.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-dm-ink/60 hover:bg-black/[0.04] hover:text-dm-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrão
        </button>
      </div>

      <div key={version} className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <SortableGroup
          title="Indicadores"
          blocks={kpis}
          hidden={hidden}
          onOrder={(ids) => (kpiOrder.current = ids)}
          onToggle={toggle}
        />
        <SortableGroup
          title="Gráficos e listas"
          blocks={cards}
          hidden={hidden}
          onOrder={(ids) => (cardOrder.current = ids)}
          onToggle={toggle}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-black/10 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-dm-ink hover:bg-black/[0.04]"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave({ order: [...kpiOrder.current, ...cardOrder.current], hidden })}
          className="rounded-full bg-dm-blue px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white hover:bg-[#0d3480] disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
