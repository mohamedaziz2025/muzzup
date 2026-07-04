import { Router } from "express";
import { billingController } from "./billing.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const billingRouter: Router = Router();

billingRouter.use(requireAuth);
billingRouter.post("/checkout-session", billingController.createCheckoutSession);
billingRouter.post("/portal-session", billingController.createPortalSession);
