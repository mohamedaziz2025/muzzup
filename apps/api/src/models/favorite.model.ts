import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const favoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export type FavoriteDocument = HydratedDocument<InferSchemaType<typeof favoriteSchema>>;

export const FavoriteModel = model("Favorite", favoriteSchema);
