import { Router } from "express";
import { z } from "zod";
import {
  upsertProviderProfileSchema,
  providerSearchQuerySchema,
  createReviewSchema,
  objectIdSchema,
} from "@muzzap/shared";
import { providersController } from "./providers.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireCapability } from "../../middlewares/auth.middleware.js";

export const providersRouter: Router = Router();

const idParamSchema = z.object({ id: objectIdSchema });

providersRouter.get("/", validate({ query: providerSearchQuerySchema }), providersController.search);

providersRouter.get(
  "/me",
  requireAuth,
  requireCapability("provider"),
  providersController.myProfile,
);
providersRouter.put(
  "/me",
  requireAuth,
  requireCapability("provider"),
  validate({ body: upsertProviderProfileSchema }),
  providersController.upsertMyProfile,
);

providersRouter.get("/:id", validate({ params: idParamSchema }), providersController.getById);
providersRouter.get(
  "/:id/reviews",
  validate({ params: idParamSchema }),
  providersController.listReviews,
);
providersRouter.post(
  "/:id/reviews",
  requireAuth,
  validate({ params: idParamSchema, body: createReviewSchema }),
  providersController.createReview,
);
providersRouter.post(
  "/:id/sponsor",
  requireAuth,
  validate({ params: idParamSchema }),
  providersController.sponsoredCheckout,
);
providersRouter.post(
  "/:id/contact",
  requireAuth,
  validate({ params: idParamSchema }),
  providersController.contact,
);
