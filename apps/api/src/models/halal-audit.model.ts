import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const auditItemResultSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    passed: { type: Boolean, default: null },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const HALAL_AUDIT_STATUSES = ["queued", "in_progress", "completed"] as const;
const HALAL_AUDIT_DECISIONS = ["approved", "rejected"] as const;

const halalAuditSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    auditorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    templateId: { type: Schema.Types.ObjectId, ref: "HalalChecklistTemplate", required: true },

    status: { type: String, enum: HALAL_AUDIT_STATUSES, default: "queued" },
    decision: { type: String, enum: HALAL_AUDIT_DECISIONS, default: null },

    items: { type: [auditItemResultSchema], default: [] },
    vigilancePoints: { type: [String], default: [] },
    reportSummary: { type: String, default: "" },

    claimedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // Full journal of status/decision transitions for the audit trail.
    journal: {
      type: [
        {
          action: { type: String, required: true },
          actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          at: { type: Date, default: Date.now },
          metadata: { type: Schema.Types.Mixed, default: {} },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

halalAuditSchema.index({ status: 1, createdAt: 1 });
halalAuditSchema.index({ listingId: 1 });
halalAuditSchema.index({ auditorId: 1, status: 1 });

export type HalalAuditDocument = HydratedDocument<InferSchemaType<typeof halalAuditSchema>>;
export type HalalAuditStatus = (typeof HALAL_AUDIT_STATUSES)[number];

export const HalalAuditModel = model("HalalAudit", halalAuditSchema);
