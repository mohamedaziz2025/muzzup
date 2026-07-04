"use client";

import { LayoutDashboard, Heart, CreditCard, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCreatePortalSession, useCreateCheckoutSession } from "@/lib/hooks/use-billing";
import { DashboardSidebarShell, type SidebarItem } from "@/components/dashboard/sidebar-shell";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", icon: <LayoutDashboard className="size-4" /> },
  { href: "/tableau-de-bord/favoris", label: "Favoris", icon: <Heart className="size-4" /> },
  { href: "/tableau-de-bord/abonnement", label: "Abonnement", icon: <CreditCard className="size-4" /> },
  { href: "/tableau-de-bord/profil", label: "Mon profil", icon: <User className="size-4" /> },
];

export default function SubscriptionManagementPage() {
  const { user } = useAuthStore();
  const portal = useCreatePortalSession();
  const checkout = useCreateCheckoutSession();

  if (!user) return null;

  return (
    <DashboardSidebarShell title="Mon espace" items={SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Mon abonnement</h1>

      <Card className="mt-8 max-w-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-secondary">Statut</p>
            <Badge variant={user.isSubscribed ? "success" : "neutral"} className="mt-1">
              {user.isSubscribed ? "Actif — 29€/mois" : "Aucun abonnement"}
            </Badge>
          </div>
          {user.isSubscribed ? (
            <Button variant="secondary" disabled={portal.isPending} onClick={() => portal.mutate()}>
              {portal.isPending ? "Redirection..." : "Gérer la facturation"}
            </Button>
          ) : (
            <Button className="glow-royal-hover" disabled={checkout.isPending} onClick={() => checkout.mutate()}>
              {checkout.isPending ? "Redirection..." : "S'abonner"}
            </Button>
          )}
        </div>
      </Card>
    </DashboardSidebarShell>
  );
}
