import { Router } from "express";
import { objectIdSchema } from "@muzzap/shared";
import { z } from "zod";
import { notificationsController } from "./notifications.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const notificationsRouter: Router = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get("/", notificationsController.list);
notificationsRouter.post(
  "/:id/read",
  validate({ params: z.object({ id: objectIdSchema }) }),
  notificationsController.markRead,
);
notificationsRouter.post("/read-all", notificationsController.markAllRead);
