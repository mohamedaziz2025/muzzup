import { Router } from "express";
import { z } from "zod";
import { CMS_LOCALES } from "../../models/cms-content.model.js";
import { cmsController } from "./cms.controller.js";
import { validate } from "../../middlewares/validate.js";

export const cmsRouter: Router = Router();

const publicQuerySchema = z.object({
  locale: z.enum(CMS_LOCALES).default("fr"),
  keys: z.string().optional(),
});

cmsRouter.get("/", validate({ query: publicQuerySchema }), cmsController.getPublic);
