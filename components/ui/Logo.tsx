import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  tagline?: boolean;
  /** "dark" = sobre fondo navy (The/Pro en blanco); "light" = sobre blanco */
  tone?: "dark" | "light";
  className?: string;
};

export function Logo({ tagline = true, tone = "dark", className }: Props) {
  return (
    <Link href="/" aria-label="TheProKnow, ir al inicio" className={cn("inline-block leading-none", className)}>
      <span className="block text-[26px] font-extrabold tracking-tight">
        <span className={tone === "dark" ? "text-white" : "text-navy"}>ThePro</span>
        <span className="text-brand-bright">Know</span>
      </span>
      {tagline ? (
        <span
          className={cn(
            "mt-0.5 block text-[11px] font-medium",
            tone === "dark" ? "text-slate-300" : "text-muted",
          )}
        >
          Aprende de quienes saben
        </span>
      ) : null}
    </Link>
  );
}
