import type { Request, Response } from "express";
import { billingService } from "./billing.service.js";

export const billingController = {
  async createCheckoutSession(req: Request, res: Response) {
    const data = await billingService.createCheckoutSession(req.auth!.userId);
    res.status(200).json({ success: true, data });
  },

  async createPortalSession(req: Request, res: Response) {
    const data = await billingService.createPortalSession(req.auth!.userId);
    res.status(200).json({ success: true, data });
  },
};
