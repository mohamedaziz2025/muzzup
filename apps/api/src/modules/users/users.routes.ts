import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { updateProfileSchema, deleteAccountSchema } from "@muzzap/shared";
import { usersController } from "./users.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { BadRequestError } from "../../lib/errors.js";

export const usersRouter: Router = Router();

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
});

/** Adapts multer's callback-style error into the app's centralized AppError error handler. */
function uploadAvatarFile(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "Image trop volumineuse (5 Mo maximum)"
          : "Échec de l'upload de l'image";
      next(new BadRequestError(message));
      return;
    }
    next();
  });
}

usersRouter.use(requireAuth);
usersRouter.get("/me", usersController.me);
usersRouter.patch("/me", validate({ body: updateProfileSchema }), usersController.updateMe);
usersRouter.post("/me/avatar", uploadAvatarFile, usersController.uploadAvatar);
usersRouter.get("/me/export", usersController.exportMyData);
usersRouter.delete("/me", validate({ body: deleteAccountSchema }), usersController.deleteMe);
