"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: ReactNode;
  accent: "royal" | "cyan" | "gold" | "success";
  delay?: number;
}

const ACCENT_STYLES: Record<StatCardProps["accent"], string> = {
  royal: "from-royal/25 to-transparent text-royal",
  cyan: "from-cyan/25 to-transparent text-cyan",
  gold: "from-gold/25 to-transparent text-gold",
  success: "from-success/25 to-transparent text-success",
};

export function StatCard({ label, value, suffix = "", icon, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="glass relative overflow-hidden rounded-[var(--radius-md)] p-5"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENT_STYLES[accent]} opacity-20`} />
      <div className="relative">
        <div className={`flex size-9 items-center justify-center rounded-full bg-abyss/50 ${ACCENT_STYLES[accent].split(" ").pop()}`}>
          {icon}
        </div>
        <p className="mt-3 font-display text-2xl font-bold text-primary">
          <AnimatedCounter value={value} suffix={suffix} />
        </p>
        <p className="mt-1 text-xs text-secondary">{label}</p>
      </div>
    </motion.div>
  );
}
