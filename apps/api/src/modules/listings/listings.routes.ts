import { Router } from "express";
import {
  listingDraftSchema,
  listingUpdateSchema,
  listingSearchQuerySchema,
  listingReviewSchema,
  objectIdSchema,
} from "@muzzap/shared";
import { z } from "zod";
import { listingsController } from "./listings.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireRole, requireCapability, optionalAuth } from "../../middlewares/auth.middleware.js";

export const listingsRouter: Router = Router();

const idParamSchema = z.object({ id: objectIdSchema });

listingsRouter.get(
  "/",
  optionalAuth,
  validate({ query: listingSearchQuerySchema }),
  listingsController.search,
);

listingsRouter.get(
  "/mine",
  requireAuth,
  requireCapability("seller"),
  listingsController.mine,
);

listingsRouter.post(
  "/",
  requireAuth,
  requireCapability("seller"),
  validate({ body: listingDraftSchema }),
  listingsController.create,
);

listingsRouter.get(
  "/:id",
  optionalAuth,
  validate({ params: idParamSchema }),
  listingsController.getById,
);

listingsRouter.patch(
  "/:id",
  requireAuth,
  requireCapability("seller"),
  validate({ params: idParamSchema, body: listingUpdateSchema }),
  listingsController.update,
);

listingsRouter.post(
  "/:id/submit",
  requireAuth,
  requireCapability("seller"),
  validate({ params: idParamSchema }),
  listingsController.submit,
);

listingsRouter.get(
  "/:id/audit-status",
  requireAuth,
  validate({ params: idParamSchema }),
  listingsController.auditStatus,
);

listingsRouter.post(
  "/:id/review",
  requireAuth,
  requireRole("admin"),
  validate({ params: idParamSchema, body: listingReviewSchema }),
  listingsController.review,
);

listingsRouter.post(
  "/:id/feature",
  requireAuth,
  requireRole("admin"),
  validate({ params: idParamSchema, body: z.object({ isFeatured: z.boolean() }) }),
  listingsController.setFeatured,
);
