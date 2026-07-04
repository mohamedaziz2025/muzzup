import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    flagged: { type: Boolean, default: false },
    flagReason: { type: String, default: null },
    readBy: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
    // Moderation soft-delete: body is overwritten with a redaction notice, never restored via the API.
    deletedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export type MessageDocument = HydratedDocument<InferSchemaType<typeof messageSchema>>;

export const MessageModel = model("Message", messageSchema);
