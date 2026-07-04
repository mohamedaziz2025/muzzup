import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { BUYER_SERIOUSNESS_TIERS } from "@muzzap/shared";

const proofOfFundsSchema = new Schema(
  {
    storageKey: { type: String, default: null },
    amountDeclared: { type: Number, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
  },
  { _id: false },
);

const buyerSeriousnessSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    tier: { type: String, enum: BUYER_SERIOUSNESS_TIERS, default: "declarative" },
    proofOfFunds: { type: proofOfFundsSchema, required: true, default: () => ({}) },
    kycSessionId: { type: String, default: null },
  },
  { timestamps: true },
);

export type BuyerSeriousnessDocument = HydratedDocument<
  InferSchemaType<typeof buyerSeriousnessSchema>
>;

export const BuyerSeriousnessModel = model("BuyerSeriousness", buyerSeriousnessSchema);
