import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-rose-400 to-rose-deep text-white shadow-rose hover:brightness-105 active:brightness-95 disabled:from-rose-200 disabled:to-rose-300 disabled:shadow-none",
  secondary: "border border-line-strong bg-paper text-ink hover:bg-rose-50 hover:border-rose-200",
  ghost: "text-muted hover:bg-rose-50 hover:text-ink",
  danger: "bg-danger text-white hover:brightness-110 shadow-[0_10px_24px_-10px_rgb(192_57_43/0.6)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-[15px] gap-2 rounded-2xl",
  lg: "h-13 px-6 text-base gap-2 rounded-2xl",
};

export function buttonClass({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex select-none items-center justify-center font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100",
    variants[variant],
    sizes[size],
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant, size, loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={buttonClass({ variant, size, className })} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
