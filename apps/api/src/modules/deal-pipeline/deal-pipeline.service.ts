import { DealPipelineModel, type DealPipelineDocument } from "../../models/deal-pipeline.model.js";
import { ListingModel } from "../../models/listing.model.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/errors.js";
import { DEAL_PIPELINE_STAGES, type DealPipelineStage } from "@muzzap/shared";

const STAGE_LABELS: Record<DealPipelineStage, string> = {
  loi: "Lettre d'intention",
  due_diligence: "Due diligence",
  signature: "Signature",
  asset_transfer: "Transfert des actifs",
  final_validation: "Validation finale",
};

function assertParticipantOrStaff(
  deal: DealPipelineDocument,
  userId: string,
  isStaff: boolean,
) {
  const isParticipant = deal.buyerId.toString() === userId || deal.sellerId.toString() === userId;
  if (!isParticipant && !isStaff) {
    throw new ForbiddenError("Vous ne participez pas à cette transaction");
  }
}

export const dealPipelineService = {
  /** Only Muzzap staff open a pipeline — it formalizes that a serious offer has been made off-platform-chat. */
  async create(listingId: string, buyerId: string) {
    const listing = await ListingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundError("Annonce introuvable");
    if (listing.sellerId.toString() === buyerId) {
      throw new BadRequestError("L'acheteur ne peut pas être le vendeur de l'annonce");
    }

    const existing = await DealPipelineModel.findOne({
      listingId,
      buyerId,
      status: { $in: ["active", "frozen"] },
    }).exec();
    if (existing) return existing;

    return DealPipelineModel.create({
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      stage: "loi",
      status: "active",
      stageHistory: [],
    });
  },

  async getByIdOrThrow(id: string) {
    const deal = await DealPipelineModel.findById(id).exec();
    if (!deal) throw new NotFoundError("Transaction introuvable");
    return deal;
  },

  async listForUser(userId: string) {
    return DealPipelineModel.find({ $or: [{ buyerId: userId }, { sellerId: userId }] })
      .sort({ updatedAt: -1 })
      .populate("listingId", "title type")
      .exec();
  },

  listAll() {
    return DealPipelineModel.find().sort({ updatedAt: -1 }).populate("listingId", "title type").exec();
  },

  /** Every stage transition is validated by an admin — no automated progression. */
  async advanceStage(dealId: string, adminId: string, targetStage: DealPipelineStage, notes?: string) {
    const deal = await this.getByIdOrThrow(dealId);
    if (deal.status !== "active") {
      throw new BadRequestError("Cette transaction n'est pas active (gelée ou clôturée)");
    }

    const currentIndex = DEAL_PIPELINE_STAGES.indexOf(deal.stage as DealPipelineStage);
    const targetIndex = DEAL_PIPELINE_STAGES.indexOf(targetStage);
    if (targetIndex !== currentIndex + 1) {
      throw new BadRequestError("Les étapes du pipeline doivent être validées dans l'ordre");
    }

    deal.stage = targetStage;
    deal.stageHistory.push({
      stage: targetStage,
      enteredAt: new Date(),
      validatedBy: adminId,
      notes: notes ?? "",
    } as unknown as (typeof deal.stageHistory)[number]);

    if (targetStage === "final_validation") {
      deal.status = "completed";
    }
    await deal.save();

    for (const userId of [deal.buyerId.toString(), deal.sellerId.toString()]) {
      await notificationsService.create(
        userId,
        "system",
        "Votre transaction a avancé",
        `Étape « ${STAGE_LABELS[targetStage]} » validée par l'équipe MUZZUP.`,
        `/transactions/${deal._id.toString()}`,
      );
    }

    return deal;
  },

  async freeze(dealId: string, actorId: string, isStaff: boolean, reason: string) {
    const deal = await this.getByIdOrThrow(dealId);
    assertParticipantOrStaff(deal, actorId, isStaff);
    deal.status = "frozen";
    deal.frozenReason = reason;
    await deal.save();
    return deal;
  },

  async unfreeze(dealId: string) {
    const deal = await this.getByIdOrThrow(dealId);
    deal.status = "active";
    deal.frozenReason = null;
    await deal.save();
    return deal;
  },

  assertParticipantOrStaff,
};
