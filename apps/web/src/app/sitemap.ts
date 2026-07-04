import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const PUBLIC_PATHS = ["", "/annonces", "/prestataires", "/abonnement", "/connexion", "/inscription"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://muzzap.fr";

  return routing.locales.flatMap((locale) =>
    PUBLIC_PATHS.map((path) => ({
      url: `${base}${locale === routing.defaultLocale ? "" : `/${locale}`}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
