import type { ReactNode } from "react";
import { cx } from "../lib/format";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
  tone?: "dark" | "light";
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  tone = "light",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        "grid rounded-2xl p-1",
        tone === "dark" ? "bg-black/20" : "bg-leaf-100",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              "min-h-10 rounded-xl px-2 py-1.5 text-sm font-semibold transition",
              selected
                ? tone === "dark"
                  ? "bg-white text-leaf-800 shadow-sm"
                  : "bg-leaf-700 text-white shadow-sm"
                : tone === "dark"
                  ? "text-white/80 hover:text-white"
                  : "text-leaf-800 hover:bg-white/70",
            )}
          >
            <span className="block leading-tight">{option.label}</span>
            {option.hint ? (
              <span className={cx("block text-[10px] font-medium", selected ? "opacity-80" : "opacity-60")}>
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-leaf-300 bg-white px-4 py-10 text-center">
      <p className="text-base font-bold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{children}</p>
    </div>
  );
}
