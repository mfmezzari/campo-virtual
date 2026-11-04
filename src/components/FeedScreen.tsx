import { useEffect } from "react";
import type { CultureFilter, FeedUpdate } from "../types";
import { getPlot } from "../data/mock";
import { EmptyState } from "./SegmentedControl";
import { FeedCard } from "./FeedCard";

interface FeedScreenProps {
  updates: FeedUpdate[];
  culture: CultureFilter;
  likedIds: Set<string>;
  highlightId: string | null;
  onToggleLike: (id: string) => void;
  onAsk: (id: string) => void;
}

export function FeedScreen({ updates, culture, likedIds, highlightId, onToggleLike, onAsk }: FeedScreenProps) {
  const visible = updates.filter(
    (update) => culture === "todas" || update.culture === culture || update.culture === "soja e milho",
  );

  useEffect(() => {
    if (!highlightId) return;
    document.getElementById(`feed-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, culture]);

  return (
    <section aria-label="Linha do tempo técnica" className="space-y-3 py-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Linha do tempo</h1>
        <p className="text-sm text-ink-500">Atualizações técnicas do talhão, da mais recente para a mais antiga.</p>
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
