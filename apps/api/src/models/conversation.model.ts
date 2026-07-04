import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { REVEAL_PHASES } from "@muzzap/shared";

const conversationSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", default: null },
    participantIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length === 2,
        message: "Une conversation relie exactement deux participants",
      },
    },
    revealPhase: { type: String, enum: REVEAL_PHASES, default: "anonymous" },
    revealHistory: {
      type: [
        {
          phase: { type: String, enum: REVEAL_PHASES, required: true },
          unlockedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    ndaId: { type: Schema.Types.ObjectId, ref: "Nda", default: null },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    lastMessageAt: { type: Date, default: null },
    lastMessagePreview: { type: String, default: null },
    lastMessageSenderId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    flaggedCount: { type: Number, default: 0 },
    adminBlocked: { type: Boolean, default: false },
    adminBlockedReason: { type: String, default: null },
  },
  { timestamps: true },
);

conversationSchema.index({ participantIds: 1, updatedAt: -1 });
conversationSchema.index({ listingId: 1 });

export type ConversationDocument = HydratedDocument<InferSchemaType<typeof conversationSchema>>;

export const ConversationModel = model("Conversation", conversationSchema);
