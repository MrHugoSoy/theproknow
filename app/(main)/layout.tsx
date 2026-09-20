import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { getCommunities, getViewer } from "@/lib/data/viewer";
import { MOCK_EXPERTS, MOCK_TRENDS } from "@/lib/mock";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [viewer, communities] = await Promise.all([getViewer(), getCommunities()]);
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
        {/* Expertos y tendencias siguen con datos mock hasta las fases 3 y 5 */}
        <SidebarRight me={viewer} experts={MOCK_EXPERTS} trends={MOCK_TRENDS} />
      </div>
      <BottomNav username={username} unreadNotifications={unread} />
    </>
  );
}
