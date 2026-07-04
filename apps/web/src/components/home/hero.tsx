"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ShariaVerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";
import { AuroraBackground } from "./aurora-background";
import { FloatingBusinessCards } from "./floating-business-cards";
import { HeroMobilePreview } from "./hero-mobile-preview";

/** Permanently dark hero band, à la acquire.com — independent of the site's light/dark toggle. */
export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="theme-dark-fixed relative overflow-hidden">
      <AuroraBackground />
      <FloatingBusinessCards />

      <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-20 text-center sm:pb-24 sm:pt-24 md:pt-32">
        <FadeIn>
          <ShariaVerifiedBadge />
        </FadeIn>
        <FadeIn delay={0.06}>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-cyan">
            {t("heroEyebrow")}
          </p>
        </FadeIn>
        <FadeIn delay={0.12}>
          <h1 className="mt-4 text-balance font-display text-5xl font-bold leading-[1.05] text-primary md:text-7xl">
            {t("heroTitle")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mt-3 text-balance font-display text-xl font-medium text-gold md:text-2xl">
            {t("heroTagline")}
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-secondary">
            {t("heroSubtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-9 flex justify-center">
            <Link href="/annonces" className="group">
              <Button size="lg" className="glow-royal-hover gap-2">
                Explorer les annonces
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link
              href="/vendre"
              className="text-sm font-medium text-cyan underline decoration-cyan/30 underline-offset-4 hover:decoration-cyan"
            >
              Vous cédez un business ? Déposez une annonce →
            </Link>
          </div>
        </FadeIn>
      </div>

      <HeroMobilePreview />

      <motion.div
        className="relative hidden justify-center pb-6 sm:flex"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <ChevronDown className="size-5 text-muted" strokeWidth={1.6} />
      </motion.div>
    </section>
  );
}
