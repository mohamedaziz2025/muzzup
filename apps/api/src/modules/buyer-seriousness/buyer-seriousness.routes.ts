import { Router } from "express";
import { z } from "zod";
import {
  declareProofOfFundsSchema,
  reviewProofOfFundsSchema,
  objectIdSchema,
} from "@muzzap/shared";
import { buyerSeriousnessController } from "./buyer-seriousness.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

export const buyerSeriousnessRouter: Router = Router();

buyerSeriousnessRouter.use(requireAuth);

buyerSeriousnessRouter.get("/me", buyerSeriousnessController.me);
buyerSeriousnessRouter.post(
  "/me/proof-of-funds",
  validate({ body: declareProofOfFundsSchema }),
  buyerSeriousnessController.declareProofOfFunds,
);
buyerSeriousnessRouter.post("/me/kyc", buyerSeriousnessController.startKyc);
buyerSeriousnessRouter.post(
  "/me/kyc/dev-complete",
  validate({ body: z.object({ approved: z.boolean() }) }),
  buyerSeriousnessController.completeKyc,
);

buyerSeriousnessRouter.post(
  "/:userId/proof-of-funds/review",
  requireRole("admin"),
  validate({ params: z.object({ userId: objectIdSchema }), body: reviewProofOfFundsSchema }),
  buyerSeriousnessController.reviewProofOfFunds,
);
