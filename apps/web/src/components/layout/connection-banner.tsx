"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useConnectionStore } from "@/stores/connection-store";
import { useAuthStore } from "@/stores/auth-store";

/** Surfaces realtime (Socket.io) connectivity issues in the UI instead of only logging to console. */
export function ConnectionBanner() {
  const status = useConnectionStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const show = !!user && status !== "connected";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-b border-warning/30 bg-warning/10"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-xs text-warning sm:px-6">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-warning" />
            </span>
            {status === "connecting"
              ? "Reconnexion au service temps réel en cours…"
              : "Connexion temps réel interrompue — la messagerie instantanée et les notifications live sont en pause, le reste de l'application fonctionne normalement."}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
