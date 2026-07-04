import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const CMS_LOCALES = ["fr", "en", "ar"] as const;
export type CmsLocale = (typeof CMS_LOCALES)[number];

const cmsContentSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    locale: { type: String, enum: CMS_LOCALES, required: true },
    value: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

cmsContentSchema.index({ key: 1, locale: 1 }, { unique: true });

export type CmsContentDocument = HydratedDocument<InferSchemaType<typeof cmsContentSchema>>;

export const CmsContentModel = model("CmsContent", cmsContentSchema);
