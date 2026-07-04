"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import type { ListingType } from "@muzzap/shared";
import { useListingsSearch } from "@/lib/hooks/use-listings";
import { ListingCard } from "@/components/listings/listing-card";
import { Input, Label } from "@/components/ui/input";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [q, type, sector, minPrice, maxPrice, minProfit].filter(Boolean).length +
    (halalVerifiedOnly ? 1 : 0);

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

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="glass flex w-full items-center justify-between rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-primary lg:hidden"
          aria-expanded={filtersOpen}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-xs font-semibold text-cyan">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
        </button>

        <aside
          className={cn(
            "glass w-full shrink-0 space-y-5 rounded-[var(--radius-md)] p-6 lg:sticky lg:top-24 lg:block lg:w-72",
            filtersOpen ? "block" : "hidden",
          )}
        >
          <p className="hidden text-xs font-semibold uppercase tracking-wide text-muted lg:block">
            Filtres
          </p>

          <div>
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
          <div className="grid grid-cols-2 gap-3">
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
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input
              type="checkbox"
              checked={halalVerifiedOnly}
              onChange={(e) => setHalalVerifiedOnly(e.target.checked)}
            />
            Halal vérifié uniquement
          </label>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-secondary">
              {isLoading ? "Chargement..." : `${data?.listings.length ?? 0} annonce(s)`}
            </p>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
            >
              <option value="recent">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="profit_desc">Rentabilité</option>
            </select>
          </div>

          {isLoading && <p className="mt-10 text-secondary">Chargement des annonces...</p>}

          {!isLoading && data?.listings.length === 0 && (
            <p className="mt-10 text-secondary">Aucune annonce ne correspond à ces critères.</p>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data?.listings.map((listing, i) => (
              <FadeIn key={listing.id} delay={Math.min(i, 5) * 0.06}>
                <ListingCard listing={listing} />
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
