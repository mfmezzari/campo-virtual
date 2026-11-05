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
        "grid rounded-lg border border-slate-200/80 bg-slate-50 p-1",
        tone === "dark" ? "border-white/10 bg-white/10" : "",
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
              "min-h-9 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-150",
              selected
                ? "bg-leaf-800 text-white shadow-sm"
                : tone === "dark"
                  ? "text-white/80 hover:text-white"
                  : "text-ink-500 hover:bg-slate-50 hover:text-ink-900",
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

function FieldLineArt() {
  return (
    <svg viewBox="0 0 72 56" className="mx-auto h-14 w-16 text-leaf-800" fill="none" aria-hidden="true">
      <path d="M12 46h48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 46V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 34c-8-2-14-9-14-16 8 1 14 7 14 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M36 30c8-1 16-7 16-15-9 1-16 7-16 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M22 46c1.5-5 5-8 14-8s12.5 3 14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center">
      <FieldLineArt />
      <p className="mt-3 text-sm font-semibold tracking-tight text-ink-900">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-ink-500">{children}</p>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-lg bg-slate-200/80", className)} />;
}
