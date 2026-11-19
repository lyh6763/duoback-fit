"use client";

/**
 * Fit 복수 선택 질문(불편한 곳)의 답변 카드. 누를 때마다 켜고 끄는 토글 버튼이고 aria-pressed로 현재 선택을 알린다.
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
          ? "border-2 border-primary bg-primary-subtle text-on-primary-subtle"
          : "border-line bg-elevated hover:border-line-hover"
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

/**
 * Fit 단일 선택 질문의 답변 카드. 카드 전체가 네이티브 라디오의 label이라 누르거나 방향키로 옮기면 고르기만 하고,
 * 다음 질문으로는 폼의 "다음" 버튼으로 넘어간다. 같은 name의 라디오는 Tab 한 번으로 묶음에 들어가고 나온다.
 * 선택과 포커스 모양은 카드가 :has(:checked)·:has(:focus-visible)로 그린다.
 */
export function OptionRadio({
  name,
  value,
  label,
  description,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 rounded-md border border-line bg-elevated px-5 py-4 text-left transition-colors duration-200 ease-standard hover:border-line-hover has-checked:border-2 has-checked:border-primary has-checked:bg-primary-subtle has-checked:text-on-primary-subtle has-checked:hover:border-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
      <span>
        <span className="block text-md font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
      {/* 고대비 모드에서는 배경색이 지워지므로 브라우저 기본 라디오로 되돌린다 */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="size-6 shrink-0 cursor-pointer appearance-none rounded-full border border-line bg-elevated outline-hidden checked:border-2 checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_4px_var(--color-elevated)] forced-colors:appearance-auto"
      />
    </label>
  );
}
