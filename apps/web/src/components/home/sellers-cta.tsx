import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";

const POINTS = [
  "Déposez votre annonce en quelques minutes, avec une checklist Sharia déclarative",
  "Soyez mis en relation avec des acheteurs vérifiés, sans jamais exposer votre identité",
  "Closing accompagné par notre équipe — LOI, due diligence, signature, transfert",
];

/** Mirror of BuyersCta (visual/text sides swapped), à la acquire.com. */
export function SellersCta() {
  return (
    <section className="border-t border-[var(--border-subtle)] py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        <FadeIn direction="left" className="order-2 md:order-1">
          <div className="glass card-shadow rounded-[var(--radius-lg)] p-6 transition-transform duration-300 hover:-translate-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Checklist Sharia
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Pas de financement à intérêt (riba)",
                "Aucun produit intrinsèquement haram",
                "Comptabilité transparente et vérifiable",
                "Aucune pratique commerciale trompeuse",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-secondary">
                  <Check className="size-4 shrink-0 text-success" strokeWidth={2} />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
              <Badge variant="cyan">Audité par un humain avant publication</Badge>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={0.08} className="order-1 md:order-2">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">Vendeurs</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
            Vendez rapidement, en toute confiance
          </h2>
          <p className="mt-4 text-secondary">
            Publiez votre business auprès d&apos;acheteurs qualifiés, sans jamais compromettre vos
            principes — chaque annonce est vérifiée avant publication.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-secondary">
                <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2} />
                {point}
              </li>
            ))}
          </ul>
          <Link href="/vendre" className="group mt-8 inline-block">
            <Button variant="gold" className="gap-1.5">
              Déposer une annonce
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
