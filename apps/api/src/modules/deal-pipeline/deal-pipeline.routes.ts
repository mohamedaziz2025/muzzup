import { Router } from "express";
import { z } from "zod";
import {
  createDealPipelineSchema,
  advanceStageSchema,
  freezeDealSchema,
  raiseDisputeSchema,
  resolveDisputeSchema,
  objectIdSchema,
} from "@muzzap/shared";
import { dealPipelineController } from "./deal-pipeline.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const dealPipelineRouter: Router = Router();

dealPipelineRouter.use(requireAuth);

const idParamSchema = z.object({ id: objectIdSchema });

dealPipelineRouter.get("/mine", dealPipelineController.mine);
dealPipelineRouter.get("/all", dealPipelineController.all);
dealPipelineRouter.get("/disputes/open", dealPipelineController.openDisputes);

dealPipelineRouter.post(
  "/",
  validate({ body: createDealPipelineSchema }),
  dealPipelineController.create,
);

dealPipelineRouter.get("/:id", validate({ params: idParamSchema }), dealPipelineController.getById);

dealPipelineRouter.post(
  "/:id/advance",
  validate({ params: idParamSchema, body: advanceStageSchema }),
  dealPipelineController.advance,
);

dealPipelineRouter.post(
  "/:id/freeze",
  validate({ params: idParamSchema, body: freezeDealSchema }),
  dealPipelineController.freeze,
);

dealPipelineRouter.get(
  "/:id/disputes",
  validate({ params: idParamSchema }),
  dealPipelineController.listDisputes,
);

dealPipelineRouter.post(
  "/:id/disputes",
  validate({ params: idParamSchema, body: raiseDisputeSchema }),
  dealPipelineController.raiseDispute,
);

dealPipelineRouter.post(
  "/disputes/:disputeId/resolve",
  validate({ params: z.object({ disputeId: objectIdSchema }), body: resolveDisputeSchema }),
  dealPipelineController.resolveDispute,
);
