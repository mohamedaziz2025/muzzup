"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, ShieldCheck, Briefcase, ListChecks, LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/lib/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface DashboardSidebarShellProps {
  title: string;
  items: SidebarItem[];
  children: ReactNode;
}

const ROLE_LABELS: Record<string, string> = {
  visitor: "Visiteur",
  member: "Membre",
  subscriber: "Abonné",
  halal_auditor: "Auditeur halal",
  admin: "Administrateur",
  superadmin: "Super administrateur",
};

/** Dashboard areas a member can jump between, shown in the sidebar so switching never requires the header menu. */
function useDashboardAreas(): SidebarItem[] {
  const user = useAuthStore((s) => s.user);
  if (!user) return [];

  const areas: SidebarItem[] = [
    { href: "/tableau-de-bord", label: "Mon espace", icon: <LayoutDashboard className="size-4" /> },
  ];
  if (user.capacities.includes("provider")) {
    areas.push({ href: "/prestataires/mon-profil", label: "Prestataire", icon: <Briefcase className="size-4" /> });
  }
  if (user.roles.some((r) => r === "halal_auditor" || r === "admin" || r === "superadmin")) {
    areas.push({ href: "/auditeur", label: "Auditeur", icon: <ListChecks className="size-4" /> });
  }
  if (user.roles.some((r) => r === "admin" || r === "superadmin")) {
    areas.push({ href: "/admin", label: "Back-office", icon: <ShieldCheck className="size-4" /> });
  }
  return areas;
}

function NavLink({ item, active }: { item: SidebarItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-royal/15 text-cyan"
          : "text-secondary hover:bg-elevated hover:text-primary",
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

/** Shared sidebar chrome for role-scoped areas (member dashboard, auditor workspace, admin back-office). */
export function DashboardSidebarShell({ title, items, children }: DashboardSidebarShellProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const logout = useLogout();
  const areas = useDashboardAreas();
  const otherAreas = areas.filter((area) => area.href !== areasBase(pathname, areas));

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="glass sticky top-24 flex flex-col gap-5 rounded-[var(--radius-lg)] p-4">
          {user && (
            <Link
              href="/tableau-de-bord/profil"
              className="flex items-center gap-3 rounded-[var(--radius-md)] p-1 transition-colors hover:bg-elevated"
            >
              <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary">{user.fullName}</p>
                <p className="truncate text-xs text-muted">
                  {ROLE_LABELS[user.roles[user.roles.length - 1] ?? ""] ?? user.roles[0]}
                </p>
              </div>
            </Link>
          )}

          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
            <nav className="mt-2 space-y-1">
              {items.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} />
              ))}
            </nav>
          </div>

          {otherAreas.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">Changer d&apos;espace</p>
              <nav className="mt-2 space-y-1">
                {otherAreas.map((area) => (
                  <NavLink key={area.href} item={area} active={false} />
                ))}
              </nav>
            </div>
          )}

          <button
            type="button"
            onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/") })}
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] border-t border-[var(--border-subtle)] px-3 pt-4 text-sm text-secondary transition-colors hover:text-danger"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {[...items, ...otherAreas].map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-cyan/50 bg-cyan/10 text-cyan"
                    : "border-[var(--border-subtle)] text-secondary",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </div>
  );
}

/** Resolves which dashboard area a pathname belongs to, so that area is excluded from the "switch" list. */
function areasBase(pathname: string, areas: SidebarItem[]): string | undefined {
  return areas.find((area) => pathname === area.href || pathname.startsWith(`${area.href}/`))?.href;
}
