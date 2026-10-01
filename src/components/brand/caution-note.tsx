import type { ReactNode } from "react";

export function CautionNote({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-[3px] border-warning-icon bg-warning-bg px-4 py-3 text-sm font-medium text-warning">
      {children}
    </p>
  );
}
