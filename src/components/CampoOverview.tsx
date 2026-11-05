import type { Culture } from "../types";
import { phenologyStages } from "../data/mock";

interface CampoOverviewProps {
  sojaStage: string;
  milhoStage: string;
  valuesVisible: boolean;
}

function hidden(value: string, visible: boolean) {
  return visible ? value : "••••";
}

function progressOf(culture: Culture, code: string) {
  const stages = phenologyStages.filter((stage) => stage.culture === culture);
  const index = Math.max(0, stages.findIndex((stage) => stage.code === code));
  const current = stages[index];
  return {
    code: current?.code ?? code,
    name: current?.name ?? "",
    step: index + 1,
    total: stages.length,
    percent: stages.length ? ((index + 1) / stages.length) * 100 : 0,
  };
}

const cultures: Array<{ culture: Culture; label: string; bar: string }> = [
  { culture: "soja", label: "Soja", bar: "bg-leaf-700" },
  { culture: "milho", label: "Milho", bar: "bg-sun-400" },
];

export function CampoOverview({ sojaStage, milhoStage, valuesVisible }: CampoOverviewProps) {
  const stages = { soja: sojaStage, milho: milhoStage };

  return (
    <section
      aria-label="Visão do talhão"
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_16px_36px_-24px_rgba(30,58,43,0.55)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-leaf-700">Visão do talhão</p>
      <p className="mt-1 text-[11px] leading-snug text-ink-500">
        Soja pela Embrapa (Fehr e Caviness, 1977). Milho pela Kansas State University (Ritchie, Hanway e Benson, 1993).
      </p>
      <ul className="mt-4 space-y-5">
        {cultures.map((item) => {
          const progress = progressOf(item.culture, stages[item.culture]);
          return (
            <li key={item.culture}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-ink-500">{item.label}</p>
                <p className="text-lg font-semibold tracking-tight text-ink-900">{hidden(progress.code, valuesVisible)}</p>
              </div>
              <p className="mt-0.5 text-sm text-ink-700">{hidden(progress.name, valuesVisible)}</p>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={progress.total}
                aria-valuenow={valuesVisible ? progress.step : undefined}
                aria-label={`${item.label} em ${progress.code}`}
              >
                <div
                  className={`h-full rounded-full ${item.bar}`}
                  style={{ width: valuesVisible ? `${progress.percent}%` : "0%" }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-ink-500">
                {hidden(`${progress.step} de ${progress.total} estádios`, valuesVisible)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
