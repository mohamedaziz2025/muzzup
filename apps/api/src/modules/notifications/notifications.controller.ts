import type { Request, Response } from "express";
import { notificationsService } from "./notifications.service.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const notifications = await notificationsService.listForUser(req.auth!.userId);
    res.status(200).json({ success: true, data: { notifications } });
  },

  async markRead(req: Request, res: Response) {
    await notificationsService.markRead(req.auth!.userId, req.params.id as string);
    res.status(204).send();
  },

  async markAllRead(req: Request, res: Response) {
    await notificationsService.markAllRead(req.auth!.userId);
    res.status(204).send();
  },
};
