import type { Request, Response } from "express";
import type { DeclareProofOfFundsInput, ReviewProofOfFundsInput } from "@muzzap/shared";
import { buyerSeriousnessService } from "./buyer-seriousness.service.js";

export const buyerSeriousnessController = {
  async me(req: Request, res: Response) {
    const record = await buyerSeriousnessService.getOrCreate(req.auth!.userId);
    res.status(200).json({ success: true, data: { seriousness: record } });
  },

  async declareProofOfFunds(req: Request, res: Response) {
    const { storageKey, amountDeclared } = req.body as DeclareProofOfFundsInput;
    const record = await buyerSeriousnessService.declareProofOfFunds(
      req.auth!.userId,
      storageKey,
      amountDeclared,
    );
    res.status(200).json({ success: true, data: { seriousness: record } });
  },

  async reviewProofOfFunds(req: Request, res: Response) {
    const { decision, rejectionReason } = req.body as ReviewProofOfFundsInput;
    const record = await buyerSeriousnessService.reviewProofOfFunds(
      req.params.userId as string,
      req.auth!.userId,
      decision,
      rejectionReason,
    );
    res.status(200).json({ success: true, data: { seriousness: record } });
  },

  async startKyc(req: Request, res: Response) {
    const data = await buyerSeriousnessService.startKyc(req.auth!.userId);
    res.status(200).json({ success: true, data });
  },

  async completeKyc(req: Request, res: Response) {
    const { approved } = req.body as { approved: boolean };
    const user = await buyerSeriousnessService.completeKyc(req.params.userId as string, approved);
    res.status(200).json({ success: true, data: { kycStatus: user.kycStatus } });
  },
};
