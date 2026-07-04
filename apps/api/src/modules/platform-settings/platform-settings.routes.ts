import { Router } from "express";
import { z } from "zod";
import { platformSettingsController } from "./platform-settings.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

export const platformSettingsRouter: Router = Router();

platformSettingsRouter.use(requireAuth, requireRole("admin"));

const updateSettingsSchema = z
  .object({
    commissionRate: z.number().min(0).max(1).optional(),
    currencies: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    registrationOpen: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().max(1000).optional(),
    supportEmail: z.string().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni",
  });

// Declared before "/" so it isn't shadowed by any future param routes on this router.
platformSettingsRouter.get("/infrastructure", platformSettingsController.infrastructure);

platformSettingsRouter.get("/", platformSettingsController.getSettings);
platformSettingsRouter.patch(
  "/",
  validate({ body: updateSettingsSchema }),
  platformSettingsController.updateSettings,
);
