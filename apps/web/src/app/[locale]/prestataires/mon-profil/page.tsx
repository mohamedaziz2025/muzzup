"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useMyProviderProfile, useUpsertProviderProfile } from "@/lib/hooks/use-providers";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MyProviderProfilePage() {
  const { user } = useAuthStore();
  const { data } = useMyProviderProfile();
  const upsert = useUpsertProviderProfile();

  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [pricingIndication, setPricingIndication] = useState("");

  useEffect(() => {
    if (data?.provider) {
      setTagline(data.provider.tagline);
      setBio(data.provider.bio);
      setSpecialties(data.provider.specialties.join(", "));
      setPricingIndication(data.provider.pricingIndication);
    }
  }, [data]);

  if (!user?.capacities.includes("provider")) {
    return (
      <p className="mx-auto max-w-2xl px-6 py-16 text-secondary">
        Activez la capacité « prestataire » sur votre profil pour créer une fiche.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Ma fiche prestataire</h1>

      <Card className="mt-8 space-y-4">
        <div>
          <Label htmlFor="tagline">Titre / accroche</Label>
          <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bio">Présentation</Label>
          <textarea
            id="bio"
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-3 text-sm text-primary focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <Label htmlFor="specialties">Spécialités (séparées par des virgules)</Label>
          <Input
            id="specialties"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="PPC Amazon, SEO Shopify, Comptabilité"
          />
        </div>
        <div>
          <Label htmlFor="pricing">Indication tarifaire</Label>
          <Input
            id="pricing"
            value={pricingIndication}
            onChange={(e) => setPricingIndication(e.target.value)}
            placeholder="À partir de 500€/mission"
          />
        </div>
        <Button
          className="glow-royal-hover"
          disabled={upsert.isPending}
          onClick={() =>
            upsert.mutate({
              tagline,
              bio,
              specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
              pricingIndication,
              portfolio: [],
            })
          }
        >
          {upsert.isPending ? "Enregistrement..." : "Enregistrer ma fiche"}
        </Button>
      </Card>
    </div>
  );
}
