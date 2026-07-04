"use client";

import { useState } from "react";
import { useProviderSearch } from "@/lib/hooks/use-providers";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";

export default function ProvidersDirectoryPage() {
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const { data, isLoading } = useProviderSearch(q, specialty);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Annuaire des prestataires</h1>
      <p className="mt-2 text-secondary">
        Trouvez un expert pour optimiser, auditer ou accompagner votre acquisition.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Input
          placeholder="Rechercher (ex: PPC Amazon, comptabilité...)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
        <Input
          placeholder="Spécialité exacte"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading && <p className="mt-10 text-secondary">Recherche en cours...</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.providers.map((provider, i) => (
          <FadeIn key={provider._id} delay={Math.min(i, 5) * 0.06}>
            <Link href={`/prestataires/${provider._id}`}>
              <Card className="glow-royal-hover h-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {provider.isSponsored && <Badge variant="cyan">Mis en avant</Badge>}
                    {provider.ratingCount > 0 && (
                      <Badge variant="royal">
                        ★ {provider.ratingAverage.toFixed(1)} ({provider.ratingCount})
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2">{provider.tagline}</CardTitle>
                  <CardDescription>{provider.pricingIndication}</CardDescription>
                </CardHeader>
                <div className="flex flex-wrap gap-1.5">
                  {provider.specialties.slice(0, 4).map((s) => (
                    <Badge key={s} variant="neutral">
                      {s}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Link>
          </FadeIn>
        ))}
        {data?.providers.length === 0 && (
          <p className="text-sm text-secondary">Aucun prestataire ne correspond à cette recherche.</p>
        )}
      </div>
    </div>
  );
}
