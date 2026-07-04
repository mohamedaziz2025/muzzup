import { Router } from "express";
import { createChecklistTemplateSchema } from "@muzzap/shared";
import { HalalChecklistTemplateModel } from "../../models/halal-checklist-template.model.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import type { Request, Response } from "express";
import type { CreateChecklistTemplateInput } from "@muzzap/shared";

export const checklistTemplatesRouter: Router = Router();

checklistTemplatesRouter.use(requireAuth, requireRole("admin"));

checklistTemplatesRouter.get("/", async (_req: Request, res: Response) => {
  const templates = await HalalChecklistTemplateModel.find().sort({ createdAt: -1 }).exec();
  res.status(200).json({ success: true, data: { templates } });
});

checklistTemplatesRouter.post(
  "/",
  validate({ body: createChecklistTemplateSchema }),
  async (req: Request, res: Response) => {
    const { name, items } = req.body as CreateChecklistTemplateInput;
    // Only one template is active at a time — new templates supersede the current one.
    await HalalChecklistTemplateModel.updateMany({ isActive: true }, { isActive: false });
    const template = await HalalChecklistTemplateModel.create({
      name,
      items,
      isActive: true,
      createdBy: req.auth!.userId,
    });
    res.status(201).json({ success: true, data: { template } });
  },
);
