"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "left" | "right";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Entrance direction — "up" (default) fades in from below, "left"/"right" slide in from the side. */
  direction?: Direction;
}

const OFFSETS: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 },
  left: { x: -32 },
  right: { x: 32 },
};

/** Standard scroll-reveal: fade + directional offset, orchestrated with a stagger by the caller's `delay`. */
export function FadeIn({ children, delay = 0, className, direction = "up" }: FadeInProps) {
  const offset = OFFSETS[direction];
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
