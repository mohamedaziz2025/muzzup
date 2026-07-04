import { Router } from "express";
import { updateProfileSchema, deleteAccountSchema } from "@muzzap/shared";
import { usersController } from "./users.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const usersRouter: Router = Router();

usersRouter.use(requireAuth);
usersRouter.get("/me", usersController.me);
usersRouter.patch("/me", validate({ body: updateProfileSchema }), usersController.updateMe);
usersRouter.get("/me/export", usersController.exportMyData);
usersRouter.delete("/me", validate({ body: deleteAccountSchema }), usersController.deleteMe);
