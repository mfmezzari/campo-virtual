import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, title, description, onClose, children }: BottomSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fechar painel"
        className="absolute inset-0 bg-ink-900/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="sheet-enter relative max-h-[86%] overflow-y-auto rounded-t-2xl border-t border-slate-200/80 bg-white px-5 pb-6 pt-3"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="sheet-title" className="text-lg font-semibold text-ink-900">
              {title}
            </h2>
            {description ? <p className="mt-0.5 text-sm text-ink-500">{description}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200/80 text-ink-700 transition-all duration-150 hover:border-slate-300"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
