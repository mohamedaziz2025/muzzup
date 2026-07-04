import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "canceled", "unpaid", "incomplete"],
      required: true,
    },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1 }, { unique: true });
subscriptionSchema.index({ status: 1 });

export type SubscriptionDocument = HydratedDocument<InferSchemaType<typeof subscriptionSchema>>;

export const SubscriptionModel = model("Subscription", subscriptionSchema);
