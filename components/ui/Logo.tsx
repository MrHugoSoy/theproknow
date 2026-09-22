import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

type Props = {
  tagline?: boolean;
  /** "dark" = sobre fondo navy (logo en blanco); "light" = sobre blanco (logo en tinta oscura) */
  tone?: "dark" | "light";
  className?: string;
};

export function Logo({ tagline = true, tone = "dark", className }: Props) {
  return (
    <Link href="/" aria-label="TheProKnow, ir al inicio" className={cn("inline-block leading-none", className)}>
      <LogoMark className={cn("h-6 w-auto sm:h-7", tone === "dark" ? "text-white" : "text-navy")} />
      {tagline ? (
        <span
          className={cn(
            "mt-1 block text-[11px] font-medium",
            tone === "dark" ? "text-slate-300" : "text-muted",
          )}
        >
          Aprende de quienes saben
        </span>
      ) : null}
    </Link>
  );
}
