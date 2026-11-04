import { useEffect, useMemo, useRef, useState } from "react";
import type { Culture } from "../types";
import { phenologyStages } from "../data/mock";
import { cx } from "../lib/format";
import { FieldImage } from "./FieldImage";
import { SegmentedControl } from "./SegmentedControl";

interface PhenologyViewProps {
  initialCulture: Culture;
  currentStageByCulture: Record<Culture, string>;
}

export function PhenologyView({ initialCulture, currentStageByCulture }: PhenologyViewProps) {
  const [culture, setCulture] = useState<Culture>(initialCulture);
  const stages = useMemo(
    () => phenologyStages.filter((stage) => stage.culture === culture),
    [culture],
  );
  const currentId = currentStageByCulture[culture];
  const currentIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === currentId),
  );
  const current = stages[currentIndex];
  const progress = ((currentIndex + 1) / stages.length) * 100;
  const currentRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = currentRef.current;
    const scroller = scrollerRef.current;
    if (!card || !scroller) return;
    const left = card.offsetLeft - (scroller.clientWidth - card.clientWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left) });
  }, [culture, currentId]);

  return (
    <section aria-label="Estádios fenológicos" className="space-y-4 py-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Estádios fenológicos</h1>
        <p className="text-sm text-ink-500">
          {culture === "soja" ? "Escala Fehr & Caviness" : "Escala Ritchie & Hanway"}
        </p>
      </div>

      <SegmentedControl
        label="Escala fenológica"
        value={culture}
        onChange={setCulture}
        options={[
          { value: "soja", label: "Soja", hint: "Fehr & Caviness" },
          { value: "milho", label: "Milho", hint: "Ritchie & Hanway" },
        ]}
      />

      <div className="rounded-3xl bg-leaf-800 p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-white/70">Estádio atual do campo</p>
        <p className="mt-1 text-lg font-extrabold">
          {culture === "soja" ? "Soja" : "Milho"} atualmente em {current.code}
        </p>
        <p className="text-sm text-white/80">{current.name}</p>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={stages.length}
          aria-valuenow={currentIndex + 1}
          aria-label={`Progresso até ${current.code}`}
        >
          <div className="h-full rounded-full bg-sun-400" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs font-semibold text-white/70">
          {currentIndex + 1} de {stages.length} estádios da escala
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-sm font-extrabold text-ink-900">Deslize para comparar os estádios</h2>
        </div>
        <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const isCurrent = stage.id === current.id;
            return (
              <article
                key={stage.id}
                ref={isCurrent ? currentRef : undefined}
                className={cx(
                  "w-[84%] shrink-0 snap-center overflow-hidden rounded-3xl bg-white shadow-card",
                  isCurrent && "ring-2 ring-sun-400",
                )}
              >
                <div className="relative">
                  <FieldImage
                    src={stage.image}
                    alt={`Ilustração do estádio ${stage.code}, ${stage.name}`}
                    className="h-40 w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-sm font-extrabold text-white">
                    {stage.code}
                  </span>
                  {isCurrent ? (
                    <span className="absolute right-3 top-3 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-extrabold text-ink-900">
                      Atual
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 px-4 py-4">
                  <h3 className="text-base font-extrabold text-ink-900">{stage.name}</h3>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-leaf-700">O que observar</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-700">{stage.observe}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-sun-700">Recomendação</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-700">{stage.recommendation}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
