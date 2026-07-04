"use client";

import { Users, TrendingUp, Wallet, Percent, Coins } from "lucide-react";
import { useAdminKpis, useAdminAnalytics } from "@/lib/hooks/use-admin";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { MiniChart } from "@/components/admin/mini-chart";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

function AdminDashboardContent() {
  const { data: kpis } = useAdminKpis();
  const { data: analytics } = useAdminAnalytics("30d");

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Back-office MUZZUP</h1>
          <p className="mt-1 text-secondary">Vue d&apos;ensemble de la plateforme</p>
        </div>
        <div className="flex gap-3">
          <Link href="/auditeur">
            <Button variant="secondary" size="sm">Espace auditeur</Button>
          </Link>
          <a href={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/admin/users/export`}>
            <Button variant="secondary" size="sm">Exporter les utilisateurs (CSV)</Button>
          </a>
        </div>
      </div>

      {kpis && (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Utilisateurs" value={kpis.totalUsers} icon={<Users className="size-4" />} accent="royal" />
          <StatCard
            label="Abonnés actifs"
            value={kpis.activeSubscriptions}
            icon={<TrendingUp className="size-4" />}
            accent="cyan"
            delay={0.05}
          />
          <StatCard label="MRR" value={kpis.mrrEur} suffix="€" icon={<Wallet className="size-4" />} accent="gold" delay={0.1} />
          <StatCard
            label="Revenu estimé"
            value={Math.round(kpis.revenueEstimateEur)}
            suffix="€"
            icon={<Coins className="size-4" />}
            accent="success"
            delay={0.15}
          />
          <StatCard
            label="Conversion annonces"
            value={Math.round(kpis.conversionRate * 100)}
            suffix="%"
            icon={<Percent className="size-4" />}
            accent="royal"
            delay={0.2}
          />
        </div>
      )}

      {analytics && (
        <Card className="mt-6">
          <CardTitle>Activité — 30 derniers jours</CardTitle>
          <div className="mt-4">
            <MiniChart
              series={[
                { label: "Inscriptions", color: "var(--color-royal)", data: analytics.signups },
                { label: "Annonces soumises", color: "var(--color-cyan)", data: analytics.listingSubmissions },
                { label: "Transactions finalisées", color: "var(--color-gold)", data: analytics.completedDeals },
              ]}
            />
          </div>
        </Card>
      )}

      {kpis && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardTitle>Annonces par statut</CardTitle>
            <div className="mt-3 space-y-2">
              {Object.entries(kpis.listingsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{status}</span>
                  <Badge variant="neutral">{count}</Badge>
                </div>
              ))}
              {Object.keys(kpis.listingsByStatus).length === 0 && (
                <p className="text-sm text-secondary">Aucune annonce.</p>
              )}
            </div>
          </Card>
          <Card>
            <CardTitle>Transactions par étape</CardTitle>
            <div className="mt-3 space-y-2">
              {Object.entries(kpis.dealsByStage).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{stage}</span>
                  <Badge variant="cyan">{count}</Badge>
                </div>
              ))}
              {Object.keys(kpis.dealsByStage).length === 0 && (
                <p className="text-sm text-secondary">Aucune transaction active.</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </DashboardSidebarShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
