import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { z } from "zod";
import { objectIdSchema } from "@muzzap/shared";
import { listingDocumentsController } from "./listing-documents.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireCapability } from "../../middlewares/auth.middleware.js";
import { BadRequestError } from "../../lib/errors.js";

export const listingDocumentsRouter: Router = Router({ mergeParams: true });

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

/** Adapts multer's callback-style error into the app's centralized AppError error handler. */
function uploadSingle(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "Fichier trop volumineux (15 Mo maximum)"
          : "Échec de l'upload du fichier";
      next(new BadRequestError(message));
      return;
    }
    next();
  });
}

const listingParamSchema = z.object({ listingId: objectIdSchema });

listingDocumentsRouter.use(requireAuth, requireCapability("seller"));

listingDocumentsRouter.post(
  "/analyze",
  validate({ params: listingParamSchema }),
  uploadSingle,
  listingDocumentsController.analyze,
);
