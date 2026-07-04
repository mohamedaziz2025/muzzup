"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
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

/** Shared sidebar chrome for role-scoped areas (member dashboard, auditor workspace, admin back-office). */
export function DashboardSidebarShell({ title, items, children }: DashboardSidebarShellProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
        <nav className="mt-3 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors",
                  active ? "bg-royal/15 text-cyan" : "text-secondary hover:bg-elevated hover:text-primary",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {items.map((item) => {
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
