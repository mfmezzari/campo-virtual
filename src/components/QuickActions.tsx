import { CloudSun, Droplets, Images, Map } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TabId } from "../types";

const shortcuts: Array<{ id: Exclude<TabId, "phenology">; label: string; icon: LucideIcon }> = [
  { id: "photos", label: "Fotos", icon: Images },
  { id: "manejos", label: "Manejos", icon: Droplets },
  { id: "clima", label: "Clima", icon: CloudSun },
  { id: "croqui", label: "Croqui", icon: Map },
];

interface QuickActionsProps {
  onOpenTab: (tab: Exclude<TabId, "phenology">) => void;
}

export function QuickActions({ onOpenTab }: QuickActionsProps) {
  return (
    <section aria-label="Atalhos do campo">
      <ul className="flex justify-between gap-3">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onOpenTab(item.id)}
                className="flex w-full flex-col items-center gap-2 text-ink-500 transition-all duration-200 hover:text-ink-900 active:scale-95"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full border border-slate-100 bg-white text-leaf-800 shadow-[0_8px_20px_-14px_rgba(30,58,43,0.6)] transition-all duration-200 hover:bg-slate-50">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
