import { CalendarDays, ClipboardCheck, FlaskConical, Heart, MessageCircle, Shovel, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FeedKind, FeedUpdate, Plot } from "../types";
import { feedCategoryLabel } from "../lib/feed";
import { cx, formatDateTime } from "../lib/format";
import { FieldImage } from "./FieldImage";

const kindMeta: Record<FeedKind, { className: string; icon: LucideIcon }> = {
  "Vistoria de rotina": { className: "bg-leaf-700 text-white", icon: ClipboardCheck },
  "Manejo fitossanitário": { className: "bg-leaf-100 text-leaf-800", icon: Sprout },
  "Organização de evento": { className: "bg-sun-400 text-ink-900", icon: CalendarDays },
  "Aplicação de fertilizantes": { className: "bg-sun-100 text-sun-700", icon: FlaskConical },
  Plantio: { className: "bg-leaf-800 text-white", icon: Shovel },
};

interface FeedCardProps {
  update: FeedUpdate;
  plot: Plot | null;
  liked: boolean;
  highlighted: boolean;
  onToggleLike: () => void;
  onAsk: () => void;
}

export function FeedCard({ update, plot, liked, highlighted, onToggleLike, onAsk }: FeedCardProps) {
  const meta = kindMeta[update.kind];
  const Icon = meta.icon;
  const likeLabel = liked ? "Descurtir" : "Curtir";

  return (
    <article
      id={`feed-${update.id}`}
      className={cx(
        "overflow-hidden rounded-3xl border bg-white shadow-card",
        highlighted ? "border-sun-400" : "border-white",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <span className="min-w-0">
          <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold", meta.className)}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
            Nova atividade
          </span>
          <span className="mt-1 block text-xs font-bold text-ink-500">{feedCategoryLabel[update.kind]}</span>
        </span>
        <time dateTime={update.datetime} className="text-right text-xs font-semibold text-ink-500">
          {formatDateTime(update.datetime)}
        </time>
      </div>
      <p className="px-4 pb-3 pt-2 text-sm font-bold text-ink-900">
        {plot ? (
          <>
            Parcela {plot.number}
            <span className="font-semibold text-ink-500"> · {plot.name}</span>
          </>
        ) : (
          update.culture
        )}
      </p>
      <FieldImage
        src={update.image}
        alt={plot ? `Foto de campo da parcela ${plot.number}, ${plot.name}` : `Foto de campo de ${update.culture}`}
        className="h-44 w-full object-cover"
      />
      <div className="space-y-3 px-4 py-3">
        <ul className="flex flex-wrap gap-1.5">
          {update.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-leaf-50 px-2 py-1 text-xs font-bold text-leaf-800">
              {tag}
            </li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-ink-700">{update.text}</p>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={onToggleLike}
            aria-pressed={liked}
            aria-label={`${likeLabel}, ${update.likes} curtidas`}
            className={cx(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-extrabold",
              liked ? "bg-rose-50 text-rose-600" : "bg-leaf-50 text-ink-700",
            )}
          >
            <Heart className={cx("h-4 w-4", liked && "fill-current")} aria-hidden="true" />
            {liked ? "Curtido" : "Curtir"}
            <span className="min-w-6 rounded-full bg-white/80 px-1.5 text-center tabular-nums text-ink-900">
              {update.likes}
            </span>
          </button>
          <button
            type="button"
            onClick={onAsk}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-leaf-200 bg-white px-2 text-sm font-extrabold text-leaf-800"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Dúvida ao agrônomo
          </button>
        </div>
      </div>
    </article>
  );
}
