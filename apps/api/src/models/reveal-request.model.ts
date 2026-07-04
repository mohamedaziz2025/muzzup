import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { REVEAL_PHASES } from "@muzzap/shared";

const revealRequestSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetPhase: { type: String, enum: REVEAL_PHASES, required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

revealRequestSchema.index({ conversationId: 1, status: 1 });

export type RevealRequestDocument = HydratedDocument<InferSchemaType<typeof revealRequestSchema>>;

export const RevealRequestModel = model("RevealRequest", revealRequestSchema);
