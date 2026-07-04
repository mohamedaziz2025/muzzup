"use client";

import { motion } from "framer-motion";

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 1 + (i % 3),
  duration: 14 + (i % 7) * 2,
  delay: (i % 5) * 0.8,
}));

/** Aurora / gradient-mesh backdrop with a few slow-drifting blobs and faint ambient particles. */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, var(--aurora-glow-1), transparent 60%), radial-gradient(circle at 85% 15%, var(--aurora-glow-2), transparent 45%), radial-gradient(circle at 10% 30%, var(--aurora-glow-3), transparent 40%), var(--bg-abyss)",
        }}
      />
      <motion.div
        className="absolute -left-1/4 top-[-10%] size-[60vw] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--aurora-glow-1), transparent 70%)" }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 top-[10%] size-[50vw] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--aurora-glow-2), transparent 70%)" }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-1/3 size-[45vw] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--aurora-glow-3), transparent 70%)" }}
        animate={{ x: [0, 20, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-cyan/40"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0.1, 0.6, 0.1], y: [0, -18, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 100%, var(--aurora-vignette), transparent 60%)",
        }}
      />
    </div>
  );
}
