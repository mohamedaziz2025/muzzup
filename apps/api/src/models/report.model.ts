import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const REPORT_TARGET_TYPES = ["user", "listing", "message", "conversation"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

const reportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: REPORT_TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 100 },
    details: { type: String, default: "" },
    status: { type: String, enum: REPORT_STATUSES, default: "open" },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
    resolutionNote: { type: String, default: null },
  },
  { timestamps: true },
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

export type ReportDocument = HydratedDocument<InferSchemaType<typeof reportSchema>>;

export const ReportModel = model("Report", reportSchema);
