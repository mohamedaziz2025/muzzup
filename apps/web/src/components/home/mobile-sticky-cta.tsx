"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Floating mobile-only CTA bar for anonymous homepage visitors — appears once they've scrolled
 * past the hero. Hidden for authenticated members, who already get the site-wide BottomNav.
 */
export function MobileStickyCta() {
  const { user, isHydrated } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 560);
  });

  if (isHydrated && user) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl shadow-black/20 sm:hidden"
        >
          <p className="pl-2 text-sm font-medium text-primary">Prêt à démarrer ?</p>
          <Link href="/annonces" className="group shrink-0">
            <Button size="sm" className="glow-royal-hover gap-1.5">
              Explorer
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
