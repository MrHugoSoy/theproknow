import { cn, initials } from "@/lib/utils";

const PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
} as const;

type Props = {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
  ring?: boolean;
};

export function Avatar({ name, src, size = "md", className, ring }: Props) {
  const base = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
    SIZES[size],
    ring && "ring-2 ring-white",
    className,
  );
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn(base, "object-cover")} />;
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(base, PALETTE[hash(name) % PALETTE.length])}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ people }: { people: { name: string; src?: string | null }[] }) {
  return (
    <span className="flex -space-x-2">
      {people.map((p) => (
        <Avatar key={p.name} name={p.name} src={p.src} size="xs" ring />
      ))}
    </span>
  );
}
