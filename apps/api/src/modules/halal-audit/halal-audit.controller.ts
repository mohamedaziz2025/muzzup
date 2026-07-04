import type { Request, Response } from "express";
import type { UpdateAuditItemsInput, CompleteAuditInput } from "@muzzap/shared";
import { halalAuditService } from "./halal-audit.service.js";

function paramId(req: Request): string {
  return req.params.id as string;
}

export const halalAuditController = {
  async queue(_req: Request, res: Response) {
    const audits = await halalAuditService.listQueue();
    res.status(200).json({ success: true, data: { audits } });
  },

  async mine(req: Request, res: Response) {
    const audits = await halalAuditService.listMine(req.auth!.userId);
    res.status(200).json({ success: true, data: { audits } });
  },

  async queuePosition(req: Request, res: Response) {
    const position = await halalAuditService.getQueuePosition(paramId(req));
    res.status(200).json({ success: true, data: { position } });
  },

  async claim(req: Request, res: Response) {
    const audit = await halalAuditService.claim(paramId(req), req.auth!.userId);
    res.status(200).json({ success: true, data: { audit } });
  },

  async updateItems(req: Request, res: Response) {
    const { items } = req.body as UpdateAuditItemsInput;
    const audit = await halalAuditService.updateItems(paramId(req), req.auth!.userId, items);
    res.status(200).json({ success: true, data: { audit } });
  },

  async complete(req: Request, res: Response) {
    const { decision, vigilancePoints, reportSummary } = req.body as CompleteAuditInput;
    const audit = await halalAuditService.complete(
      paramId(req),
      req.auth!.userId,
      decision,
      vigilancePoints,
      reportSummary,
    );
    res.status(200).json({ success: true, data: { audit } });
  },
};
