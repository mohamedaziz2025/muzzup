import { HalalAuditModel, type HalalAuditDocument } from "../../models/halal-audit.model.js";
import { HalalChecklistTemplateModel } from "../../models/halal-checklist-template.model.js";
import { listingsService } from "../listings/listings.service.js";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.js";

const QUEUE_SLA_DAYS_PER_AUDIT = 1;

export const halalAuditService = {
  /** Called by the listings controller right after a listing transitions to "submitted". */
  async createForListing(listingId: string, sellerId: string) {
    const template = await HalalChecklistTemplateModel.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();
    if (!template) {
      throw new BadRequestError("Aucune checklist d'audit halal active n'est configurée");
    }

    return HalalAuditModel.create({
      listingId,
      sellerId,
      templateId: template._id,
      status: "queued",
      items: template.items.map((item) => ({
        key: item.key,
        label: item.label,
        passed: null,
        note: "",
      })),
      journal: [{ action: "created", actorId: sellerId }],
    });
  },

  async getQueuePosition(listingId: string) {
    const audit = await HalalAuditModel.findOne({ listingId }).sort({ createdAt: -1 }).exec();
    if (!audit || audit.status === "completed") return null;

    const position = await HalalAuditModel.countDocuments({
      status: "queued",
      createdAt: { $lte: audit.createdAt as Date },
    }).exec();

    return {
      status: audit.status,
      position,
      estimatedDays: position * QUEUE_SLA_DAYS_PER_AUDIT,
    };
  },

  listQueue() {
    return HalalAuditModel.find({ status: "queued" })
      .sort({ createdAt: 1 })
      .populate("listingId", "title type sector")
      .exec();
  },

  listMine(auditorId: string) {
    return HalalAuditModel.find({ auditorId, status: "in_progress" })
      .sort({ claimedAt: -1 })
      .populate("listingId", "title type sector")
      .exec();
  },

  async claim(auditId: string, auditorId: string) {
    const audit = await HalalAuditModel.findById(auditId).exec();
    if (!audit) throw new NotFoundError("Audit introuvable");
    if (audit.status !== "queued") {
      throw new ConflictError("Cet audit a déjà été pris en charge");
    }
    audit.status = "in_progress";
    audit.auditorId = auditorId as unknown as NonNullable<HalalAuditDocument["auditorId"]>;
    audit.claimedAt = new Date();
    audit.journal.push({
      action: "claimed",
      actorId: auditorId,
    } as unknown as (typeof audit.journal)[number]);
    await audit.save();
    return audit;
  },

  async updateItems(
    auditId: string,
    auditorId: string,
    items: { key: string; passed: boolean; note?: string | undefined }[],
  ) {
    const audit = await this.assertAssignedAuditor(auditId, auditorId);
    for (const update of items) {
      const item = audit.items.find((i) => i.key === update.key);
      if (item) {
        item.passed = update.passed;
        item.note = update.note ?? "";
      }
    }
    await audit.save();
    return audit;
  },

  async complete(
    auditId: string,
    auditorId: string,
    decision: "approved" | "rejected",
    vigilancePoints: string[],
    reportSummary: string,
  ) {
    const audit = await this.assertAssignedAuditor(auditId, auditorId);

    if (decision === "approved" && audit.items.some((i) => i.passed !== true)) {
      throw new BadRequestError(
        "Tous les points de la checklist doivent être validés pour approuver l'annonce",
      );
    }

    audit.status = "completed";
    audit.decision = decision;
    audit.vigilancePoints = vigilancePoints;
    audit.reportSummary = reportSummary;
    audit.completedAt = new Date();
    audit.journal.push({
      action: `completed:${decision}`,
      actorId: auditorId,
    } as unknown as (typeof audit.journal)[number]);
    await audit.save();

    if (decision === "approved") {
      await listingsService.publish(audit.listingId.toString());
      await listingsService.markHalalVerified(audit.listingId.toString());
    } else {
      await listingsService.reject(
        audit.listingId.toString(),
        reportSummary || "L'annonce ne respecte pas les critères Sharia requis.",
      );
    }

    return audit;
  },

  async assertAssignedAuditor(auditId: string, auditorId: string) {
    const audit = await HalalAuditModel.findById(auditId).exec();
    if (!audit) throw new NotFoundError("Audit introuvable");
    if (audit.status !== "in_progress" || audit.auditorId?.toString() !== auditorId) {
      throw new ForbiddenError("Cet audit ne vous est pas assigné");
    }
    return audit;
  },
};
