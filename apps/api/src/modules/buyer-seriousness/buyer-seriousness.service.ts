import { BuyerSeriousnessModel } from "../../models/buyer-seriousness.model.js";
import { UserModel } from "../../models/user.model.js";
import { kycProvider } from "../../lib/providers/kyc-provider.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";

export const buyerSeriousnessService = {
  async getOrCreate(userId: string) {
    let record = await BuyerSeriousnessModel.findOne({ userId }).exec();
    record ??= await BuyerSeriousnessModel.create({ userId, tier: "declarative" });
    return record;
  },

  /** Palier 2 : justificatif de fonds pour les transactions au-delà de 30K€. */
  async declareProofOfFunds(userId: string, storageKey: string, amountDeclared: number) {
    if (amountDeclared < 30_000) {
      throw new BadRequestError(
        "Le justificatif de fonds n'est requis que pour les transactions supérieures à 30 000€",
      );
    }
    const record = await this.getOrCreate(userId);
    record.proofOfFunds = {
      storageKey,
      amountDeclared,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
    } as unknown as NonNullable<typeof record.proofOfFunds>;
    await record.save();
    return record;
  },

  async reviewProofOfFunds(
    userId: string,
    reviewerId: string,
    decision: "approve" | "reject",
    rejectionReason?: string,
  ) {
    const record = await BuyerSeriousnessModel.findOne({ userId }).exec();
    if (!record || record.proofOfFunds.status !== "pending") {
      throw new NotFoundError("Aucun justificatif de fonds en attente pour cet utilisateur");
    }

    record.proofOfFunds.status = decision === "approve" ? "approved" : "rejected";
    record.proofOfFunds.reviewedBy = reviewerId as unknown as NonNullable<
      typeof record.proofOfFunds.reviewedBy
    >;
    record.proofOfFunds.reviewedAt = new Date();
    record.proofOfFunds.rejectionReason = decision === "reject" ? (rejectionReason ?? null) : null;
    if (decision === "approve") record.tier = "proof_of_funds";
    await record.save();

    await notificationsService.create(
      userId,
      "system",
      decision === "approve" ? "Justificatif de fonds validé" : "Justificatif de fonds rejeté",
      decision === "approve"
        ? "Votre palier de sérieux acheteur a été mis à jour."
        : (rejectionReason ?? "Votre justificatif de fonds n'a pas été accepté."),
    );

    return record;
  },

  /** Palier 3 : KYC renforcé via le prestataire externe (SumSub). */
  async startKyc(userId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");

    const { sessionId, url } = await kycProvider.createVerificationSession(userId, user.email);

    const record = await this.getOrCreate(userId);
    record.kycSessionId = sessionId;
    await record.save();

    user.kycStatus = "pending";
    await user.save();

    return { sessionId, url };
  },

  /** Dev-only stand-in for the SumSub completion webhook until that integration is wired in. */
  async completeKyc(userId: string, approved: boolean) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    user.kycStatus = approved ? "verified" : "rejected";
    await user.save();

    if (approved) {
      const record = await this.getOrCreate(userId);
      record.tier = "kyc_enhanced";
      await record.save();
    }
    return user;
  },
};
