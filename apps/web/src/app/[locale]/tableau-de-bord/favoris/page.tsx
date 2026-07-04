"use client";

import { LayoutDashboard, Heart, CreditCard, User } from "lucide-react";
import { useMyFavorites } from "@/lib/hooks/use-favorites";
import { ListingCard } from "@/components/listings/listing-card";
import { FadeIn } from "@/components/ui/fade-in";
import { DashboardSidebarShell, type SidebarItem } from "@/components/dashboard/sidebar-shell";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", icon: <LayoutDashboard className="size-4" /> },
  { href: "/tableau-de-bord/favoris", label: "Favoris", icon: <Heart className="size-4" /> },
  { href: "/tableau-de-bord/abonnement", label: "Abonnement", icon: <CreditCard className="size-4" /> },
  { href: "/tableau-de-bord/profil", label: "Mon profil", icon: <User className="size-4" /> },
];

export default function FavoritesPage() {
  const { data, isLoading } = useMyFavorites();

  return (
    <DashboardSidebarShell title="Mon espace" items={SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Mes favoris</h1>
      <p className="mt-1 text-secondary">Les business que vous suivez de près.</p>

      {isLoading && <p className="mt-8 text-secondary">Chargement...</p>}
      {!isLoading && data?.listings.length === 0 && (
        <p className="mt-8 text-secondary">Aucun favori pour le moment.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {data?.listings.map((listing, i) => (
          <FadeIn key={listing.id} delay={Math.min(i, 5) * 0.06}>
            <ListingCard listing={listing} />
          </FadeIn>
        ))}
      </div>
    </DashboardSidebarShell>
  );
}
