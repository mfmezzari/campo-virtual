import { Newspaper, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TabId } from "../types";
import { cx } from "../lib/format";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: Exclude<TabId, "phenology">) => void;
}

const items: Array<{ id: Exclude<TabId, "phenology">; label: string; icon: LucideIcon }> = [
  { id: "feed", label: "Feed", icon: Newspaper },
  { id: "live", label: "Ao Vivo", icon: Radio },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Seções do campo virtual"
      className="z-20 border-t border-slate-200/80 bg-white px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1"
    >
      <ul className="grid grid-cols-2">
        {items.map((item) => {
          const selected = active === item.id;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={selected ? "page" : undefined}
                className={cx(
                  "flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-lg px-0.5 text-[10px] font-medium leading-none tracking-tight",
                  selected ? "text-leaf-800" : "text-ink-500 hover:text-ink-700",
                )}
              >
                <span className={cx("grid h-7 w-8 place-items-center rounded-md", selected && "bg-leaf-100 text-leaf-800")}>
                  <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
