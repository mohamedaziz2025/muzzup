import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const disputeSchema = new Schema(
  {
    dealPipelineId: { type: Schema.Types.ObjectId, ref: "DealPipeline", required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["open", "resolved", "dismissed"], default: "open" },
    resolution: { type: String, default: null },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

disputeSchema.index({ dealPipelineId: 1, status: 1 });

export type DisputeDocument = HydratedDocument<InferSchemaType<typeof disputeSchema>>;

export const DisputeModel = model("Dispute", disputeSchema);
