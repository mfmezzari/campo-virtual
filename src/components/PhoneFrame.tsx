import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,_#24543a,_#0e1c16_58%)] md:p-4">
      <div
        data-phone-frame
        className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-leaf-50 md:h-[min(920px,calc(100dvh-2rem))] md:rounded-[2rem] md:shadow-frame"
      >
        {children}
      </div>
    </div>
  );
}
