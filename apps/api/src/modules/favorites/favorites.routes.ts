import { Router } from "express";
import { z } from "zod";
import { objectIdSchema } from "@muzzap/shared";
import { favoritesController } from "./favorites.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const favoritesRouter: Router = Router();

favoritesRouter.use(requireAuth);

favoritesRouter.get("/mine", favoritesController.mine);
favoritesRouter.get("/mine/ids", favoritesController.mineIds);
favoritesRouter.post(
  "/:listingId/toggle",
  validate({ params: z.object({ listingId: objectIdSchema }) }),
  favoritesController.toggle,
);
