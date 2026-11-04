import { useEffect, useState } from "react";
import { LayoutGrid, List, X } from "lucide-react";
import type { Culture, CultureFilter, DaeFilter, FieldPhoto, PhotoView } from "../types";
import { getPlot, plots } from "../data/mock";
import { cx, daysBetween, formatDate } from "../lib/format";
import { FieldImage } from "./FieldImage";
import { EmptyState, SegmentedControl } from "./SegmentedControl";

interface PhotoGalleryProps {
  photos: FieldPhoto[];
  culture: CultureFilter;
  plotId: string | null;
  onCultureChange: (culture: Culture) => void;
  onClearPlot: () => void;
}

const daeOptions: Array<{ value: DaeFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "0-30", label: "Até 30" },
  { value: "31-60", label: "31–60" },
  { value: "61+", label: "61+" },
];

function matchesDae(dae: number, filter: DaeFilter) {
  if (filter === "todos") return true;
  if (filter === "0-30") return dae <= 30;
  if (filter === "31-60") return dae >= 31 && dae <= 60;
  return dae >= 61;
}

export function PhotoGallery({ photos, culture, plotId, onCultureChange, onClearPlot }: PhotoGalleryProps) {
  const [photoCulture, setPhotoCulture] = useState<Culture>(culture === "milho" ? "milho" : "soja");
  const [daeFilter, setDaeFilter] = useState<DaeFilter>("todos");
  const [view, setView] = useState<PhotoView>("grid");

  useEffect(() => {
    if (culture === "soja" || culture === "milho") setPhotoCulture(culture);
  }, [culture]);

  const plot = plotId ? getPlot(plotId) : null;
  const cards = photos
    .map((photo) => {
      const photoPlot = photo.plotId ? getPlot(photo.plotId) : null;
      const emergenceDates = plots
        .filter((item) => photo.culture === "soja e milho" || item.culture === photo.culture)
        .map((item) => item.emergenceDate)
        .sort();
      const emergence = photoPlot?.emergenceDate ?? emergenceDates[0] ?? photo.datetime;
      return {
        photo,
        plot: photoPlot,
        dae: daysBetween(emergence, photo.datetime),
      };
    })
    .filter((card) => card.photo.culture === photoCulture || card.photo.culture === "soja e milho")
    .filter((card) => (plotId ? card.photo.plotId === plotId : true))
    .filter((card) => matchesDae(card.dae, daeFilter))
    .sort((a, b) => b.photo.datetime.localeCompare(a.photo.datetime));

  return (
    <section aria-label="Galeria de fotos" className="space-y-3 py-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Fotos do campo</h1>
        <p className="text-sm text-ink-500">Ordem cronológica, com dias após a emergência.</p>
      </div>

      <SegmentedControl
        label="Cultura das fotos"
        value={photoCulture}
        onChange={(value) => {
          setPhotoCulture(value);
          onCultureChange(value);
        }}
        options={[
          { value: "soja", label: "Soja" },
          { value: "milho", label: "Milho" },
        ]}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto" role="radiogroup" aria-label="Filtrar por dias após a emergência">
          {daeOptions.map((option) => {
            const selected = daeFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setDaeFilter(option.value)}
                className={cx(
                  "h-9 shrink-0 rounded-full px-3 text-xs font-extrabold",
                  selected ? "bg-ink-900 text-white" : "bg-white text-ink-700",
                )}
              >
                {option.value === "todos" ? "Todos os DAE" : `${option.label} DAE`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {plot ? (
          <button
            type="button"
            onClick={onClearPlot}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-sun-100 px-3 text-xs font-extrabold text-sun-700"
          >
            Parcela {plot.number}
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Limpar filtro da parcela</span>
          </button>
        ) : (
          <p className="text-xs font-semibold text-ink-500">{cards.length} registros</p>
        )}
        <div className="grid grid-cols-2 rounded-full bg-white p-1" role="radiogroup" aria-label="Modo de visualização">
          <button
            type="button"
            role="radio"
            aria-checked={view === "grid"}
            aria-label="Grade"
            onClick={() => setView("grid")}
            className={cx("grid h-8 w-10 place-items-center rounded-full", view === "grid" && "bg-leaf-700 text-white")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={view === "timeline"}
            aria-label="Linha do tempo"
            onClick={() => setView("timeline")}
            className={cx(
              "grid h-8 w-10 place-items-center rounded-full",
              view === "timeline" ? "bg-leaf-700 text-white" : "text-ink-700",
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState title="Nenhuma foto neste recorte">
          Ajuste a cultura, o intervalo de DAE ou limpe o filtro da parcela.
        </EmptyState>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-3 gap-1.5">
          {cards.map(({ photo, plot: photoPlot, dae }) => (
            <li key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl">
              <FieldImage src={photo.image} alt={photo.caption} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 to-transparent p-1.5 text-white">
                <p className="text-[11px] font-extrabold">{dae} DAE</p>
                <p className="text-[10px] leading-tight">
                  {photoPlot ? `P${photoPlot.number}` : photo.culture} · {formatDate(photo.datetime).slice(0, 6)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ol className="space-y-3">
          {cards.map(({ photo, plot: photoPlot, dae }) => (
            <li key={photo.id} className="overflow-hidden rounded-3xl bg-white shadow-card">
              <FieldImage src={photo.image} alt={photo.caption} className="h-48 w-full object-cover" />
              <div className="space-y-1 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-leaf-700 px-2.5 py-1 text-xs font-extrabold text-white">{dae} DAE</span>
                  <span className="rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-extrabold text-leaf-800">
                    {photo.stageCode}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-ink-900">
                  {photoPlot ? `Parcela ${photoPlot.number}` : photo.culture}
                  <span className="font-semibold text-ink-500"> · {formatDate(photo.datetime)}</span>
                </p>
                <p className="text-sm text-ink-700">{photo.caption}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
