"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ListingType } from "@muzzap/shared";
import { useListingsSearch } from "@/lib/hooks/use-listings";
import { ListingCard } from "@/components/listings/listing-card";
import { Input, Label } from "@/components/ui/input";
import { FadeIn } from "@/components/ui/fade-in";

const TYPE_OPTIONS: { value: ListingType | ""; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "fba", label: "Amazon FBA" },
  { value: "shopify", label: "Shopify" },
  { value: "saas", label: "SaaS" },
  { value: "content", label: "Contenu" },
];

export default function ListingsSearchPage() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState<ListingType | "">((searchParams.get("type") as ListingType) ?? "");
  const [sector, setSector] = useState(searchParams.get("sector") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [minProfit, setMinProfit] = useState(searchParams.get("minProfit") ?? "");
  const [halalVerifiedOnly, setHalalVerifiedOnly] = useState(
    searchParams.get("halalVerifiedOnly") === "true",
  );
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc" | "profit_desc">(
    "recent",
  );

  const { data, isLoading } = useListingsSearch({
    ...(q ? { q } : {}),
    ...(type ? { type } : {}),
    ...(sector ? { sector } : {}),
    ...(minPrice ? { minPrice: Number(minPrice) } : {}),
    ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
    ...(minProfit ? { minProfit: Number(minProfit) } : {}),
    ...(halalVerifiedOnly ? { halalVerifiedOnly: true } : {}),
    sortBy,
    page: 1,
    pageSize: 20,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Annonces</h1>
      <p className="mt-2 text-secondary">
        Business audités et vérifiés, prêts à reprendre.
      </p>

      <div className="glass mt-8 grid gap-4 rounded-[var(--radius-md)] p-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <Label htmlFor="q">Mot-clé</Label>
          <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, mot-clé..." />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as ListingType | "")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="sector">Secteur</Label>
          <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="minPrice">Prix min</Label>
          <Input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="maxPrice">Prix max</Label>
          <Input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="minProfit">Rentabilité min (€/mois)</Label>
          <Input
            id="minProfit"
            type="number"
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sortBy">Trier par</Label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
          >
            <option value="recent">Plus récent</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="profit_desc">Rentabilité</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-secondary md:col-span-5">
          <input
            type="checkbox"
            checked={halalVerifiedOnly}
            onChange={(e) => setHalalVerifiedOnly(e.target.checked)}
          />
          Halal vérifié uniquement
        </label>
      </div>

      {isLoading && <p className="mt-10 text-secondary">Chargement des annonces...</p>}

      {!isLoading && data?.listings.length === 0 && (
        <p className="mt-10 text-secondary">Aucune annonce ne correspond à ces critères.</p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.listings.map((listing, i) => (
          <FadeIn key={listing.id} delay={Math.min(i, 5) * 0.06}>
            <ListingCard listing={listing} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
