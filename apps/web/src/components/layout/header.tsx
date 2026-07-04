"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useTranslations } from "next-intl";
import { Bell, MessageCircle, Plus, Menu, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/lib/hooks/use-auth";
import { useNotifications } from "@/lib/hooks/use-notifications";

const NAV_LINKS = [
  { href: "/annonces?espace=acheter", key: "buy" as const },
  { href: "/annonces?espace=financer", key: "finance" as const },
  { href: "/annonces?espace=investir", key: "invest" as const },
  { href: "/prestataires", key: "providers" as const },
];

function NotificationBell() {
  const { data } = useNotifications();
  const [open, setOpen] = useState(false);
  const notifications = data?.notifications.filter((n) => !n.link?.startsWith("/messages")) ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-elevated hover:text-primary"
        aria-label="Notifications"
      >
        <Bell className="size-5" strokeWidth={1.7} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="glass absolute right-0 z-50 mt-2 w-80 rounded-[var(--radius-md)] p-2"
            >
              <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                Notifications
              </p>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-2 py-4 text-center text-sm text-secondary">
                    Aucune notification.
                  </p>
                )}
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n._id}
                    className={`rounded-[var(--radius-md)] px-2 py-2 text-sm ${n.readAt ? "text-secondary" : "bg-royal/10 text-primary"}`}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessagesButton() {
  const { data } = useNotifications();
  const unreadCount = data?.notifications.filter((n) => !n.readAt && n.link?.startsWith("/messages")).length ?? 0;

  return (
    <Link
      href="/messages"
      className="relative flex size-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-elevated hover:text-primary"
      aria-label="Messages"
    >
      <MessageCircle className="size-5" strokeWidth={1.7} />
      {unreadCount > 0 && (
        <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] py-1 pl-1 pr-3 transition-colors hover:border-royal/40"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-elevated font-display text-xs font-semibold text-cyan">
          {user.fullName.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden text-sm text-secondary sm:inline">{user.fullName.split(" ")[0]}</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="glass absolute right-0 z-50 mt-2 w-56 rounded-[var(--radius-md)] p-1.5"
            >
              <Link
                href="/tableau-de-bord"
                onClick={() => setOpen(false)}
                className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
              >
                Tableau de bord
              </Link>
              <Link
                href="/tableau-de-bord/profil"
                onClick={() => setOpen(false)}
                className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
              >
                Mon profil
              </Link>
              <Link
                href="/messages"
                onClick={() => setOpen(false)}
                className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
              >
                Messages
              </Link>
              {user.roles.includes("halal_auditor") && (
                <Link
                  href="/auditeur"
                  onClick={() => setOpen(false)}
                  className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
                >
                  Espace auditeur
                </Link>
              )}
              {user.roles.includes("admin") && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary"
                >
                  Back-office
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout.mutate(undefined, { onSuccess: () => router.push("/") });
                }}
                className="block w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
              >
                Déconnexion
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const { user, isHydrated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-[var(--border-subtle)] bg-abyss/85 backdrop-blur-md shadow-[var(--header-shadow)]"
          : "border-transparent bg-transparent backdrop-blur-0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Muzzup — accueil">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-secondary md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.key} href={link.href} className="transition-colors hover:text-primary">
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isHydrated && user ? (
            <>
              <Link href="/vendre">
                <Button size="sm" variant="gold" className="gap-1.5">
                  <Plus className="size-4" />
                  Publier un business
                </Button>
              </Link>
              <MessagesButton />
              <NotificationBell />
              <ThemeToggle />
              <UserMenu />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/connexion">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/inscription">
                <Button variant="primary" size="sm" className="glow-royal-hover">
                  {t("register")}
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-primary"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-6" strokeWidth={1.8} /> : <Menu className="size-6" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--border-subtle)] bg-abyss md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-secondary hover:bg-elevated hover:text-primary"
                >
                  {t(link.key)}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3">
                {isHydrated && user ? (
                  <>
                    <Link href="/vendre" onClick={() => setMobileOpen(false)}>
                      <Button variant="gold" className="w-full gap-1.5">
                        <Plus className="size-4" />
                        Publier un business
                      </Button>
                    </Link>
                    <Link href="/tableau-de-bord" onClick={() => setMobileOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        Tableau de bord
                      </Button>
                    </Link>
                    <Link href="/messages" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Messages
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/connexion" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        {t("login")}
                      </Button>
                    </Link>
                    <Link href="/inscription" onClick={() => setMobileOpen(false)}>
                      <Button variant="primary" className="w-full glow-royal-hover">
                        {t("register")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
