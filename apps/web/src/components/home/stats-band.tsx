import { Award, Handshake, TrendingUp, ShieldCheck } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { FadeIn } from "@/components/ui/fade-in";

const STATS = [
  { icon: Award, value: 128, suffix: "", label: "Business audités" },
  { icon: Handshake, value: 42, suffix: "", label: "Deals closés" },
  { icon: TrendingUp, value: 6, suffix: "M€", label: "Volume traité" },
  { icon: ShieldCheck, value: 100, suffix: "%", label: "Audit humain" },
];

/** Trust band directly under the hero, à la acquire.com — same fixed-dark band, icon + figure + label. */
export function StatsBand() {
  return (
    <section className="theme-dark-fixed border-b border-[var(--border-subtle)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 text-center md:grid-cols-4">
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <div className="flex flex-col items-center gap-2">
              <stat.icon className="size-5 text-cyan" strokeWidth={1.7} />
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                className="font-mono text-3xl font-semibold text-primary"
              />
              <p className="text-sm text-secondary">{stat.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
