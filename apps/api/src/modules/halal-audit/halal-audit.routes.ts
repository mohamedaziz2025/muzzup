import { Router } from "express";
import { updateAuditItemsSchema, completeAuditSchema, objectIdSchema } from "@muzzap/shared";
import { z } from "zod";
import { halalAuditController } from "./halal-audit.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

export const halalAuditRouter: Router = Router();

halalAuditRouter.use(requireAuth, requireRole("halal_auditor"));

const idParamSchema = z.object({ id: objectIdSchema });

halalAuditRouter.get("/queue", halalAuditController.queue);
halalAuditRouter.get("/mine", halalAuditController.mine);
halalAuditRouter.post(
  "/:id/claim",
  validate({ params: idParamSchema }),
  halalAuditController.claim,
);
halalAuditRouter.patch(
  "/:id/items",
  validate({ params: idParamSchema, body: updateAuditItemsSchema }),
  halalAuditController.updateItems,
);
halalAuditRouter.post(
  "/:id/complete",
  validate({ params: idParamSchema, body: completeAuditSchema }),
  halalAuditController.complete,
);
