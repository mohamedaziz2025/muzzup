import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { LISTING_TYPES } from "@muzzap/shared";

const valuationMultipleSchema = new Schema(
  {
    type: { type: String, enum: LISTING_TYPES, required: true, unique: true },
    profitMultipleLow: { type: Number, required: true, min: 0 },
    profitMultipleHigh: { type: Number, required: true, min: 0 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export type ValuationMultipleDocument = HydratedDocument<
  InferSchemaType<typeof valuationMultipleSchema>
>;

export const ValuationMultipleModel = model("ValuationMultiple", valuationMultipleSchema);
