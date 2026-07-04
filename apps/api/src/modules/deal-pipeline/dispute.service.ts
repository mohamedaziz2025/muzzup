import { DisputeModel } from "../../models/dispute.model.js";
import { dealPipelineService } from "./deal-pipeline.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";

export const disputeService = {
  async raise(dealId: string, raisedBy: string, isStaff: boolean, reason: string) {
    const existing = await DisputeModel.findOne({ dealPipelineId: dealId, status: "open" }).exec();
    if (existing) throw new ConflictError("Un litige est déjà ouvert pour cette transaction");

    const deal = await dealPipelineService.freeze(dealId, raisedBy, isStaff, `Litige : ${reason}`);
    const dispute = await DisputeModel.create({ dealPipelineId: dealId, raisedBy, reason });

    const otherParty =
      deal.buyerId.toString() === raisedBy ? deal.sellerId.toString() : deal.buyerId.toString();
    await notificationsService.create(
      otherParty,
      "system",
      "Un litige a été ouvert sur votre transaction",
      "La transaction est gelée en attendant la résolution par l'équipe MUZZUP.",
      `/transactions/${dealId}`,
    );

    return dispute;
  },

  listForDeal(dealId: string) {
    return DisputeModel.find({ dealPipelineId: dealId }).sort({ createdAt: -1 }).exec();
  },

  listOpen() {
    return DisputeModel.find({ status: "open" })
      .sort({ createdAt: 1 })
      .populate("dealPipelineId")
      .exec();
  },

  async resolve(
    disputeId: string,
    adminId: string,
    decision: "resolved" | "dismissed",
    resolution: string,
  ) {
    const dispute = await DisputeModel.findById(disputeId).exec();
    if (!dispute) throw new NotFoundError("Litige introuvable");
    if (dispute.status !== "open") throw new ConflictError("Ce litige a déjà été traité");

    dispute.status = decision;
    dispute.resolution = resolution;
    dispute.resolvedBy = adminId as unknown as NonNullable<typeof dispute.resolvedBy>;
    dispute.resolvedAt = new Date();
    await dispute.save();

    await dealPipelineService.unfreeze(dispute.dealPipelineId.toString());

    return dispute;
  },
};
