"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import gsap from "gsap";

export interface ShowcaseCard {
  id: string;
  label: string;
  sector: string;
  multiple: string;
  revenue: string;
  accent: string;
  className: string;
  depth: number;
}

export const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    id: "fba",
    label: "Amazon FBA",
    sector: "Cosmétiques bio",
    multiple: "3,1x",
    revenue: "18 400€/mo",
    accent: "from-royal/40 to-transparent",
    className: "left-[2%] top-[8%] rotate-[-6deg]",
    depth: 18,
  },
  {
    id: "shopify",
    label: "Shopify",
    sector: "Maison & déco",
    multiple: "2,6x",
    revenue: "9 200€/mo",
    accent: "from-cyan/40 to-transparent",
    className: "right-[4%] top-[2%] rotate-[5deg]",
    depth: 26,
  },
  {
    id: "saas",
    label: "SaaS",
    sector: "Outil productivité",
    multiple: "4,4x",
    revenue: "24 900€/mo",
    accent: "from-gold/35 to-transparent",
    className: "left-[10%] bottom-[4%] rotate-[4deg]",
    depth: 12,
  },
  {
    id: "content",
    label: "Contenu",
    sector: "Blog affiliation",
    multiple: "2,2x",
    revenue: "5 100€/mo",
    accent: "from-royal/30 to-transparent",
    className: "right-[8%] bottom-[10%] rotate-[-4deg]",
    depth: 22,
  },
];

function ShowcaseCardEl({
  card,
  mouseX,
  mouseY,
}: {
  card: ShowcaseCard;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!floatRef.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    tl.to(floatRef.current, {
      y: card.depth,
      duration: 3.5 + card.depth / 10,
    });
    return () => {
      tl.kill();
    };
  }, [card.depth]);

  const rotateX = useTransform(mouseY, (v) => v * (card.depth / 6));
  const rotateY = useTransform(mouseX, (v) => -v * (card.depth / 6));
  const springX = useSpring(rotateY, { stiffness: 80, damping: 12 });
  const springYRot = useSpring(rotateX, { stiffness: 80, damping: 12 });

  return (
    <div ref={floatRef} className={`absolute hidden w-52 sm:block ${card.className}`}>
      <motion.div style={{ rotateX: springYRot, rotateY: springX, transformPerspective: 800 }}>
        <div className="glass relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4 shadow-xl shadow-black/10">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-60`} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-abyss/60 px-2 py-0.5 text-[10px] font-medium text-cyan">
                {card.label}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-medium text-gold">
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-2.5">
                  <path d="M10 1.5l2.4 5 5.6.8-4 4 1 5.5L10 14.9 5 16.8l1-5.5-4-4 5.6-.8L10 1.5z" />
                </svg>
                Sharia Vérifié
              </span>
            </div>
            <p className="mt-3 text-xs text-secondary">{card.sector}</p>
            <p className="mt-1 font-display text-lg font-bold text-primary">{card.revenue}</p>
            <p className="mt-1 text-[11px] text-muted">Multiple {card.multiple}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Ambient showcase behind the hero: idle floating business cards with mouse-reactive 3D parallax. */
export function FloatingBusinessCards() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      className="pointer-events-none absolute inset-0 [perspective:1200px] sm:pointer-events-auto"
    >
      {SHOWCASE_CARDS.map((card) => (
        <ShowcaseCardEl key={card.id} card={card} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
}
