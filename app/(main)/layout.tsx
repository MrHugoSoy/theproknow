import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { getTopExperts, getTrendingTags } from "@/lib/data/sidebar";
import { getCommunities, getViewer } from "@/lib/data/viewer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const [communities, experts, trends] = await Promise.all([
    getCommunities(),
    getTopExperts(viewer?.id ?? null),
    getTrendingTags(),
  ]);
  const username = viewer?.username ?? null;
  const unread = viewer?.unreadNotifications ?? 0;

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Navbar viewer={viewer} />
      <div className="mx-auto flex max-w-[1400px] justify-center">
        <SidebarLeft username={username} unreadNotifications={unread} communities={communities} />
        <main id="contenido" className="min-w-0 max-w-[680px] flex-1 px-3 pb-24 pt-5 md:px-4 md:pb-8">
          {children}
        </main>
        <SidebarRight me={viewer} experts={experts} trends={trends} />
      </div>
      <BottomNav username={username} unreadNotifications={unread} />
    </>
  );
}
