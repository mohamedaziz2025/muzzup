import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--aurora-glow-1), transparent 65%), var(--bg-abyss)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <h2 className="text-balance font-display text-3xl font-bold text-primary md:text-5xl">
            Prêt à acheter, vendre ou financer votre prochain business ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            Rejoignez une communauté d&apos;entrepreneurs qui refusent de choisir entre ambition et
            conformité.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/inscription">
              <Button size="lg" className="glow-royal-hover">
                Créer mon compte
              </Button>
            </Link>
            <Link href="/vendre">
              <Button size="lg" variant="secondary">
                Déposer une annonce
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
