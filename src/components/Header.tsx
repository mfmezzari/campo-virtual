import { Bell, Eye, EyeOff } from "lucide-react";
import type { CultureFilter } from "../types";
import { fieldMeta } from "../data/mock";
import { SegmentedControl } from "./SegmentedControl";

interface HeaderProps {
  culture: CultureFilter;
  unreadCount: number;
  valuesVisible: boolean;
  onCultureChange: (culture: CultureFilter) => void;
  onOpenNotifications: () => void;
  onToggleValues: () => void;
}

const cultureOptions: Array<{ value: CultureFilter; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "soja", label: "Soja" },
  { value: "milho", label: "Milho" },
];

function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const iconButton =
  "grid h-8 w-8 place-items-center rounded-full text-ink-900 transition-all duration-200 hover:bg-white active:scale-95";

export function Header({
  culture,
  unreadCount,
  valuesVisible,
  onCultureChange,
  onOpenNotifications,
  onToggleValues,
}: HeaderProps) {
  const VisibilityIcon = valuesVisible ? Eye : EyeOff;

  return (
    <header className="z-20 bg-[#F4F5F0] px-5 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-900/10 bg-leaf-800 text-sm font-semibold text-white"
            aria-hidden="true"
          >
            CV
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium leading-none text-ink-500">{fieldMeta.title}</p>
            <h1 className="mt-1 text-[17px] font-semibold leading-none tracking-tight text-ink-900">{greeting()}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleValues}
            aria-pressed={valuesVisible}
            aria-label={valuesVisible ? "Ocultar métricas do talhão" : "Mostrar métricas do talhão"}
            className={iconButton}
          >
            <VisibilityIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`${iconButton} relative`}
            aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} atividades sem leitura` : "Notificações"}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {unreadCount > 0 ? (
              <span className="absolute right-0 top-0 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-sun-400 px-1 text-[9px] font-semibold leading-none text-ink-900">
                {unreadCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      <SegmentedControl
        className="mt-4 border-slate-100 bg-white"
        label="Filtrar por cultura"
        value={culture}
        options={cultureOptions}
        onChange={onCultureChange}
      />
    </header>
  );
}
