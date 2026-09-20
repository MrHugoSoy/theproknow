import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import {
  MOCK_COMMUNITIES,
  MOCK_EXPERTS,
  MOCK_ME,
  MOCK_TRENDS,
  MOCK_UNREAD_NOTIFICATIONS,
} from "@/lib/mock";

// Fase 1: datos mock. En la Fase 2 el usuario y los conteos vienen de Supabase.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const me = MOCK_ME;
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Navbar
        displayName={me.displayName}
        avatarUrl={me.avatarUrl}
        unreadNotifications={MOCK_UNREAD_NOTIFICATIONS}
      />
      <div className="mx-auto flex max-w-[1400px] justify-center">
        <SidebarLeft
          username={me.username}
          unreadNotifications={MOCK_UNREAD_NOTIFICATIONS}
          communities={MOCK_COMMUNITIES}
        />
        <main id="contenido" className="min-w-0 max-w-[680px] flex-1 px-3 pb-24 pt-5 md:px-4 md:pb-8">
          {children}
        </main>
        <SidebarRight me={me} experts={MOCK_EXPERTS} trends={MOCK_TRENDS} />
      </div>
      <BottomNav username={me.username} unreadNotifications={MOCK_UNREAD_NOTIFICATIONS} />
    </>
  );
}
