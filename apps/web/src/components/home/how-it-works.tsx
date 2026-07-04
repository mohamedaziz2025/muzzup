import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";

const STEPS = [
  {
    number: "01",
    title: "Découvrez",
    description:
      "Parcourez des business audités humainement — FBA, Shopify, SaaS, contenu — avec des données vérifiées, pas des promesses.",
  },
  {
    number: "02",
    title: "Échangez en confiance",
    description:
      "Chat anonyme, révélation d'identité progressive, NDA en un clic. Vous gardez le contrôle jusqu'à ce que vous soyez prêt.",
  },
  {
    number: "03",
    title: "Closez accompagné",
    description:
      "Notre équipe pilote chaque étape — LOI, due diligence, signature, transfert — sans jamais toucher vos fonds.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-center text-sm font-medium uppercase tracking-widest text-cyan">
          Comment ça marche
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold text-primary md:text-4xl">
          Trois étapes, zéro mauvaise surprise
        </h2>
      </FadeIn>

      <div className="relative mt-14 grid gap-6 md:grid-cols-3">
        <div
          className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent md:block"
          aria-hidden="true"
        />
        {STEPS.map((step, i) => (
          <FadeIn key={step.number} delay={i * 0.08}>
            <Card className="relative h-full glow-royal-hover">
              <span className="font-display text-4xl font-bold text-royal/40">{step.number}</span>
              <h3 className="mt-4 font-display text-xl font-semibold text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{step.description}</p>
            </Card>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
