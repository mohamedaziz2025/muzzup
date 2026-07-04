import type { Request, Response } from "express";
import type {
  QuickEstimateInput,
  UpsertValuationMultipleInput,
  HumanVerdictInput,
} from "@muzzap/shared";
import { aiService } from "./ai.service.js";

export const aiController = {
  async quickEstimate(req: Request, res: Response) {
    const result = await aiService.quickEstimate(req.body as QuickEstimateInput);
    res.status(200).json({ success: true, data: result });
  },

  async deepEstimate(req: Request, res: Response) {
    const { listingId } = req.body as { listingId: string };
    const result = await aiService.deepEstimate(req.auth!.userId, listingId);
    res.status(200).json({ success: true, data: result });
  },

  async listingAnalyses(req: Request, res: Response) {
    const analyses = await aiService.listForListing(req.params.listingId as string);
    res.status(200).json({ success: true, data: { analyses } });
  },

  async setVerdict(req: Request, res: Response) {
    const { verdict, note } = req.body as HumanVerdictInput;
    const analysis = await aiService.setHumanVerdict(
      req.params.id as string,
      req.auth!.userId,
      verdict,
      note,
    );
    res.status(200).json({ success: true, data: { analysis } });
  },

  async listMultiples(_req: Request, res: Response) {
    const multiples = await aiService.listMultiples();
    res.status(200).json({ success: true, data: { multiples } });
  },

  async upsertMultiple(req: Request, res: Response) {
    const { type, profitMultipleLow, profitMultipleHigh } = req.body as UpsertValuationMultipleInput;
    const multiple = await aiService.upsertMultiple(
      type,
      profitMultipleLow,
      profitMultipleHigh,
      req.auth!.userId,
    );
    res.status(200).json({ success: true, data: { multiple } });
  },
};
