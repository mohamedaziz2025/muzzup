import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";

const POINTS = [
  "Évaluez les données financières, le trafic et la conformité Sharia avant d'offrir",
  "Échangez de façon anonyme, avec une révélation d'identité progressive et mutuelle",
  "Faites-vous accompagner du LOI jusqu'au transfert, sans jamais toucher les fonds",
];

/** Two-column buyers CTA à la acquire.com — pitch left, product preview right. */
export function BuyersCta() {
  return (
    <section className="border-t border-[var(--border-subtle)] bg-night py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        <FadeIn direction="left">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">Acheteurs</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
            Découvrez le business de vos rêves
          </h2>
          <p className="mt-4 text-secondary">
            Parcourez des centaines de business audités humainement — FBA, Shopify, SaaS, contenu —
            avec des données vérifiées, pas des promesses.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-secondary">
                <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2} />
                {point}
              </li>
            ))}
          </ul>
          <Link href="/annonces" className="group mt-8 inline-block">
            <Button className="glow-royal-hover gap-1.5">
              Explorer les annonces
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </FadeIn>

        <FadeIn direction="right" delay={0.08}>
          <div className="glass card-shadow rounded-[var(--radius-lg)] p-6 transition-transform duration-300 hover:-translate-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Exemple d&apos;annonce</p>
            <p className="mt-3 font-display text-xl font-semibold text-primary">
              Boutique Shopify — Cosmétiques naturels
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-4">
              <div>
                <p className="text-xs text-muted">CA annuel</p>
                <p className="font-mono text-lg text-cyan">168 000 €</p>
              </div>
              <div>
                <p className="text-xs text-muted">Marge annuelle</p>
                <p className="font-mono text-lg text-cyan">45 600 €</p>
              </div>
              <div>
                <p className="text-xs text-muted">Multiple</p>
                <p className="font-mono text-lg text-cyan">3,0x</p>
              </div>
              <div>
                <p className="text-xs text-muted">Statut</p>
                <p className="text-sm font-medium text-gold">Sharia Vérifié</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
