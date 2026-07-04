import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const AI_ANALYSIS_TYPES = ["deep_valuation", "listing_coherence", "document_halal_check"] as const;

const aiAnalysisSchema = new Schema(
  {
    type: { type: String, enum: AI_ANALYSIS_TYPES, required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", default: null },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
    // "L'IA prépare, l'humain valide" — filled in later by an auditor/admin reviewing the output.
    humanVerdict: {
      type: String,
      enum: ["confirmed", "overridden", null],
      default: null,
    },
    humanVerdictBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    humanVerdictNote: { type: String, default: null },
  },
  { timestamps: true },
);

aiAnalysisSchema.index({ listingId: 1, type: 1, createdAt: -1 });

export type AiAnalysisDocument = HydratedDocument<InferSchemaType<typeof aiAnalysisSchema>>;
export type AiAnalysisType = (typeof AI_ANALYSIS_TYPES)[number];

export const AiAnalysisModel = model("AiAnalysis", aiAnalysisSchema);
