import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { DEAL_PIPELINE_STAGES } from "@muzzap/shared";

const dealPipelineSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", default: null },

    stage: { type: String, enum: DEAL_PIPELINE_STAGES, default: "loi" },
    status: { type: String, enum: ["active", "frozen", "completed", "cancelled"], default: "active" },
    frozenReason: { type: String, default: null },
    // Set by admins once buyer/seller settle on a final price; drives commission computation.
    agreedPrice: { type: Number, default: null },

    stageHistory: {
      type: [
        {
          stage: { type: String, enum: DEAL_PIPELINE_STAGES, required: true },
          enteredAt: { type: Date, default: Date.now },
          validatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
          notes: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

dealPipelineSchema.index({ buyerId: 1, status: 1 });
dealPipelineSchema.index({ sellerId: 1, status: 1 });
dealPipelineSchema.index({ listingId: 1 });

export type DealPipelineDocument = HydratedDocument<InferSchemaType<typeof dealPipelineSchema>>;

export const DealPipelineModel = model("DealPipeline", dealPipelineSchema);
