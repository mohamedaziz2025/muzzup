import type { Request, Response } from "express";
import type {
  CreateDealPipelineInput,
  AdvanceStageInput,
  FreezeDealInput,
  RaiseDisputeInput,
  ResolveDisputeInput,
} from "@muzzap/shared";
import { dealPipelineService } from "./deal-pipeline.service.js";
import { disputeService } from "./dispute.service.js";
import { ForbiddenError } from "../../lib/errors.js";

function isStaff(req: Request): boolean {
  const roles = req.auth?.roles ?? [];
  return roles.includes("admin") || roles.includes("superadmin");
}

export const dealPipelineController = {
  async create(req: Request, res: Response) {
    if (!isStaff(req)) throw new ForbiddenError();
    const { listingId, buyerId } = req.body as CreateDealPipelineInput;
    const deal = await dealPipelineService.create(listingId, buyerId);
    res.status(201).json({ success: true, data: { deal } });
  },

  async mine(req: Request, res: Response) {
    const deals = await dealPipelineService.listForUser(req.auth!.userId);
    res.status(200).json({ success: true, data: { deals } });
  },

  async all(req: Request, res: Response) {
    if (!isStaff(req)) throw new ForbiddenError();
    const deals = await dealPipelineService.listAll();
    res.status(200).json({ success: true, data: { deals } });
  },

  async getById(req: Request, res: Response) {
    const deal = await dealPipelineService.getByIdOrThrow(req.params.id as string);
    dealPipelineService.assertParticipantOrStaff(deal, req.auth!.userId, isStaff(req));
    res.status(200).json({ success: true, data: { deal } });
  },

  async advance(req: Request, res: Response) {
    if (!isStaff(req)) throw new ForbiddenError();
    const { stage, notes } = req.body as AdvanceStageInput;
    const deal = await dealPipelineService.advanceStage(
      req.params.id as string,
      req.auth!.userId,
      stage,
      notes,
    );
    res.status(200).json({ success: true, data: { deal } });
  },

  async freeze(req: Request, res: Response) {
    const { reason } = req.body as FreezeDealInput;
    const deal = await dealPipelineService.freeze(
      req.params.id as string,
      req.auth!.userId,
      isStaff(req),
      reason,
    );
    res.status(200).json({ success: true, data: { deal } });
  },

  async raiseDispute(req: Request, res: Response) {
    const { reason } = req.body as RaiseDisputeInput;
    const dispute = await disputeService.raise(
      req.params.id as string,
      req.auth!.userId,
      isStaff(req),
      reason,
    );
    res.status(201).json({ success: true, data: { dispute } });
  },

  async listDisputes(req: Request, res: Response) {
    const deal = await dealPipelineService.getByIdOrThrow(req.params.id as string);
    dealPipelineService.assertParticipantOrStaff(deal, req.auth!.userId, isStaff(req));
    const disputes = await disputeService.listForDeal(req.params.id as string);
    res.status(200).json({ success: true, data: { disputes } });
  },

  async openDisputes(req: Request, res: Response) {
    if (!isStaff(req)) throw new ForbiddenError();
    const disputes = await disputeService.listOpen();
    res.status(200).json({ success: true, data: { disputes } });
  },

  async resolveDispute(req: Request, res: Response) {
    if (!isStaff(req)) throw new ForbiddenError();
    const { decision, resolution } = req.body as ResolveDisputeInput;
    const dispute = await disputeService.resolve(
      req.params.disputeId as string,
      req.auth!.userId,
      decision,
      resolution,
    );
    res.status(200).json({ success: true, data: { dispute } });
  },
};
