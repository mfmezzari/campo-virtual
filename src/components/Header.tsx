import { Bell, Leaf } from "lucide-react";
import type { CultureFilter } from "../types";
import { fieldMeta } from "../data/mock";
import { SegmentedControl } from "./SegmentedControl";

interface HeaderProps {
  culture: CultureFilter;
  unreadCount: number;
  onCultureChange: (culture: CultureFilter) => void;
  onOpenNotifications: () => void;
}

const cultureOptions: Array<{ value: CultureFilter; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "soja", label: "Soja" },
  { value: "milho", label: "Milho" },
];

export function Header({ culture, unreadCount, onCultureChange, onOpenNotifications }: HeaderProps) {
  return (
    <header className="z-20 bg-leaf-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf-600">
          <Leaf aria-hidden="true" className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-extrabold leading-tight">{fieldMeta.title}</p>
          <p className="mt-0.5 text-[11px] font-medium leading-snug text-white/75">{fieldMeta.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10"
          aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} atividades sem leitura` : "Notificações"}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-sun-400 px-1 text-[10px] font-extrabold text-ink-900">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </div>
      <SegmentedControl
        className="mt-3"
        tone="dark"
        label="Filtrar por cultura"
        value={culture}
        options={cultureOptions}
        onChange={onCultureChange}
      />
    </header>
  );
}
