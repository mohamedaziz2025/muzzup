import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const sponsoredPlacementSchema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "ServiceProvider", required: true },
    stripeCheckoutSessionId: { type: String, required: true },
    status: { type: String, enum: ["pending", "active", "expired"], default: "pending" },
    activeFrom: { type: Date, default: null },
    activeUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

sponsoredPlacementSchema.index({ providerId: 1, status: 1 });

export type SponsoredPlacementDocument = HydratedDocument<
  InferSchemaType<typeof sponsoredPlacementSchema>
>;

export const SponsoredPlacementModel = model("SponsoredPlacement", sponsoredPlacementSchema);
