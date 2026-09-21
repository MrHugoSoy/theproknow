import Link from "next/link";
import { Star } from "lucide-react";
import { FollowButton } from "@/components/feed/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StickyAside } from "./StickyAside";
import { getLevel } from "@/lib/reputation";
import type { Expert, Trend } from "@/lib/data/sidebar";
import type { Viewer } from "@/lib/data/viewer";
import { formatNumber } from "@/lib/utils";

export type SidebarRightProps = {
  me: Pick<Viewer, "username" | "displayName" | "avatarUrl" | "reputation" | "posts" | "followers" | "following"> | null;
  experts: Expert[];
  trends: Trend[];
};

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      <Link href={href} className="text-[13px] font-medium text-brand hover:underline">
        Ver todos
      </Link>
    </div>
  );
}

function QuoteCard() {
  return (
    <figure
      className="relative overflow-hidden rounded-card p-6 text-white shadow-card"
      style={{ background: "linear-gradient(135deg,#0B1B3B 0%,#1e3a8a 55%,#3b6fd8 100%)" }}
    >
      <svg aria-hidden viewBox="0 0 400 120" className="absolute inset-x-0 bottom-0 w-full opacity-30" preserveAspectRatio="none">
        <path d="M0 120 L70 50 L110 85 L190 15 L260 80 L320 40 L400 100 L400 120 Z" fill="#fff" />
      </svg>
      <blockquote className="relative text-[22px] font-medium italic leading-snug">
        “El conocimiento no compite, se comparte.”
      </blockquote>
    </figure>
  );
}

function JoinCard() {
  return (
    <Card className="p-5 text-center">
      <h2 className="text-[15px] font-bold text-ink">Únete a TheProKnow</h2>
      <p className="mt-1 text-sm text-muted">Sigue a expertos, guarda consejos y comparte lo que sabes.</p>
      <Link href="/registro" className={buttonStyles("primary", "md", "mt-4 w-full")}>
        Crear cuenta
      </Link>
      <Link href="/login" className="mt-2 block text-[13px] font-medium text-brand hover:underline">
        Ya tengo cuenta
      </Link>
    </Card>
  );
}

function ProfileCard({ me }: { me: NonNullable<SidebarRightProps["me"]> }) {
  const lvl = getLevel(me.reputation);
  const stats = [
    { label: "Consejos", value: me.posts },
    { label: "Seguidores", value: me.followers },
    { label: "Siguiendo", value: me.following },
  ];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Avatar name={me.displayName} src={me.avatarUrl} size="xl" />
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink">{me.displayName}</p>
          <p className="truncate text-[13px] text-muted">@{me.username}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 divide-x divide-line text-center">
        {stats.map((s) => (
          <div key={s.label} className="px-1">
            <dd className="text-lg font-bold text-ink">{formatNumber(s.value)}</dd>
            <dt className="text-xs text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-xl bg-surface p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-ink">Tu reputación</span>
          <span className="text-sm font-bold text-brand">
            {formatNumber(me.reputation)} <span className="text-xs font-medium">pts</span>
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Progreso hacia el siguiente nivel"
          aria-valuenow={lvl.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
        >
          <div className="h-full rounded-full bg-brand" style={{ width: `${lvl.progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted">
            {lvl.name} · Nivel {lvl.level}
          </span>
          <Link href={`/u/${me.username}`} className="font-medium text-brand hover:underline">
            Ver perfil →
          </Link>
        </div>
      </div>
    </Card>
  );
}

function TopExperts({ experts }: { experts: SidebarRightProps["experts"] }) {
  return (
    <Card className="p-5">
      <SectionHeader title="Expertos destacados" href="/explorar" />
      {experts.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Aún no hay expertos destacados.</p>
      ) : null}
      <ul className="mt-3 space-y-3">
        {experts.map((e) => (
          <li key={e.username} className="flex items-center gap-3">
            <Avatar name={e.displayName} src={e.avatarUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <Link href={`/u/${e.username}`} className="block truncate text-sm font-semibold text-ink hover:underline">
                {e.displayName}
              </Link>
              <p className="truncate text-xs text-muted">{e.area}</p>
              <p className="flex items-center gap-1 text-xs text-muted">
                <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                {formatNumber(e.reputation)} puntos
              </p>
            </div>
            <FollowButton username={e.username} initialFollowing={e.following} variant="solid" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Trends({ trends }: { trends: SidebarRightProps["trends"] }) {
  return (
    <Card className="p-5">
      <SectionHeader title="Tendencias" href="/explorar" />
      {trends.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Aún no hay etiquetas en tendencia. Añade #etiquetas a tus publicaciones para que aparezcan aquí.
        </p>
      ) : (
        <ol className="mt-3 space-y-3">
          {trends.map((t, i) => (
            <li key={t.tag}>
              <Link
                href={`/buscar?q=${encodeURIComponent(`#${t.tag}`)}`}
                className="flex items-center gap-3 rounded-lg hover:bg-surface"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">#{t.tag}</span>
                  <span className="block text-xs text-muted">
                    {formatNumber(t.posts)} {t.posts === 1 ? "publicación" : "publicaciones"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function PublishCta() {
  return (
    <section
      className="overflow-hidden rounded-card border border-line p-5 shadow-card"
      style={{ background: "linear-gradient(160deg,#eaf1ff 0%,#f5f8ff 60%,#ffffff 100%)" }}
    >
      <h2 className="text-lg font-extrabold leading-snug text-ink">
        Comparte tu experiencia.
        <br />
        Inspira a otros.
      </h2>
      <p className="mt-2 max-w-[13rem] text-sm text-muted">
        Tu conocimiento puede ayudar a miles de personas en todo el mundo.
      </p>
      <Link href="/publicar" className={buttonStyles("primary", "lg", "mt-6 w-full")}>
        Publicar un consejo
      </Link>
    </section>
  );
}

function Footer() {
  const links = [
    { href: "/sobre", label: "Sobre TheProKnow" },
    { href: "/privacidad", label: "Privacidad" },
    { href: "/terminos", label: "Términos" },
    { href: "/contacto", label: "Contacto" },
  ];
  return (
    <footer className="px-1 pb-6 text-xs text-muted">
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-ink hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2">© {new Date().getFullYear()} TheProKnow</p>
    </footer>
  );
}

export function SidebarRight({ me, experts, trends }: SidebarRightProps) {
  return (
    <StickyAside
      aria-label="Complementario"
      className="hidden w-[340px] shrink-0 space-y-4 py-5 pr-4 xl:sticky xl:block xl:self-start"
    >
      <QuoteCard />
      {me ? <ProfileCard me={me} /> : <JoinCard />}
      <TopExperts experts={experts} />
      <Trends trends={trends} />
      <PublishCta />
      <Footer />
    </StickyAside>
  );
}
