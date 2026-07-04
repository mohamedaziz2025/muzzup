import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, RTL_LOCALES } from "@/i18n/routing";
import { AppQueryProvider } from "@/lib/query-client";
import { SessionProvider } from "@/components/auth/session-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AppShell } from "@/components/layout/app-shell";
import { ConnectionBanner } from "@/components/layout/connection-banner";
import "../globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500"],
});
const baloo2 = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", weight: ["600", "700"] });

/** Must match THEME_STORAGE_KEY in stores/theme-store.ts. Runs before paint to avoid a flash. */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("muzzup-theme");if(t!=="dark"&&t!=="light"){t="light";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const metadata: Metadata = {
  title: "Muzzup — Marketplace de cession de business 100% halal",
  description:
    "Achetez, vendez et financez des boutiques Amazon FBA, Shopify, SaaS et sites de contenu, audités selon des critères Sharia stricts.",
  icons: { icon: "/icon.svg" },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${baloo2.variable} min-h-screen bg-abyss font-body text-primary`}
      >
        <NextIntlClientProvider messages={messages}>
          <AppQueryProvider>
            <SessionProvider>
              <Header />
              <ConnectionBanner />
              <AppShell>{children}</AppShell>
              <Footer />
            </SessionProvider>
          </AppQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
