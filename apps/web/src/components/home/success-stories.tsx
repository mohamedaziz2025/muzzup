import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

const STORIES = [
  {
    initials: "AF",
    name: "Amine F.",
    role: "Vendeur — Boutique Amazon FBA, puériculture",
    quote:
      "L'audit halal m'a forcé à clarifier mes contrats fournisseurs — un vrai plus pour rassurer l'acheteur, pas juste une formalité.",
    result: "3,1x la marge annuelle",
  },
  {
    initials: "LB",
    name: "Leïla B.",
    role: "Acheteuse — SaaS B2B, cédé en 6 semaines",
    quote:
      "Le chat anonyme a changé la donne : j'ai pu négocier sereinement avant même de savoir qui était en face.",
    result: "Closing en 42 jours",
  },
  {
    initials: "SK",
    name: "Sofiane K.",
    role: "Vendeur — Boutique Shopify, cosmétiques",
    quote:
      "L'équipe MUZZUP a suivi chaque étape du pipeline avec nous — on n'a jamais eu l'impression d'être seuls dans la due diligence.",
    result: "2,6x la marge annuelle",
  },
];

/** Testimonial grid à la acquire.com — avatar initials, quote, name/role, and a result badge. */
export function SuccessStories() {
  return (
    <section className="border-t border-[var(--border-subtle)] bg-night py-24">
      <div className="mx-auto max-w-6xl">
        <div className="px-6">
          <FadeIn>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-cyan">
              Ils en parlent
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-bold text-primary md:text-4xl">
              Des deals réels, anonymisés
            </h2>
          </FadeIn>
        </div>

        <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STORIES.map((story, i) => (
            <FadeIn
              key={story.name}
              delay={i * 0.08}
              className="w-[82%] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none md:shrink"
            >
              <Card className="flex h-full flex-col justify-between">
                <p className="text-sm italic leading-relaxed text-secondary">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated font-display text-xs font-semibold text-cyan">
                      {story.initials}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-primary">{story.name}</p>
                      <p className="text-xs text-muted">{story.role}</p>
                    </div>
                  </div>
                </div>
                <Badge variant="cyan" className="mt-4 w-fit">
                  {story.result}
                </Badge>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
