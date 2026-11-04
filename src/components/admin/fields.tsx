import type { ReactNode } from "react";

export const controlClass =
  "w-full min-h-11 rounded-2xl border border-leaf-200 bg-white px-3 text-sm text-ink-900 outline-none ring-leaf-500 focus:ring-2";

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
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-bold text-ink-900">
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
      className="min-h-11 w-full rounded-2xl bg-leaf-700 text-sm font-extrabold text-white disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function Status({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-leaf-100 px-3 py-3 text-sm font-semibold text-leaf-800" role="status">
      {children}
    </p>
  );
}
