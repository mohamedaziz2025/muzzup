import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, ShariaVerifiedBadge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { LockedFinancial } from "@/components/ui/locked-financial";
import { GeometricPattern } from "@/components/ui/geometric-pattern";
import { FadeIn } from "@/components/ui/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const COLOR_TOKENS = [
  { name: "bg-abyss", var: "--bg-abyss", label: "Fond principal" },
  { name: "bg-night", var: "--bg-night", label: "Fond de section" },
  { name: "bg-surface", var: "--bg-surface", label: "Cartes / panneaux" },
  { name: "bg-elevated", var: "--bg-elevated", label: "Éléments surélevés" },
  { name: "accent-royal", var: "--accent-royal", label: "Action primaire" },
  { name: "accent-cyan", var: "--accent-cyan", label: "Données / actif" },
  { name: "accent-gold", var: "--accent-gold", label: "Sharia Vérifié uniquement" },
  { name: "success", var: "--success", label: "Succès" },
  { name: "warning", var: "--warning", label: "Avertissement" },
  { name: "danger", var: "--danger", label: "Danger" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border-subtle)] py-14">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 font-display text-2xl font-semibold text-primary">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function DesignSystemPage() {
  const t = useTranslations("designSystem");

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] py-20">
        <GeometricPattern />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-display text-4xl font-bold text-primary md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-secondary">{t("subtitle")}</p>
        </div>
      </section>

      <Section title={t("sections.theme")}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="glass flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3">
            <ThemeToggle />
            <p className="text-sm text-secondary">
              Bascule entre le thème clair (par défaut) et &quot;Midnight Trust&quot; (sombre).
              Le choix est mémorisé dans le navigateur.
            </p>
          </div>
        </div>
      </Section>

      <Section title={t("sections.colors")}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {COLOR_TOKENS.map((token) => (
            <div key={token.name} className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
              <div className="h-20" style={{ backgroundColor: `var(${token.var})` }} />
              <div className="bg-surface p-3">
                <p className="font-mono text-xs text-primary">{token.name}</p>
                <p className="text-xs text-muted">{token.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("sections.typography")}>
        <div className="space-y-4">
          <p className="font-display text-6xl font-bold text-primary">Geist 64</p>
          <p className="font-display text-4xl font-bold text-primary">Geist 36</p>
          <p className="font-display text-2xl font-medium text-primary">Geist 22</p>
          <p className="text-base text-secondary">
            Geist 16 — corps de texte principal, lisibilité maximale en thème clair comme sombre.
          </p>
          <p className="font-mono text-xl text-cyan">Geist Mono — 128 450 € de CA annuel</p>
        </div>
      </Section>

      <Section title={t("sections.buttons")}>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" className="glow-royal-hover">
            Primaire
          </Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="gold">Action dorée</Button>
          <Button variant="primary" size="sm">
            Petit
          </Button>
          <Button variant="primary" size="lg" className="glow-royal-hover">
            Grand
          </Button>
          <Button variant="primary" disabled>
            Désactivé
          </Button>
        </div>
      </Section>

      <Section title={t("sections.badges")}>
        <div className="flex flex-wrap items-center gap-4">
          <ShariaVerifiedBadge />
          <Badge variant="neutral">FBA</Badge>
          <Badge variant="royal">Shopify</Badge>
          <Badge variant="cyan">SaaS</Badge>
          <Badge variant="success">Publié</Badge>
          <Badge variant="warning">Sous audit</Badge>
          <Badge variant="danger">Rejeté</Badge>
        </div>
      </Section>

      <Section title={t("sections.cards")}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glow-royal-hover">
            <CardHeader>
              <CardTitle>Boutique Amazon FBA</CardTitle>
              <CardDescription>Puériculture · 3 ans d&apos;ancienneté</CardDescription>
            </CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="royal">FBA</Badge>
              <ShariaVerifiedBadge />
            </div>
          </Card>
          <Card className="glow-royal-hover">
            <CardHeader>
              <CardTitle>SaaS B2B RH</CardTitle>
              <CardDescription>MRR croissant · churn maîtrisé</CardDescription>
            </CardHeader>
            <Badge variant="cyan">SaaS</Badge>
          </Card>
          <Card className="glow-royal-hover">
            <CardHeader>
              <CardTitle>Site de contenu</CardTitle>
              <CardDescription>Affiliation · trafic SEO organique</CardDescription>
            </CardHeader>
            <Badge variant="neutral">Contenu</Badge>
          </Card>
        </div>
      </Section>

      <Section title={t("sections.financials")}>
        <div className="grid gap-6 md:grid-cols-3">
          <LockedFinancial label="Chiffre d'affaires annuel" previewValue="184 320 €" />
          <LockedFinancial label="Marge nette" previewValue="41 200 €" />
          <LockedFinancial label="Multiple de valorisation" previewValue="2.8x" />
        </div>
      </Section>

      <Section title={t("sections.forms")}>
        <div className="max-w-md space-y-4">
          <div>
            <Label htmlFor="ds-email">Adresse email</Label>
            <Input id="ds-email" type="email" placeholder="vous@exemple.com" />
          </div>
          <div>
            <Label htmlFor="ds-price">Prix de cession souhaité</Label>
            <Input id="ds-price" type="number" placeholder="150 000" />
          </div>
        </div>
      </Section>

      <Section title={t("sections.motion")}>
        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn>
            <Card>
              <CardTitle>Fade-up au scroll</CardTitle>
              <CardDescription className="mt-2">
                Apparition orchestrée avec un décalage de 60ms entre éléments.
              </CardDescription>
            </Card>
          </FadeIn>
          <Card>
            <CardTitle>Compteur animé</CardTitle>
            <AnimatedCounter value={2840} suffix=" deals" className="mt-2 block font-mono text-3xl text-cyan" />
          </Card>
        </div>
      </Section>
    </div>
  );
}
