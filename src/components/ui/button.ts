type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "s" | "m" | "l";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 ease-standard disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-inverse hover:bg-primary-hover",
  secondary: "border border-ink text-ink hover:bg-elevated",
  ghost: "text-ink underline-offset-4 hover:underline",
};

const SIZE: Record<ButtonSize, string> = {
  s: "h-9 px-4 text-sm",
  m: "h-11 px-5 text-md",
  l: "h-13 px-6 text-md",
};

/** <button>과 <Link>에 같은 스타일을 쓰기 위한 클래스 생성기 */
export function buttonClass({
  variant = "primary",
  size = "m",
  fullWidth = false,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean } = {}) {
  return [BASE, VARIANT[variant], SIZE[size], fullWidth ? "w-full" : ""].join(" ");
}
