import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const checklistItemSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const halalChecklistTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    items: { type: [checklistItemSchema], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

halalChecklistTemplateSchema.index({ isActive: 1, createdAt: -1 });

export type HalalChecklistTemplateDocument = HydratedDocument<
  InferSchemaType<typeof halalChecklistTemplateSchema>
>;

export const HalalChecklistTemplateModel = model(
  "HalalChecklistTemplate",
  halalChecklistTemplateSchema,
);
