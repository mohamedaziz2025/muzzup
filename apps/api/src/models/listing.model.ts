import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { LISTING_TYPES, LISTING_STATUSES, ACQUISITION_CHANNELS } from "@muzzap/shared";

const financialsSchema = new Schema(
  {
    monthlyRevenue: { type: Number, required: true, min: 0 },
    monthlyProfit: { type: Number, required: true },
    annualRevenue: { type: Number, required: true, min: 0 },
    annualProfit: { type: Number, required: true },
    askingPrice: { type: Number, required: true, min: 0 },
    valuationMultiple: { type: Number, default: null },
  },
  { _id: false },
);

const versionSchema = new Schema(
  {
    snapshot: { type: Schema.Types.Mixed, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const listingSchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: LISTING_TYPES, required: true },
    status: { type: String, enum: LISTING_STATUSES, default: "draft" },

    title: { type: String, required: true, trim: true, maxlength: 140 },
    summary: { type: String, required: true, trim: true, maxlength: 1000 },
    sector: { type: String, required: true, trim: true, maxlength: 80 },
    foundedAt: { type: Date, required: true },
    acquisitionChannels: {
      type: [{ type: String, enum: ACQUISITION_CHANNELS }],
      default: [],
    },

    financials: { type: financialsSchema, required: true },
    halalSelfChecklist: { type: Map, of: Boolean, default: {} },
    halalVerified: { type: Boolean, default: false },

    isFeatured: { type: Boolean, default: false },
    rejectionReason: { type: String, default: null },

    versions: { type: [versionSchema], default: [] },

    viewsCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
    soldAt: { type: Date, default: null },
  },
  { timestamps: true },
);

listingSchema.index({ title: "text", summary: "text", sector: "text" });
listingSchema.index({ status: 1, type: 1, "financials.askingPrice": 1 });
listingSchema.index({ status: 1, sector: 1 });
listingSchema.index({ status: 1, "financials.annualProfit": -1 });
listingSchema.index({ status: 1, isFeatured: 1, publishedAt: -1 });
listingSchema.index({ sellerId: 1, status: 1 });

export type ListingDocument = HydratedDocument<InferSchemaType<typeof listingSchema>>;

export const ListingModel = model("Listing", listingSchema);
