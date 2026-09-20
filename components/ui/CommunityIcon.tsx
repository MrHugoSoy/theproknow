import {
  Bot,
  Briefcase,
  Camera,
  Hammer,
  Palette,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, { Icon: LucideIcon; tone: string }> = {
  palette: { Icon: Palette, tone: "bg-slate-100 text-slate-700" },
  camera: { Icon: Camera, tone: "bg-sky-100 text-sky-700" },
  bot: { Icon: Bot, tone: "bg-indigo-100 text-indigo-700" },
  briefcase: { Icon: Briefcase, tone: "bg-amber-100 text-amber-800" },
  hammer: { Icon: Hammer, tone: "bg-orange-100 text-orange-700" },
  zap: { Icon: Zap, tone: "bg-blue-100 text-blue-700" },
};

export function CommunityIcon({ icon, className }: { icon: string; className?: string }) {
  const { Icon, tone } = ICONS[icon] ?? { Icon: Users, tone: "bg-slate-100 text-slate-700" };
  return (
    <span
      aria-hidden
      className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", tone, className)}
    >
      <Icon className="size-4" />
    </span>
  );
}
