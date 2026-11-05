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
        "overflow-hidden rounded-2xl border bg-white shadow-[0_12px_28px_-22px_rgba(30,58,43,0.45)] transition-all duration-200 hover:bg-slate-50",
        highlighted ? "border-sun-400" : "border-slate-100",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <span className="min-w-0">
          <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", meta.className)}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
            Nova atividade
          </span>
          <span className="mt-1.5 block text-xs font-medium text-ink-500">{feedCategoryLabel[update.kind]}</span>
        </span>
        <time dateTime={update.datetime} className="text-right text-[11px] font-medium text-ink-300">
          {formatDateTime(update.datetime)}
        </time>
      </div>
      <p className="px-4 pb-3 pt-2 text-sm font-semibold tracking-tight text-ink-900">
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
      <div className="space-y-3 px-4 pb-4 pt-3">
        <ul className="flex flex-wrap gap-1.5">
          {update.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-leaf-50 px-2 py-1 text-[11px] font-medium text-leaf-800">
              {tag}
            </li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-ink-700">{update.text}</p>
      </div>
      <div className="flex border-t border-slate-100">
          <button
            type="button"
            onClick={onToggleLike}
            aria-pressed={liked}
            aria-label={`${likeLabel}, ${update.likes} curtidas`}
            className={cx(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium transition-all duration-200 active:scale-95",
              liked ? "text-rose-700" : "text-ink-700 hover:bg-slate-50",
            )}
          >
            <Heart className={cx("h-4 w-4", liked && "fill-current")} aria-hidden="true" strokeWidth={1.5} />
            {liked ? "Curtido" : "Curtir"}
            <span className="tabular-nums text-ink-900">{update.likes}</span>
          </button>
          <button
            type="button"
            onClick={onAsk}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 border-l border-slate-100 text-sm font-medium text-leaf-800 transition-all duration-200 hover:bg-slate-50 active:scale-95"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.5} />
            Dúvida ao agrônomo
          </button>
      </div>
    </article>
  );
}
