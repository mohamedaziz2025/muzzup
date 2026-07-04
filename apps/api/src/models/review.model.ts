import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const reviewSchema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "ServiceProvider", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    missionContext: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true },
);

reviewSchema.index({ providerId: 1, authorId: 1 }, { unique: true });
reviewSchema.index({ providerId: 1, createdAt: -1 });

export type ReviewDocument = HydratedDocument<InferSchemaType<typeof reviewSchema>>;

export const ReviewModel = model("Review", reviewSchema);
