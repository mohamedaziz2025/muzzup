import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const ndaSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", default: null },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "signed", "declined"], default: "pending" },
    eSignRequestId: { type: String, default: null },
    signedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ndaSchema.index({ conversationId: 1 });

export type NdaDocument = HydratedDocument<InferSchemaType<typeof ndaSchema>>;

export const NdaModel = model("Nda", ndaSchema);
