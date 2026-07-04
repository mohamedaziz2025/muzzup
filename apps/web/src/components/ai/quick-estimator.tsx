"use client";

import { useState } from "react";
import type { ListingType } from "@muzzap/shared";
import { useQuickEstimate } from "@/lib/hooks/use-ai";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "fba", label: "Amazon FBA" },
  { value: "shopify", label: "Shopify" },
  { value: "saas", label: "SaaS" },
  { value: "content", label: "Contenu" },
];

function formatEuros(value: number): string {
  return `${value.toLocaleString("fr-FR")} €`;
}

export function QuickEstimator() {
  const [type, setType] = useState<ListingType>("fba");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [annualProfit, setAnnualProfit] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [email, setEmail] = useState("");
  const estimate = useQuickEstimate();

  function handleSubmit() {
    estimate.mutate({
      type,
      annualRevenue: Number(annualRevenue),
      annualProfit: Number(annualProfit),
      ageYears: Number(ageYears),
      ...(email ? { email } : {}),
    });
  }

  return (
    <Card className="mx-auto max-w-xl text-left">
      <h3 className="font-display text-xl font-semibold text-primary">
        Estimez votre business en 30 secondes
      </h3>
      <p className="mt-1 text-sm text-secondary">
        Fourchette indicative basée sur des multiples de marché — sans engagement.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="qe-type">Typologie</Label>
          <select
            id="qe-type"
            value={type}
            onChange={(e) => setType(e.target.value as ListingType)}
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
          <Label htmlFor="qe-revenue">CA annuel (€)</Label>
          <Input id="qe-revenue" type="number" value={annualRevenue} onChange={(e) => setAnnualRevenue(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="qe-profit">Marge annuelle (€)</Label>
          <Input id="qe-profit" type="number" value={annualProfit} onChange={(e) => setAnnualProfit(e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="qe-age">Ancienneté (années)</Label>
          <Input id="qe-age" type="number" value={ageYears} onChange={(e) => setAgeYears(e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="qe-email">Email (optionnel, pour recevoir le détail)</Label>
          <Input id="qe-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <Button className="mt-6 w-full glow-royal-hover" disabled={estimate.isPending} onClick={handleSubmit}>
        {estimate.isPending ? "Calcul..." : "Estimer mon business"}
      </Button>

      {estimate.data && (
        <div className="mt-6 rounded-[var(--radius-md)] border border-cyan/30 bg-cyan/10 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted">Fourchette indicative</p>
          <p className="mt-1 font-mono text-2xl text-cyan">
            {formatEuros(estimate.data.rangeLow)} – {formatEuros(estimate.data.rangeHigh)}
          </p>
          <p className="mt-2 text-xs text-muted">
            Basé sur un multiple de {estimate.data.multipleLow}x à {estimate.data.multipleHigh}x la marge annuelle.
          </p>
        </div>
      )}
    </Card>
  );
}
