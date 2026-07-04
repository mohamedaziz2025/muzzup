import { Router } from "express";
import { z } from "zod";
import {
  startConversationSchema,
  sendMessageSchema,
  proposeRevealSchema,
  respondRevealSchema,
  objectIdSchema,
} from "@muzzap/shared";
import { chatController } from "./chat.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const chatRouter: Router = Router();

chatRouter.use(requireAuth);

const idParamSchema = z.object({ id: objectIdSchema });

chatRouter.get("/conversations", chatController.list);
chatRouter.post(
  "/conversations",
  validate({ body: startConversationSchema }),
  chatController.start,
);
chatRouter.get(
  "/conversations/:id/messages",
  validate({ params: idParamSchema }),
  chatController.messages,
);
chatRouter.post(
  "/conversations/:id/messages",
  validate({ params: idParamSchema, body: sendMessageSchema }),
  chatController.sendMessage,
);
chatRouter.post(
  "/conversations/:id/reveal-requests",
  validate({ params: idParamSchema, body: proposeRevealSchema }),
  chatController.proposeReveal,
);
chatRouter.post(
  "/reveal-requests/:requestId/respond",
  validate({ params: z.object({ requestId: objectIdSchema }), body: respondRevealSchema }),
  chatController.respondReveal,
);
chatRouter.post(
  "/conversations/:id/nda",
  validate({ params: idParamSchema }),
  chatController.requestNda,
);
chatRouter.post(
  "/nda/:ndaId/dev-mark-signed",
  validate({ params: z.object({ ndaId: objectIdSchema }) }),
  chatController.markNdaSigned,
);
