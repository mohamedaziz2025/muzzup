import { Router } from "express";
import { z } from "zod";
import { objectIdSchema } from "@muzzap/shared";
import { REPORT_TARGET_TYPES } from "../../models/report.model.js";
import { reportsController } from "./reports.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const reportsRouter: Router = Router();

const createReportBodySchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES),
  targetId: objectIdSchema,
  reason: z.string().trim().min(1).max(100),
  details: z.string().trim().max(2000).optional(),
});

reportsRouter.post(
  "/",
  requireAuth,
  validate({ body: createReportBodySchema }),
  reportsController.create,
);
