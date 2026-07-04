import { Router } from "express";
import { z } from "zod";
import { objectIdSchema } from "@muzzap/shared";
import { dataRoomController } from "./data-room.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const dataRoomRouter: Router = Router({ mergeParams: true });

const listingParamSchema = z.object({ listingId: objectIdSchema });

dataRoomRouter.use(requireAuth);

dataRoomRouter.get("/", validate({ params: listingParamSchema }), dataRoomController.get);

dataRoomRouter.post(
  "/upload-url",
  validate({
    params: listingParamSchema,
    body: z.object({ fileName: z.string().min(1).max(200), contentType: z.string().min(1) }),
  }),
  dataRoomController.requestUpload,
);

dataRoomRouter.post(
  "/documents",
  validate({
    params: listingParamSchema,
    body: z.object({
      fileName: z.string().min(1).max(200),
      storageKey: z.string().min(1),
      contentType: z.string().min(1),
    }),
  }),
  dataRoomController.registerDocument,
);

dataRoomRouter.get(
  "/documents/:documentId/download",
  validate({
    params: listingParamSchema.extend({ documentId: objectIdSchema }),
  }),
  dataRoomController.download,
);
