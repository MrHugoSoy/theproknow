import { cn } from "@/lib/utils";

export function Card({
  className,
  as: Tag = "section",
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: "section" | "article" | "div" | "aside" }) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-line bg-white shadow-card",
        className,
      )}
      {...rest}
    />
  );
}
