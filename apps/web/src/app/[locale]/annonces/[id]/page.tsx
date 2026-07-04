"use client";

import { useParams } from "next/navigation";
import { useListing } from "@/lib/hooks/use-listings";
import { useStartConversation } from "@/lib/hooks/use-chat";
import { Badge, ShariaVerifiedBadge } from "@/components/ui/badge";
import { LockedFinancial } from "@/components/ui/locked-financial";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

const TYPE_LABELS: Record<string, string> = {
  fba: "Amazon FBA",
  shopify: "Shopify",
  saas: "SaaS",
  content: "Contenu",
};

function formatEuros(value: number): string {
  return `${value.toLocaleString("fr-FR")} €`;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useListing(id);
  const startConversation = useStartConversation();
  const router = useRouter();

  async function handleContact() {
    await startConversation.mutateAsync(id);
    router.push("/messages");
  }

  if (isLoading) {
    return <p className="mx-auto max-w-4xl px-6 py-16 text-secondary">Chargement...</p>;
  }

  if (error || !data) {
    return <p className="mx-auto max-w-4xl px-6 py-16 text-danger">Annonce introuvable.</p>;
  }

  const { listing } = data;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="royal">{TYPE_LABELS[listing.type]}</Badge>
        <Badge variant="neutral">{listing.sector}</Badge>
        {listing.halalVerified && <ShariaVerifiedBadge />}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
        {listing.title}
      </h1>
      <p className="mt-4 text-secondary">{listing.summary}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {listing.financialsLocked || !listing.financials ? (
          <>
            <LockedFinancial label="Chiffre d'affaires annuel" previewValue="184 320 €" />
            <LockedFinancial label="Marge nette annuelle" previewValue="41 200 €" />
            <LockedFinancial label="Prix demandé" previewValue="98 000 €" />
          </>
        ) : (
          <>
            <Card>
              <p className="text-xs uppercase tracking-wide text-muted">CA annuel</p>
              <p className="mt-2 font-mono text-2xl text-primary">
                {formatEuros(listing.financials.annualRevenue)}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-muted">Marge nette annuelle</p>
              <p className="mt-2 font-mono text-2xl text-primary">
                {formatEuros(listing.financials.annualProfit)}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-muted">Prix demandé</p>
              <p className="mt-2 font-mono text-2xl text-cyan">
                {formatEuros(listing.financials.askingPrice)}
              </p>
            </Card>
          </>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button
          size="lg"
          className="glow-royal-hover"
          disabled={startConversation.isPending}
          onClick={handleContact}
        >
          Contacter le vendeur
        </Button>
        <Button size="lg" variant="secondary">
          Ajouter au comparateur
        </Button>
      </div>
    </div>
  );
}
