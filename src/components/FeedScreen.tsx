import { useEffect } from "react";
import type { CultureFilter, FeedUpdate, TabId } from "../types";
import { getPlot } from "../data/mock";
import { CampoOverview } from "./CampoOverview";
import { EmptyState } from "./SegmentedControl";
import { FeedCard } from "./FeedCard";
import { QuickActions } from "./QuickActions";

interface FeedScreenProps {
  updates: FeedUpdate[];
  culture: CultureFilter;
  likedIds: Set<string>;
  highlightId: string | null;
  sojaStage: string;
  milhoStage: string;
  valuesVisible: boolean;
  onToggleLike: (id: string) => void;
  onAsk: (id: string) => void;
  onOpenTab: (tab: Exclude<TabId, "phenology">) => void;
}

export function FeedScreen({
  updates,
  culture,
  likedIds,
  highlightId,
  sojaStage,
  milhoStage,
  valuesVisible,
  onToggleLike,
  onAsk,
  onOpenTab,
}: FeedScreenProps) {
  const visible = updates.filter(
    (update) => culture === "todas" || update.culture === culture || update.culture === "soja e milho",
  );

  useEffect(() => {
    if (!highlightId) return;
    document.getElementById(`feed-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, culture]);

  return (
    <section aria-label="Linha do tempo técnica" className="space-y-6 py-4">
      <CampoOverview sojaStage={sojaStage} milhoStage={milhoStage} valuesVisible={valuesVisible} />
      <QuickActions onOpenTab={onOpenTab} />
      <div>
        <h2 className="text-base font-semibold leading-tight tracking-tight text-ink-900">Atividades</h2>
        <p className="mt-0.5 text-sm text-ink-500">Vistorias, manejos e atualizações do ensaio.</p>
      </div>
      {visible.length === 0 ? (
        <EmptyState title="Nenhuma atualização nesta cultura">
          Troque o filtro do topo para ver soja, milho ou as duas culturas.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {visible.map((update) => (
            <FeedCard
              key={update.id}
              update={update}
              plot={update.plotId ? getPlot(update.plotId) : null}
              liked={likedIds.has(update.id)}
              highlighted={highlightId === update.id}
              onToggleLike={() => onToggleLike(update.id)}
              onAsk={() => onAsk(update.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
