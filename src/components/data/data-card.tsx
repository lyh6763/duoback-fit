import type { ReactNode } from "react";

/** 데이터 레이어의 컨테이너. 흰 배경 + 헤어라인 보더, 그림자 없음. */
export function DataCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-data border border-data-line bg-data-surface px-5 py-4 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-baseline justify-between gap-4">
          {title && <DataLabel>{title}</DataLabel>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function DataLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium tracking-label text-data-label">{children}</p>;
}
