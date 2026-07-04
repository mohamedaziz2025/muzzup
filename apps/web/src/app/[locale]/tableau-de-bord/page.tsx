"use client";

import { useEffect } from "react";
import { LayoutDashboard, Megaphone, Heart, CreditCard, User, MessageCircle, Eye, Wallet, Repeat } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter, Link } from "@/i18n/navigation";
import type { ListingDetail } from "@muzzap/shared";
import { useMyListings } from "@/lib/hooks/use-listings";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useAuditStatus } from "@/lib/hooks/use-audit-status";
import { useFavoriteIds } from "@/lib/hooks/use-favorites";
import { useMyDeals } from "@/lib/hooks/use-deal-pipeline";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell, type SidebarItem } from "@/components/dashboard/sidebar-shell";
import { StatCard } from "@/components/dashboard/stat-card";

const STATUS_LABELS: Record<string, { label: string; variant: "neutral" | "warning" | "success" | "danger" }> = {
  draft: { label: "Brouillon", variant: "neutral" },
  submitted: { label: "Soumise", variant: "warning" },
  under_audit: { label: "Sous audit", variant: "warning" },
  published: { label: "Publiée", variant: "success" },
  sold: { label: "Vendue", variant: "success" },
  rejected: { label: "Rejetée", variant: "danger" },
  archived: { label: "Archivée", variant: "neutral" },
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", icon: <LayoutDashboard className="size-4" /> },
  { href: "/tableau-de-bord/favoris", label: "Favoris", icon: <Heart className="size-4" /> },
  { href: "/tableau-de-bord/abonnement", label: "Abonnement", icon: <CreditCard className="size-4" /> },
  { href: "/tableau-de-bord/profil", label: "Mon profil", icon: <User className="size-4" /> },
];

function SellerListingCard({ listing }: { listing: ListingDetail }) {
  const status = STATUS_LABELS[listing.status] ?? STATUS_LABELS.draft!;
  const awaitingAudit = listing.status === "submitted" || listing.status === "under_audit";
  const { data } = useAuditStatus(listing.id, awaitingAudit);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>{listing.title}</CardTitle>
          <CardDescription className="mt-1">{listing.sector}</CardDescription>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      {listing.status === "rejected" && (
        <p className="mt-3 text-sm text-danger">
          Motif : consultez votre email pour les corrections demandées.
        </p>
      )}
      {awaitingAudit && data?.position && (
        <p className="mt-3 text-sm text-secondary">
          Position {data.position.position} dans la file d&apos;audit · délai estimé ~
          {data.position.estimatedDays} jour(s)
        </p>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !user) router.push("/connexion");
  }, [isHydrated, user, router]);

  const isSeller = !!user?.capacities.includes("seller");
  const { data: listingsData } = useMyListings(isSeller);
  const { data: notificationsData } = useNotifications();
  const { data: favoriteIdsData } = useFavoriteIds();
  const { data: dealsData } = useMyDeals();

  if (!user) return null;

  const unreadMessages =
    notificationsData?.notifications.filter((n) => !n.readAt && n.link?.startsWith("/messages")).length ?? 0;
  const totalViews = listingsData?.listings.reduce((sum, l) => sum + l.viewsCount, 0) ?? 0;
  const cumulativeRevenue =
    listingsData?.listings
      .filter((l) => l.financials)
      .reduce((sum, l) => sum + (l.financials?.monthlyRevenue ?? 0), 0) ?? 0;

  return (
    <DashboardSidebarShell title="Mon espace" items={SIDEBAR_ITEMS}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Bonjour, {user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-secondary">
            {user.isSubscribed ? "Compte abonné" : "Compte gratuit"} · {user.pseudonym}
          </p>
        </div>
        {!user.isSubscribed && (
          <Link href="/abonnement">
            <Button className="glow-royal-hover">S&apos;abonner — 29€/mois</Button>
          </Link>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Favoris" value={favoriteIdsData?.listingIds.length ?? 0} icon={<Heart className="size-4" />} accent="royal" />
        <StatCard
          label="Messages non lus"
          value={unreadMessages}
          icon={<MessageCircle className="size-4" />}
          accent="cyan"
          delay={0.05}
        />
        <StatCard label="Vues de mes annonces" value={totalViews} icon={<Eye className="size-4" />} accent="gold" delay={0.1} />
        <StatCard
          label="CA mensuel cumulé"
          value={cumulativeRevenue}
          suffix="€"
          icon={<Wallet className="size-4" />}
          accent="success"
          delay={0.15}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:w-1/2 sm:pr-2 lg:w-1/4">
        <StatCard
          label="Transactions en cours"
          value={dealsData?.deals.filter((d) => d.status === "active").length ?? 0}
          icon={<Repeat className="size-4" />}
          accent="royal"
          delay={0.2}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isSeller && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-xl font-semibold text-primary">Mes annonces</h2>
                <Link href="/vendre">
                  <Button size="sm" variant="secondary">
                    <Megaphone className="mr-1.5 size-4" />
                    Déposer une annonce
                  </Button>
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {listingsData?.listings.length === 0 && (
                  <p className="text-sm text-secondary">Aucune annonce pour le moment.</p>
                )}
                {listingsData?.listings.map((listing) => (
                  <SellerListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-primary">Notifications</h2>
          <div className="mt-4 space-y-3">
            {notificationsData?.notifications.length === 0 && (
              <p className="text-sm text-secondary">Aucune notification.</p>
            )}
            {notificationsData?.notifications.map((n) => (
              <Card key={n._id} className={n.readAt ? "opacity-60" : ""}>
                <p className="text-sm font-medium text-primary">{n.title}</p>
                <p className="mt-1 text-sm text-secondary">{n.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardSidebarShell>
  );
}
