"use client";

import { Heart } from "lucide-react";
import type { ListingCard as ListingCardType } from "@muzzap/shared";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, ShariaVerifiedBadge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useFavoriteIds, useToggleFavorite } from "@/lib/hooks/use-favorites";

const TYPE_LABELS: Record<ListingCardType["type"], string> = {
  fba: "Amazon FBA",
  shopify: "Shopify",
  saas: "SaaS",
  content: "Contenu",
};

function FavoriteButton({ listingId }: { listingId: string }) {
  const user = useAuthStore((s) => s.user);
  const { data } = useFavoriteIds();
  const toggle = useToggleFavorite();
  const isFavorited = data?.listingIds.includes(listingId) ?? false;

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate(listingId);
      }}
      disabled={toggle.isPending}
      aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-abyss/60 text-secondary backdrop-blur-sm transition-colors hover:text-danger"
    >
      <Heart className="size-4" fill={isFavorited ? "currentColor" : "none"} strokeWidth={1.8} />
    </button>
  );
}

export function ListingCard({ listing }: { listing: ListingCardType }) {
  return (
    <Link href={`/annonces/${listing.id}`}>
      <Card className="glow-royal-hover relative h-full cursor-pointer">
        <FavoriteButton listingId={listing.id} />
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="royal">{TYPE_LABELS[listing.type]}</Badge>
            {listing.isFeatured && <Badge variant="cyan">Mis en avant</Badge>}
          </div>
          <CardTitle className="mt-2">{listing.title}</CardTitle>
          <CardDescription>{listing.sector}</CardDescription>
        </CardHeader>
        <p className="line-clamp-2 text-sm text-secondary">{listing.summary}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-sm text-cyan">{listing.askingPriceRange}</span>
          {listing.halalVerified && <ShariaVerifiedBadge />}
        </div>
      </Card>
    </Link>
  );
}
