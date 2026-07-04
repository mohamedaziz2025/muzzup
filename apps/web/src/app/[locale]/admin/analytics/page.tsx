"use client";

import { useState } from "react";
import { useAdminAnalytics } from "@/lib/hooks/use-admin";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { MiniChart } from "@/components/admin/mini-chart";

const RANGES: { value: "7d" | "30d" | "90d"; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
];

function sum(points: { count: number }[]): number {
  return points.reduce((acc, p) => acc + p.count, 0);
}

function AdminAnalyticsContent() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading } = useAdminAnalytics(range);

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-primary">Analytics</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={range === r.value ? "primary" : "secondary"}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && <p className="mt-6 text-sm text-secondary">Chargement...</p>}

      {data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs uppercase tracking-wide text-muted">Inscriptions</p>
              <p className="mt-2 font-display text-2xl font-bold text-royal">{sum(data.signups)}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-muted">Annonces soumises</p>
              <p className="mt-2 font-display text-2xl font-bold text-cyan">{sum(data.listingSubmissions)}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-muted">Transactions finalisées</p>
              <p className="mt-2 font-display text-2xl font-bold text-gold">{sum(data.completedDeals)}</p>
            </Card>
          </div>

          <Card className="mt-6">
            <CardTitle>Inscriptions</CardTitle>
            <div className="mt-4">
              <MiniChart series={[{ label: "Inscriptions", color: "var(--color-royal)", data: data.signups }]} />
            </div>
          </Card>

          <Card className="mt-6">
            <CardTitle>Annonces soumises</CardTitle>
            <div className="mt-4">
              <MiniChart
                series={[{ label: "Annonces soumises", color: "var(--color-cyan)", data: data.listingSubmissions }]}
              />
            </div>
          </Card>

          <Card className="mt-6">
            <CardTitle>Transactions finalisées</CardTitle>
            <div className="mt-4">
              <MiniChart series={[{ label: "Transactions finalisées", color: "var(--color-gold)", data: data.completedDeals }]} />
            </div>
          </Card>
        </>
      )}
    </DashboardSidebarShell>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AdminGuard>
      <AdminAnalyticsContent />
    </AdminGuard>
  );
}
