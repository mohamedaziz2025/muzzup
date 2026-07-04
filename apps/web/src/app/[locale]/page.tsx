import { QuickEstimator } from "@/components/ai/quick-estimator";
import { Hero } from "@/components/home/hero";
import { StatsBand } from "@/components/home/stats-band";
import { ValueProps } from "@/components/home/value-props";
import { CategoryGrid } from "@/components/home/category-grid";
import { BuyersCta } from "@/components/home/buyers-cta";
import { SellersCta } from "@/components/home/sellers-cta";
import { HowItWorks } from "@/components/home/how-it-works";
import { FeaturedListings } from "@/components/home/featured-listings";
import { SuccessStories } from "@/components/home/success-stories";
import { FinalCta } from "@/components/home/final-cta";
import { MobileStickyCta } from "@/components/home/mobile-sticky-cta";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <StatsBand />
      <ValueProps />
      <CategoryGrid />
      <BuyersCta />
      <SellersCta />
      <HowItWorks />
      <FeaturedListings />

      <section id="estimer" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <QuickEstimator />
      </section>

      <SuccessStories />
      <FinalCta />
      <MobileStickyCta />
    </div>
  );
}
