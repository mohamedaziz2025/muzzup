"use client";

import { Home, LayoutGrid, MessageCircle, LayoutDashboard, CircleUser } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { cn } from "@/lib/utils";

const ICONS = {
  home: <Home className="size-5" strokeWidth={1.8} />,
  listings: <LayoutGrid className="size-5" strokeWidth={1.8} />,
  messages: <MessageCircle className="size-5" strokeWidth={1.8} />,
  dashboard: <LayoutDashboard className="size-5" strokeWidth={1.8} />,
  account: <CircleUser className="size-5" strokeWidth={1.8} />,
};

/** Mobile app-shell bar for authenticated members, giving the web app a native-feel bottom nav. */
export function BottomNav() {
  const { user, isHydrated } = useAuthStore();
  const pathname = usePathname();
  const { data } = useNotifications();
  const unreadMessages = data?.notifications.filter((n) => !n.readAt && n.link?.startsWith("/messages")).length ?? 0;

  if (!isHydrated || !user) return null;

  const items = [
    { href: "/", label: "Accueil", icon: ICONS.home },
    { href: "/annonces", label: "Annonces", icon: ICONS.listings },
    { href: "/messages", label: "Messages", icon: ICONS.messages, badge: unreadMessages },
    { href: "/tableau-de-bord", label: "Bureau", icon: ICONS.dashboard },
    { href: "/tableau-de-bord/abonnement", label: "Compte", icon: ICONS.account },
  ] as const;

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[var(--border-subtle)] px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      aria-label="Navigation principale"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] py-1.5 text-[11px] transition-colors active:scale-95",
              active ? "text-cyan" : "text-muted",
            )}
          >
            <span className="relative">
              {item.icon}
              {"badge" in item && item.badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-danger text-[8px] font-semibold text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
