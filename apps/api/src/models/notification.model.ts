import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const NOTIFICATION_TYPES = [
  "listing_published",
  "listing_rejected",
  "subscription_activated",
  "subscription_cancelled",
  "system",
] as const;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });

export type NotificationDocument = HydratedDocument<InferSchemaType<typeof notificationSchema>>;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NotificationModel = model("Notification", notificationSchema);
