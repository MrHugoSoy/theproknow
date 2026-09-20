import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-blue-700 shadow-sm",
  secondary: "bg-white text-ink border border-line hover:bg-surface shadow-sm",
  outline: "border border-brand/40 text-brand hover:bg-brand-soft",
  ghost: "text-muted hover:bg-surface hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

/** Clases de botón reutilizables también para <Link>. */
export function buttonStyles(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant, size, className, type = "button", ...rest }: Props) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...rest} />;
}
