import { ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";

/**
 * Three-card layout à la acquire.com's "we make acquisitions fast, safe, and easy": a seller card,
 * a brand-emphasis center card, and a buyer card, framing the platform's halal-audit differentiator.
 */
export function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-center text-sm font-medium uppercase tracking-widest text-cyan">
          Pourquoi MUZZUP
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold text-primary md:text-4xl">
          Des cessions rapides, sûres et conformes
        </h2>
      </FadeIn>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <FadeIn delay={0.04}>
          <Card className="glow-royal-hover flex h-full flex-col items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-royal/15 text-royal">
              <Sparkles className="size-5" strokeWidth={1.6} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-primary">
                Vendeurs
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Maximisez votre cession grâce à l&apos;accompagnement de notre équipe d&apos;audit,
                du dépôt d&apos;annonce jusqu&apos;au closing.
              </p>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Card className="glow-gold flex h-full flex-col items-center justify-center gap-4 border border-gold/30 bg-gold/5 text-center">
            <p className="font-logo text-3xl font-bold text-primary">muzzup</p>
            <p className="text-sm text-secondary">
              L&apos;IA prépare, l&apos;humain valide — jamais de décision automatisée sur l&apos;audit,
              la valorisation ou un litige.
            </p>
          </Card>
        </FadeIn>

        <FadeIn delay={0.12}>
          <Card className="glow-royal-hover flex h-full flex-col items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-royal/15 text-royal">
              <ShieldCheck className="size-5" strokeWidth={1.6} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-primary">
                Acheteurs
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Trouvez le business idéal, échangez de façon anonyme et sécurisée, et faites une
                offre en toute confiance.
              </p>
            </div>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}
