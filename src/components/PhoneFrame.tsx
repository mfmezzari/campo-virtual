import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#E7E8E4] md:p-4">
      <div
        data-phone-frame
        className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-[#F4F5F0] md:h-[min(920px,calc(100dvh-2rem))] md:rounded-2xl md:border md:border-slate-100 md:shadow-frame"
      >
        {children}
      </div>
    </div>
  );
}
