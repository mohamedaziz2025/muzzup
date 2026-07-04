import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://muzzap.fr";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/tableau-de-bord", "/admin", "/auditeur", "/messages", "/transactions"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
