"use client";

import { useListingsSearch } from "@/lib/hooks/use-listings";
import { ListingCard } from "@/components/listings/listing-card";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function FeaturedListings() {
  const { data, isLoading } = useListingsSearch({ sortBy: "recent", page: 1, pageSize: 3 });

  if (!isLoading && data?.listings.length === 0) return null;

  return (
    <section className="border-t border-[var(--border-subtle)] bg-night py-24">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-cyan">
                Sélection du moment
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
                Annonces à la une
              </h2>
            </div>
            <Link href="/annonces">
              <Button variant="secondary">Voir toutes les annonces</Button>
            </Link>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass h-56 animate-pulse rounded-[var(--radius-md)]" />
            ))}
          {data?.listings.map((listing, i) => (
            <FadeIn key={listing.id} delay={i * 0.06}>
              <ListingCard listing={listing} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
