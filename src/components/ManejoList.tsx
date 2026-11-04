import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CultureFilter, FieldApplication } from "../types";
import { getPlot, plots } from "../data/mock";
import { cx, formatDateTime, formatGramsPerHa, formatLitersPerHa } from "../lib/format";
import { EmptyState } from "./SegmentedControl";
import { WeatherChips } from "./WeatherChips";

interface ManejoListProps {
  applications: FieldApplication[];
  culture: CultureFilter;
}

export function ManejoList({ applications, culture }: ManejoListProps) {
  const visible = applications
    .filter((item) => culture === "todas" || item.culture === culture)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const [openId, setOpenId] = useState<string | null>(visible[0]?.id ?? null);

  return (
    <section aria-label="Manejos e aplicações" className="space-y-3 py-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Manejos e aplicações</h1>
        <p className="text-sm text-ink-500">Princípio ativo e dose em g/ha, do mais recente ao mais antigo.</p>
      </div>
      {visible.length === 0 ? (
        <EmptyState title="Nenhuma aplicação nesta cultura">
          O filtro do topo está restringindo a lista. Selecione Todas para ver a safra completa.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            const open = openId === item.id;
            const culturePlots = plots.filter((plot) => plot.culture === item.culture);
            const coversCulture =
              culturePlots.length > 0 && culturePlots.every((plot) => item.plotIds.includes(plot.id));
            const numbers = item.plotIds.map((id) => getPlot(id).number);
            const joined = numbers.join(", ").replace(/, ([^,]*)$/, " e $1");
            const plotLabel = coversCulture
              ? item.culture
              : numbers.length === 1
                ? `Parcela ${joined}`
                : `Parcelas ${joined}`;
            return (
              <article key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-card">
                <h2>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`manejo-${item.id}`}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="w-full px-4 py-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-leaf-100 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-leaf-800">
                          {item.stageLabel}
                        </span>
                        <p className="mt-2 text-base font-extrabold leading-tight text-ink-900">{item.target}</p>
                        <p className="mt-1 text-sm font-semibold text-ink-700">{item.activeIngredient}</p>
                        <p className="mt-1 text-xs font-semibold text-ink-500">
                          {formatDateTime(item.date)} · {plotLabel}
                        </p>
                      </div>
                      <ChevronDown
                        aria-hidden="true"
                        className={cx("mt-1 h-5 w-5 shrink-0 text-ink-500 transition", open && "rotate-180")}
                      />
                    </div>
                    <div className="mt-3">
                      <WeatherChips {...item.weather} />
                    </div>
                  </button>
                </h2>
                {open ? (
                  <div id={`manejo-${item.id}`} className="border-t border-leaf-100 px-4 py-3">
                    <p className="mb-3 text-sm text-ink-700">{item.note}</p>
                    <div>
                      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-[11px] leading-tight">
                        <caption className="sr-only">
                          Princípio ativo, dose, calda e estádio de {item.target}
                        </caption>
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wide text-ink-500">
                            <th scope="col" className="w-[34%] border-b border-leaf-100 pb-2 pr-2 font-bold">
                              Princípio ativo
                            </th>
                            <th scope="col" className="w-[22%] border-b border-leaf-100 pb-2 pr-2 font-bold">
                              Dose (g/ha)
                            </th>
                            <th scope="col" className="w-[24%] border-b border-leaf-100 pb-2 pr-2 font-bold">
                              Volume de calda (L/ha)
                            </th>
                            <th scope="col" className="w-[20%] border-b border-leaf-100 pb-2 font-bold">
                              Estádio fenológico
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row" className="py-2 pr-2 font-extrabold text-ink-900">
                              {item.activeIngredient}
                            </th>
                            <td className="py-2 pr-2 text-ink-700">{formatGramsPerHa(item.doseGramsPerHa)}</td>
                            <td className="py-2 pr-2 text-ink-700">{formatLitersPerHa(item.sprayVolumeLPerHa)}</td>
                            <td className="py-2 font-bold text-leaf-800">{item.stageLabel}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
