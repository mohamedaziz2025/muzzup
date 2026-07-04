import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { ShariaVerifiedBadge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const COLUMNS = [
  {
    title: "Vendeurs",
    links: [
      { href: "/vendre", label: "Déposer une annonce" },
      { href: "/abonnement", label: "Abonnement vendeur" },
    ],
  },
  {
    title: "Acheteurs",
    links: [
      { href: "/annonces", label: "Parcourir les annonces" },
      { href: "/abonnement", label: "Abonnement" },
    ],
  },
  {
    title: "Catégories",
    links: [
      { href: "/annonces?type=fba", label: "Amazon FBA" },
      { href: "/annonces?type=shopify", label: "Shopify" },
      { href: "/annonces?type=saas", label: "SaaS" },
      { href: "/annonces?type=content", label: "Contenu" },
    ],
  },
  {
    title: "Prestataires",
    links: [{ href: "/prestataires", label: "Annuaire prestataires" }],
  },
  {
    title: "Compte",
    links: [
      { href: "/connexion", label: "Connexion" },
      { href: "/inscription", label: "Créer un compte" },
    ],
  },
];

/** Permanently dark footer, à la acquire.com — same fixed-dark band regardless of the site theme. */
export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="theme-dark-fixed border-t border-[var(--border-subtle)]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-secondary">{t("tagline")}</p>
            <div className="mt-4">
              <ShariaVerifiedBadge />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-secondary hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Muzzup. {t("rights")}</p>
          <div className="flex items-center gap-4">
            <p>La confiance est le produit.</p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
