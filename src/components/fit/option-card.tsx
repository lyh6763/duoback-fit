"use client";

/**
 * Fit 질문의 답변 카드. 단일 선택은 누르는 즉시 다음 질문으로 넘어가는 "행동" 버튼이고,
 * 복수 선택은 토글 버튼이다. 둘 다 aria-pressed로 현재 선택을 알린다.
 */
export function OptionCard({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-16 w-full items-center justify-between gap-4 rounded-md border px-5 py-4 text-left transition-colors duration-200 ease-standard ${
        selected
          ? "border-2 border-primary bg-primary-subtle text-moss-700"
          : "border-line bg-elevated hover:border-stone-500"
      }`}
    >
      <span>
        <span className="block text-md font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`grid size-6 shrink-0 place-items-center rounded-full border text-sm ${
          selected ? "border-primary bg-primary text-inverse" : "border-line"
        }`}
      >
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}
