import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const portfolioItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    url: { type: String, default: null },
    description: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: false },
);

const serviceProviderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    tagline: { type: String, required: true, trim: true, maxlength: 140 },
    bio: { type: String, required: true, trim: true, maxlength: 2000 },
    specialties: { type: [String], default: [] },
    pricingIndication: { type: String, trim: true, maxlength: 140, default: "" },
    portfolio: { type: [portfolioItemSchema], default: [] },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    isSponsored: { type: Boolean, default: false },
    sponsoredUntil: { type: Date, default: null },

    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true },
);

serviceProviderSchema.index({ specialties: 1, status: 1 });
serviceProviderSchema.index({ isSponsored: -1, ratingAverage: -1 });
serviceProviderSchema.index({ tagline: "text", bio: "text", specialties: "text" });

export type ServiceProviderDocument = HydratedDocument<
  InferSchemaType<typeof serviceProviderSchema>
>;

export const ServiceProviderModel = model("ServiceProvider", serviceProviderSchema);
