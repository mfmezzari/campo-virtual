import type { ReactNode } from "react";

export const controlClass =
  "min-h-11 w-full rounded-lg border border-slate-200/80 bg-white px-3 text-sm font-medium text-ink-900 outline-none transition-all duration-150 hover:border-slate-300 focus:border-leaf-600";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function SubmitButton({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="min-h-11 w-full rounded-lg bg-leaf-800 text-sm font-semibold text-white transition-all duration-150 hover:bg-leaf-700 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function Status({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-leaf-200 bg-leaf-50 px-3 py-3 text-sm font-medium text-leaf-800" role="status">
      {children}
    </p>
  );
}
