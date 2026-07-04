"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShariaVerifiedBadge } from "@/components/ui/badge";
import { useCreateCheckoutSession } from "@/lib/hooks/use-billing";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "@/i18n/navigation";
import { GeometricPattern } from "@/components/ui/geometric-pattern";

const FEATURES = [
  "Accès complet aux données financières des annonces",
  "Publication illimitée d'annonces vendeur",
  "Mise en relation acheteur/vendeur via le chat sécurisé",
  "Contact direct avec les prestataires de l'annuaire",
  "Alertes de recherche personnalisées",
  "Support prioritaire de l'équipe MUZZUP",
];

export default function PricingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const checkout = useCreateCheckoutSession();

  function handleSubscribe() {
    if (!user) {
      router.push("/inscription");
      return;
    }
    checkout.mutate();
  }

  return (
    <div className="relative overflow-hidden">
      <GeometricPattern />
      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <ShariaVerifiedBadge />
        <h1 className="mt-6 font-display text-4xl font-bold text-primary">
          Un seul abonnement, tout MUZZUP
        </h1>
        <p className="mt-4 text-secondary">
          Acheteur, vendeur, prestataire : un compte unique pour toutes vos capacités.
        </p>

        <Card className="mx-auto mt-10 max-w-md text-left">
          <p className="font-mono text-4xl font-bold text-primary sm:text-5xl">
            29€<span className="text-lg font-normal text-secondary">/mois</span>
          </p>
          <ul className="mt-6 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-secondary">
                <span className="mt-1 text-success">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <Button
            size="lg"
            className="mt-8 w-full glow-royal-hover"
            disabled={checkout.isPending}
            onClick={handleSubscribe}
          >
            {checkout.isPending ? "Redirection..." : "S'abonner maintenant"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
