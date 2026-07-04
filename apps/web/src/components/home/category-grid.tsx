import { Package, ShoppingBag, Cpu, FileText, Users, Landmark, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";

const CATEGORIES = [
  {
    href: "/annonces?type=fba",
    icon: Package,
    label: "Amazon FBA",
    description: "Boutiques e-commerce prêtes à scaler",
  },
  {
    href: "/annonces?type=shopify",
    icon: ShoppingBag,
    label: "Shopify",
    description: "Marques D2C et dropshipping établi",
  },
  {
    href: "/annonces?type=saas",
    icon: Cpu,
    label: "SaaS",
    description: "Logiciels récurrents, MRR vérifié",
  },
  {
    href: "/annonces?type=content",
    icon: FileText,
    label: "Contenu",
    description: "Blogs et sites d'affiliation SEO",
  },
  {
    href: "/prestataires",
    icon: Users,
    label: "Prestataires",
    description: "Experts pour vous accompagner",
  },
  {
    href: "/annonces?espace=financer",
    icon: Landmark,
    label: "Financer",
    description: "Structurez une acquisition conforme",
  },
];

/** "Browse by category" tiles, à la acquire.com — quick entry points into the search results. */
export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-center text-sm font-medium uppercase tracking-widest text-cyan">
          Explorer
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold text-primary md:text-4xl">
          Parcourir par catégorie
        </h2>
      </FadeIn>

      <div className="-mx-6 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat, i) => (
          <FadeIn
            key={cat.label}
            delay={i * 0.05}
            className="w-[78%] max-w-xs shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink"
          >
            <Link
              href={cat.href}
              className="glass card-shadow group flex h-full items-center gap-4 rounded-[var(--radius-lg)] p-5 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-royal/15 text-royal transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                <cat.icon className="size-6" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <p className="font-display text-base font-semibold text-primary">{cat.label}</p>
                <p className="mt-0.5 text-sm text-secondary">{cat.description}</p>
              </div>
              <ArrowUpRight
                className="size-4 shrink-0 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-royal"
                strokeWidth={1.8}
              />
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
