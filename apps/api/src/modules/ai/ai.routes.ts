 import { Router } from "express";
import { z } from "zod";
import {
  quickEstimateInputSchema,
  upsertValuationMultipleSchema,
  humanVerdictSchema,
  objectIdSchema,
} from "@muzzap/shared";
import { aiController } from "./ai.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireRole, requireCapability } from "../../middlewares/auth.middleware.js";
import { authRateLimiter } from "../../middlewares/rate-limit.js";

export const aiRouter: Router = Router();

// Outil A — public lead magnet, no auth, rate-limited to deter scraping/abuse.
aiRouter.post(
  "/estimate/quick",
  authRateLimiter,
  validate({ body: quickEstimateInputSchema }),
  aiController.quickEstimate,
);

// Outil B — vendeur abonné uniquement.
aiRouter.post(
  "/estimate/deep",
  requireAuth,
  requireCapability("seller"),
  validate({ body: z.object({ listingId: objectIdSchema }) }),
  aiController.deepEstimate,
);

aiRouter.get(
  "/listings/:listingId/ai-analyses",
  requireAuth,
  requireRole("halal_auditor"),
  validate({ params: z.object({ listingId: objectIdSchema }) }),
  aiController.listingAnalyses,
);

aiRouter.post(
  "/ai-analyses/:id/verdict",
  requireAuth,
  requireRole("halal_auditor"),
  validate({ params: z.object({ id: objectIdSchema }), body: humanVerdictSchema }),
  aiController.setVerdict,
);

aiRouter.get(
  "/admin/valuation-multiples",
  requireAuth,
  requireRole("admin"),
  aiController.listMultiples,
);
aiRouter.put(
  "/admin/valuation-multiples",
  requireAuth,
  requireRole("admin"),
  validate({ body: upsertValuationMultipleSchema }),
  aiController.upsertMultiple,
);
